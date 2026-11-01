'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('..');
const sourceLoader = require('../scripts/source-test-loader');

const methods = [
  ['isIterable', Symbol.iterator],
  ['isAsyncIterable', Symbol.asyncIterator],
  ['isIteratorLike', 'next'],
  ['isPromiseLike', 'then']
];

for (const [name, key] of methods) {
  test(`${name} reads only its public method properties and never calls the result`, () => {
    const trace = [];
    const callable = new Proxy(function () {}, {
      apply() {
        assert.fail('Capability detection must not invoke the method');
      },
      get() {
        assert.fail('Capability detection must not inspect the method itself');
      }
    });
    const input = new Proxy(Object.create(null), {
      get(target, property) {
        trace.push(property);
        if (property === key) return callable;
        assert.fail('Unexpected property read');
      },
      has() {
        assert.fail('Capability detection must use the actual property value');
      },
      getPrototypeOf() {
        assert.fail('Capability detection must not inspect the prototype chain directly');
      }
    });
    assert.equal(T[name](input), true);
    assert.deepEqual(trace, [key]);
  });
}

test('capabilities are read afresh; class and revoked function methods are not execution guarantees', () => {
  const revoked = Proxy.revocable(function () {}, {});
  revoked.revoke();
  const nonCallable = {
    [Symbol.toPrimitive]() {
      assert.fail('Do not coerce a method');
    }
  };
  for (const [name, key] of methods) {
    const prototype = { [key]: function () {} };
    const input = Object.create(prototype);
    for (const [method, expected] of [
      [function () {}, true],
      [class Method {}, true],
      [revoked.proxy, true],
      [undefined, false],
      [null, false],
      [0, false],
      [nonCallable, false]
    ]) {
      prototype[key] = method;
      assert.equal(T[name](input), expected, name);
    }
    Object.defineProperty(prototype, key, {
      get() {
        throw nonCallable;
      }
    });
    assert.throws(
      () => T[name](input),
      (error) => error === nonCallable
    );
    assert.throws(
      () => T[name](Proxy.revocable(input, {}).proxy),
      (error) => error === nonCallable
    );
  }
});

test('promise-like detection reads then once without inspecting catch or finally', () => {
  const trace = [];
  let method = 0;
  const input = {
    get then() {
      trace.push('then');
      return method;
    },
    get catch() {
      return assert.fail('Do not read catch');
    },
    get finally() {
      return assert.fail('Do not read finally');
    }
  };
  assert.equal(T.isPromiseLike(input), false);
  assert.deepEqual(trace, ['then']);
  trace.length = 0;
  method = () => assert.fail('Do not invoke then');
  assert.equal(T.isPromiseLike(input), true);
  assert.deepEqual(trace, ['then']);
});

test('object-only capabilities ignore primitive prototype methods and accept boxed containers', () => {
  const realm = vm.createContext({});
  vm.runInContext(sourceLoader(), realm);
  // Set primitive prototype properties only in this isolated realm. Primitive
  // next/then shapes remain outside the object-only capability contracts.
  vm.runInContext(
    `
    Number.prototype.next = function () {};
    Number.prototype.then = function () {};
    globalThis.primitive = 7;
    globalThis.boxed = new Number(7);
  `,
    realm
  );
  for (const api of [T, realm.Types]) {
    for (const name of ['isIteratorLike', 'isPromiseLike']) {
      assert.equal(api[name](realm.primitive), false, name);
      assert.equal(api[name](realm.boxed), true, name);
    }
  }
});

test('Promise instance detection is realm-local, live and does not read payload properties', () => {
  const realm = vm.createContext({});
  vm.runInContext(sourceLoader(), realm);
  const Original = vm.runInContext('Promise', realm);
  const Replacement = vm.runInNewContext('Promise');
  const original = Original.resolve(1);
  const replacement = Replacement.resolve(2);
  for (const value of [original, replacement]) {
    for (const key of ['then', 'catch', 'constructor', Symbol.toStringTag]) {
      Object.defineProperty(value, key, {
        get() {
          return assert.fail('Do not inspect promise payloads');
        }
      });
    }
  }
  assert.equal(realm.Types.isPromise(original), true);
  assert.equal(realm.Types.isPromise(replacement), false);
  realm.Promise = Replacement;
  assert.equal(realm.Types.isPromise(original), false);
  assert.equal(realm.Types.isPromise(replacement), true);
  assert.equal(realm.Types.isPromise(Object.create(Replacement.prototype)), true);
  const sentinel = new Error('Prototype access failed');
  assert.throws(
    () =>
      realm.Types.isPromise(
        new Proxy(
          {},
          {
            getPrototypeOf() {
              throw sentinel;
            }
          }
        )
      ),
    (error) => error === sentinel
  );
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  realm.Promise = undefined;
  assert.equal(realm.Types.isPromise(revoked.proxy), false);
});
