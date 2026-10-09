'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isInteger } = require('../../');

suite('#isInteger', function () {
  test('true', function () {
    assert.equal(isInteger(0), true);
    assert.equal(isInteger(1.0), true);
    assert.equal(isInteger(Number.MIN_SAFE_INTEGER), true);
    assert.equal(isInteger(Number.MAX_SAFE_INTEGER), true);
    assert.equal(isInteger(new Number(1)), true);
  });

  test('false', function () {
    assert.equal(isInteger(Number.MIN_VALUE), false);
    assert.equal(isInteger(Number.MAX_VALUE), true);
    assert.equal(isInteger(Number.POSITIVE_INFINITY), false);
    assert.equal(isInteger(Number.NEGATIVE_INFINITY), false);
    assert.equal(isInteger(0.001), false);
    assert.equal(isInteger('0'), false);
    assert.equal(isInteger(Number.NaN), false);
    assert.equal(isInteger(null), false);

    // these tests will fail due to the precision limitation of JavaScript numbers
    //                assert.equal(isInteger(0.00000000001), false);
    //                assert.equal(isInteger(123456789.00000000001), false);
  });
});
