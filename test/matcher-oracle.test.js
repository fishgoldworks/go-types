'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('..');
const cases = [
  { values: [], matcher: 'number', expected: true },
  { values: [1, 2], matcher: 'number', expected: true },
  { values: [1, '2'], matcher: 'number', expected: false },
  { values: [null], matcher: 'object', expected: true },
  { values: [null], matcher: T.isObject, expected: false },
  { values: [new Number(1)], matcher: 'number', expected: false },
  { values: [new Number(1)], matcher: T.isNumber, expected: true },
  { values: [1, null], matcher: (value) => value === null || typeof value === 'number', expected: true },
  { values: [1, false], matcher: (value) => value === null || typeof value === 'number', expected: false }
];
for (const [index, item] of cases.entries()) {
  test('collection contracts agree for fixed input ' + index, () => {
    assert.equal(T.isArrayOf(item.values, item.matcher), item.expected);
    assert.equal(T.isArrayLikeOf(item.values, item.matcher), item.expected);
    assert.equal(T.isSetOf(new Set(item.values), item.matcher), item.expected);
    assert.equal(
      T.isMapOf(new Map(item.values.map((value, key) => [key, value])), 'number', item.matcher),
      item.expected
    );
  });
}
