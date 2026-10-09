'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isNumber } = require('../../');

suite('#isNumber', function () {
  test('true', function () {
    assert.equal(isNumber(0), true);
    assert.equal(isNumber(-0.1), true);
    assert.equal(isNumber(new Number(1)), true);
    assert.equal(isNumber(Number.MAX_VALUE), true);
    assert.equal(isNumber(Number.MIN_VALUE), true);
    assert.equal(isNumber(Number.POSITIVE_INFINITY), true);
    assert.equal(isNumber(Number.NEGATIVE_INFINITY), true);
    assert.equal(isNumber(Number.NaN), true);
  });

  test('false', function () {
    assert.equal(isNumber(), false);
    assert.equal(isNumber(undefined), false);
    assert.equal(isNumber(null), false);
    assert.equal(isNumber(false), false);
    assert.equal(isNumber('0'), false);
    assert.equal(isNumber(Number), false);
    assert.equal(isNumber({}), false);
    assert.equal(isNumber([]), false);
  });
});
