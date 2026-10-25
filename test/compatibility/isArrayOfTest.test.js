'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isArrayOf } = require('../../');

suite('#isArrayOf', function () {
  test('true', function () {
    assert.equal(isArrayOf([undefined], 'undefined'), true);
    assert.equal(
      isArrayOf([null], (value) => value === null),
      true
    );
    assert.equal(isArrayOf([true], 'boolean'), true);
    assert.equal(isArrayOf([1, 2], 'number'), true);
    assert.equal(isArrayOf(['a', 'b'], 'string'), true);
    assert.equal(
      isArrayOf([{ a: 1 }, { b: 2 }], (value) => value instanceof Object),
      true
    );
    assert.equal(
      isArrayOf([1, new Number(2)], (value) => typeof value === 'number' || value instanceof Number),
      true
    );
  });

  test('false', function () {
    assert.throws(() => isArrayOf(), TypeError);
    assert.equal(isArrayOf([], 'number'), true);
    assert.equal(isArrayOf([1, '2'], 'number'), false);
    assert.equal(isArrayOf([1, new Number(2)], 'number'), false);
  });
});
