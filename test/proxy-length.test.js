'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('..');
for (const length of [-1, 0.5, NaN, Infinity, '1', 1n, undefined, 2 ** 32]) {
  test(`invalid exposed array length: ${String(length)} (${typeof length})`, () => {
    let memberReads = 0;
    const value = new Proxy([], {
      get(target, key, receiver) {
        if (key === 'length') return length;
        return Reflect.get(target, key, receiver);
      },
      getOwnPropertyDescriptor(target, key) {
        if (key === '0') {
          memberReads++;
          throw new Error('Array members inspected before validating length');
        }
        return Reflect.getOwnPropertyDescriptor(target, key);
      }
    });
    assert.equal(memberReads, 0);
    assert.equal(T.isArrayOf(value, 'number'), false);
  });
}
test('array content validation reads a valid proxy length once', () => {
  let reads = 0;
  const value = new Proxy([1], {
    get(target, key, receiver) {
      if (key === 'length') reads++;
      return Reflect.get(target, key, receiver);
    }
  });
  assert.equal(T.isArrayOf(value, 'number'), true);
  assert.equal(reads, 1);
});
