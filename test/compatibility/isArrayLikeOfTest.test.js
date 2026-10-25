'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isArrayLikeOf } = require('../../');

suite('#isArrayLikeOf', function () {
  test('true', function () {
    assert.equal(isArrayLikeOf('abc', 'string'), true);
    assert.equal(isArrayLikeOf({ 0: 'a', 1: 'b', length: 2 }, 'string'), true);

    assert.equal(isArrayLikeOf([undefined], 'undefined'), true);
    assert.equal(
      isArrayLikeOf([null], (value) => value === null),
      true
    );
    assert.equal(isArrayLikeOf([true], 'boolean'), true);
    assert.equal(isArrayLikeOf([1, 2], 'number'), true);
    assert.equal(isArrayLikeOf(['a', 'b'], 'string'), true);
    assert.equal(
      isArrayLikeOf([{ a: 1 }, { b: 2 }], (value) => value instanceof Object),
      true
    );
    assert.equal(
      isArrayLikeOf([1, new Number(2)], (value) => typeof value === 'number' || value instanceof Number),
      true
    );
  });

  test('false', function () {
    assert.equal(isArrayLikeOf('123', 'number'), false);
    assert.equal(isArrayLikeOf({ 0: 'a', 1: 'b', length: 2 }, 'number'), false);

    assert.throws(() => isArrayLikeOf(), TypeError);
    assert.equal(isArrayLikeOf([], 'number'), true);
    assert.equal(isArrayLikeOf([1, '2'], 'number'), false);
    assert.equal(isArrayLikeOf([1, new Number(2)], 'number'), false);
  });
});
