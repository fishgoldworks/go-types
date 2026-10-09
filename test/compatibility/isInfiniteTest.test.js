'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isInfinite } = require('../../');

suite('#isInfinite', function () {
  test('true', function () {
    assert.equal(isInfinite(Number.POSITIVE_INFINITY), true);
    assert.equal(isInfinite(Number.NEGATIVE_INFINITY), true);
    assert.equal(isInfinite(new Number(Number.POSITIVE_INFINITY)), true);
  });

  test('false', function () {
    assert.equal(isInfinite(0), false);
    assert.equal(isInfinite(Number.MAX_VALUE), false);
    assert.equal(isInfinite(Number.MIN_VALUE), false);
    assert.equal(isInfinite(Number.NaN), false);
    assert.equal(isInfinite(null), false);
    assert.equal(isInfinite('0'), false);
  });
});
