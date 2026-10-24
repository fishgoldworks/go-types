'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const compileTypeMatcher = require('../src/util/compileTypeMatcher');
const T = require('..');

test('matcher descriptor eligibility depends on own selectors, not plain-object identity', () => {
  for (const container of [{}, Object.create(null), new Date(0), new Map(), new (class Descriptor {})()]) {
    let calls = 0;
    Object.defineProperty(container, 'predicate', {
      value(value) {
        calls++;
        assert.equal(this, undefined);
        assert.equal(arguments.length, 1);
        return value === 7;
      }
    });
    Object.defineProperty(container, 'unrelated', {
      get() {
        throw new Error('Unrelated configuration must not be read');
      }
    });
    const check = compileTypeMatcher(container);
    assert.equal(calls, 0);
    assert.equal(check(7), true);
    assert.equal(check(8), false);
    assert.equal(calls, 2);
  }
});

test('snapshotted shared arrays and selectors can be revoked without invalidating an existing checker', () => {
  let answer = false;
  let calls = 0;
  const descriptor = Proxy.revocable(
    {
      predicate() {
        calls++;
        return answer;
      }
    },
    {}
  );
  const shared = Proxy.revocable([descriptor.proxy, 'number'], {});
  const root = Proxy.revocable([shared.proxy, shared.proxy, 'boolean'], {});
  const check = compileTypeMatcher(root.proxy);
  descriptor.revoke();
  shared.revoke();
  root.revoke();
  assert.equal(check('x'), false);
  assert.equal(calls, 2);
  answer = true;
  assert.equal(check('x'), true);
  assert.equal(calls, 3);
  assert.throws(() => compileTypeMatcher(root.proxy), TypeError);
});

test('independent compilations snapshot current configuration without modifying previous checkers', () => {
  const descriptor = { predicate: (value) => value === 1 };
  const specification = [descriptor];
  const first = compileTypeMatcher(specification);
  descriptor.predicate = (value) => value === 2;
  const second = compileTypeMatcher(specification);
  assert.equal(first(1), true);
  assert.equal(first(2), false);
  assert.equal(second(1), false);
  assert.equal(second(2), true);
  assert.equal(T.isTypeOf(1, specification), false);
  assert.equal(T.isTypeOf(2, specification), true);
});

test('failed compilation does not poison later compilation of the same repaired graph', () => {
  const failure = { reason: 'configuration trap' };
  let broken = true;
  let calls = 0;
  const shared = new Proxy(
    [
      {
        predicate() {
          calls++;
          return true;
        }
      }
    ],
    {
      getOwnPropertyDescriptor(target, key) {
        if (key === '0' && broken) throw failure;
        return Reflect.getOwnPropertyDescriptor(target, key);
      }
    }
  );
  const root = [shared, shared];
  assert.throws(
    () => compileTypeMatcher(root),
    (error) => error === failure
  );
  assert.equal(calls, 0);
  broken = false;
  const check = compileTypeMatcher(root);
  assert.equal(calls, 0);
  assert.equal(check(1), true);
  assert.equal(calls, 1);
});

test('reentrant graph checks can recover from an inner exception without losing the outer continuation', () => {
  const failure = { reason: 'inner predicate' };
  const visits = [];
  let check;
  const reject = {
    predicate(value) {
      visits.push(['reject', value]);
      return false;
    }
  };
  const nested = {
    predicate(value) {
      visits.push(['nested', value]);
      if (value === 'inner') throw failure;
      if (value === 'outer')
        assert.throws(
          () => check('inner'),
          (error) => error === failure
        );
      return false;
    }
  };
  check = compileTypeMatcher([reject, [nested, reject], 'string']);
  assert.equal(check('outer'), true);
  assert.deepEqual(visits, [
    ['reject', 'outer'],
    ['nested', 'outer'],
    ['reject', 'inner'],
    ['nested', 'inner'],
    ['reject', 'outer']
  ]);
  visits.length = 0;
  assert.equal(check(false), false);
  assert.deepEqual(visits, [
    ['reject', false],
    ['nested', false],
    ['reject', false]
  ]);
});

test('live instance-hook access can fail after compilation and remain skipped by an earlier match', () => {
  const failure = { reason: 'live instance hook access' };
  let broken = false;
  let reads = 0;
  function Target() {}
  Object.defineProperty(Target, Symbol.hasInstance, {
    get() {
      reads++;
      if (broken) throw failure;
      return (value) => value === 'accepted';
    }
  });
  const check = compileTypeMatcher(['number', { instanceOf: Target }]);
  const compilationReads = reads;
  broken = true;
  assert.equal(check(1), true);
  assert.equal(reads, compilationReads);
  assert.throws(
    () => check('x'),
    (error) => error === failure
  );
  broken = false;
  assert.equal(check('accepted'), true);
  assert.equal(check('x'), false);
});

test('native instance hooks retain truthiness while explicit predicates require primitive booleans', () => {
  const values = [undefined, null, false, true, 0, 1, '', 'yes', {}, [], Promise.resolve(false)];
  for (const result of values) {
    function Target() {}
    Object.defineProperty(Target, Symbol.hasInstance, { value: () => result });
    assert.equal(compileTypeMatcher(Target)(7), Boolean(result));
    const check = compileTypeMatcher({ predicate: () => result });
    if (typeof result === 'boolean') assert.equal(check(7), result);
    else assert.throws(() => check(7), TypeError);
  }
});

test('compiler does not subscribe to a thenable returned by an invalid synchronous predicate', () => {
  let reads = 0;
  const result = Object.defineProperty({}, 'then', {
    get() {
      reads++;
      throw new Error('then read');
    }
  });
  const check = compileTypeMatcher({ predicate: () => result });
  assert.equal(reads, 0);
  assert.throws(() => check(1), TypeError);
  assert.equal(reads, 0);
});
