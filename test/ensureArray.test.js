'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('..');

test('the revised public API exposes isNotNullish and keeps non-function-object inspection internal', () => {
  assert.equal(typeof T.isNotNullish, 'function');
  for (const name of ['isNonNullish', 'isObjectLike', 'isNonFunctionObject', 'ensureArrayIf', 'asArray']) {
    assert.equal(Object.hasOwn(T, name), false);
  }
  assert.deepEqual([0, false, '', null, undefined].filter(T.isNotNullish), [0, false, '']);
});

test('ensureArray preserves existing empty, sparse, frozen, subclassed and foreign arrays', () => {
  class Items extends Array {}
  const sparse = [];
  sparse.length = 3;
  for (const value of [
    [],
    [1, 2],
    sparse,
    Object.freeze([1]),
    new Items(1, 2),
    vm.runInNewContext('Object.freeze([1,,3])')
  ]) {
    assert.equal(typeof T.ensureArray, 'function');
    assert.equal(T.ensureArray(value), value);
  }
  assert.equal(0 in sparse, false);
});

for (const [label, value] of [
  ['undefined', undefined],
  ['null', null],
  ['zero', 0],
  ['false', false],
  ['empty string', ''],
  ['string', 'hello'],
  ['symbol', Symbol('item')],
  ['bigint', 1n],
  ['object', { id: 1 }],
  ['Set', new Set([1, 2])],
  ['Map', new Map([['a', 1]])],
  ['typed array', new Uint8Array([1, 2])],
  ['function', function item() {}],
  ['promise', Promise.resolve(1)]
]) {
  test('ensureArray wraps ' + label + ' once in a fresh array', () => {
    const first = T.ensureArray(value),
      second = T.ensureArray(value);
    assert.equal(first.length, 1);
    assert.equal(first[0], value);
    assert.notEqual(first, second);
  });
}

test('ensureArray does not read iterators, properties or coercion hooks', () => {
  const fail = () => {
    throw new Error('must not inspect');
  };
  const value = new Proxy({}, { get: fail, ownKeys: fail, getPrototypeOf: fail });
  assert.equal(T.ensureArray(value)[0], value);
  const array = new Proxy([1], { get: fail, ownKeys: fail, getPrototypeOf: fail });
  assert.equal(T.ensureArray(array), array);
});

test('ensureArray wraps array-like values and array-prototype imitations rather than extracting them', () => {
  for (const value of [{ 0: 'x', length: 1 }, Object.create(Array.prototype)]) {
    assert.equal(T.ensureArray(value).length, 1);
    assert.equal(T.ensureArray(value)[0], value);
  }
});

test('ensureArray uses its first argument when called by Array.map', () => {
  const array = [2, 3];
  const result = [1, array, null].map(T.ensureArray);
  assert.deepEqual(result, [[1], [2, 3], [null]]);
  assert.equal(result[1], array);
  assert.deepEqual(T.ensureArray(), []);
  assert.deepEqual(T.ensureArray(undefined), [undefined]);
});

test('ensureArray preserves native revoked-proxy errors', () => {
  assert.equal(typeof T.ensureArray, 'function');
  const value = Proxy.revocable([], {});
  value.revoke();
  assert.throws(() => T.ensureArray(value.proxy), TypeError);
});

test('ensureArray distinguishes omitted input from explicit nullish values and returns fresh empty arrays', () => {
  const first = T.ensureArray();
  const second = T.ensureArray();
  assert.deepEqual(first, []);
  assert.deepEqual(second, []);
  assert.notEqual(first, second);
  first.push('item');
  assert.deepEqual(second, []);
  assert.deepEqual(T.ensureArray(undefined), [undefined]);
  assert.deepEqual(T.ensureArray(null), [null]);
  assert.deepEqual([undefined, null].map(T.ensureArray), [[undefined], [null]]);
});
