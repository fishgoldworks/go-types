'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = require('../');
const checks = [
  ['array', (value) => [value], (input, matcher) => T.isArrayOf(input, matcher)],
  ['array-like', (value) => ({ 0: value, length: 1 }), (input, matcher) => T.isArrayLikeOf(input, matcher)],
  ['Set', (value) => new Set([value]), (input, matcher) => T.isSetOf(input, matcher)],
  ['Map value', (value) => new Map([['key', value]]), (input, matcher) => T.isMapOf(input, 'string', matcher)],
  ['Map key', (value) => new Map([[value, 1]]), (input, matcher) => T.isMapOf(input, matcher, 'number')]
];

test('collection-only matching does not expose retired dispatchers or source entries', () => {
  for (const name of ['isTypeOf', 'createTypeChecker', 'isInstanceOf']) {
    assert.equal(Object.hasOwn(T, name), false, name);
    assert.equal(fs.existsSync(path.join(__dirname, '../src', name + '.js')), false, name);
  }
});

for (const [name, input, check] of checks) {
  test(name + ' invokes a supplied predicate directly once with the inspected value', () => {
    const calls = [];
    const value = { id: 1 };
    assert.equal(
      check(input(value), function (actual) {
        assert.equal(this, undefined);
        calls.push([...arguments]);
        return actual === value;
      }),
      true
    );
    assert.deepEqual(calls, [[value]]);
    assert.equal(
      check(input(value), () => false),
      false
    );
  });

  test(name + ' accepts exact primitive typeof names without coercion', () => {
    for (const [value, type] of [
      [undefined, 'undefined'],
      [null, 'object'],
      [true, 'boolean'],
      [1, 'number'],
      ['x', 'string'],
      [Symbol('x'), 'symbol'],
      [BigInt(1), 'bigint'],
      [function () {}, 'function']
    ]) {
      assert.equal(check(input(value), type), true, type);
    }
    assert.equal(check(input(new Number(1)), 'number'), false);
    assert.equal(check(input(new Number(1)), T.isNumber), true);
  });

  test(name + ' rejects removed matcher forms without inspecting descriptor selectors', () => {
    let reads = 0;
    const descriptor = Object.defineProperty({}, 'predicate', {
      get() {
        reads++;
        throw Error('must not read');
      }
    });
    const cycle = [];
    cycle.push(cycle);
    for (const matcher of [
      undefined,
      null,
      true,
      1,
      Symbol('number'),
      'Number',
      '__proto__',
      'constructor',
      'toString',
      'date',
      'nubmer',
      new String('number'),
      ['number'],
      cycle,
      { predicate: T.isNumber },
      { instanceOf: Number },
      descriptor
    ]) {
      assert.throws(() => check(input(1), matcher), TypeError);
    }
    assert.equal(reads, 0);
  });

  test(name + ' rejects non-boolean predicate results and propagates callback failures', () => {
    for (const result of [undefined, null, 0, 1, '', 'yes', {}, new Boolean(true), Promise.resolve(true)]) {
      assert.throws(() => check(input(1), () => result), TypeError);
    }
    const failure = new Error('predicate failure');
    assert.throws(
      () =>
        check(input(1), () => {
          throw failure;
        }),
      (error) => error === failure
    );
  });
}

test('empty and wrong-container inputs validate required matchers without executing predicates', () => {
  let calls = 0;
  const predicate = () => {
    calls++;
    throw Error('must not execute');
  };
  for (const [check, empty] of [
    [T.isArrayOf, []],
    [T.isArrayLikeOf, { length: 0 }],
    [T.isSetOf, new Set()]
  ]) {
    assert.equal(check(empty, predicate), true);
    assert.equal(check(null, predicate), false);
    assert.throws(() => check(empty), TypeError);
    assert.throws(() => check(null), TypeError);
    assert.throws(() => check(empty, 'nubmer'), TypeError);
  }
  assert.equal(T.isMapOf(new Map(), predicate, predicate), true);
  assert.equal(T.isMapOf(null, predicate, predicate), false);
  for (const value of [new Map(), null]) {
    assert.throws(() => T.isMapOf(value), TypeError);
    assert.throws(() => T.isMapOf(value, predicate), TypeError);
    assert.throws(() => T.isMapOf(value, predicate, 'nubmer'), TypeError);
  }
  assert.equal(calls, 0);
});

test('indexed checks inspect holes and inherited entries and stop at the first mismatch', () => {
  assert.equal(T.isArrayOf(new Array(2), 'number'), false);
  assert.equal(T.isArrayOf(new Array(2), 'undefined'), true);
  const values = new Array(1);
  Object.setPrototypeOf(values, Object.assign(Object.create(Array.prototype), { 0: 2 }));
  assert.equal(T.isArrayOf(values, T.isNumber), true);
  const calls = [];
  assert.equal(
    T.isArrayOf([1, 'x', 2], (value) => {
      calls.push(value);
      return typeof value === 'number';
    }),
    false
  );
  assert.deepEqual(calls, [1, 'x']);
});

test('Map predicates keep key-before-value order and short-circuit after a failed key', () => {
  const calls = [];
  const input = new Map([
    ['one', 1],
    ['two', 2]
  ]);
  assert.equal(
    T.isMapOf(
      input,
      (key) => {
        calls.push(key);
        return key === 'one';
      },
      (value) => {
        calls.push(value);
        return typeof value === 'number';
      }
    ),
    false
  );
  assert.deepEqual(calls, ['one', 1, 'two']);
});
