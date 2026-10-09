'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isBigInt } = require('../../');

if (typeof BigInt !== 'undefined') {
  suite('#isBigInt', function () {
    test('true', function () {
      assert.equal(isBigInt(BigInt(1)), true);
      assert.equal(isBigInt(BigInt('-9876543210123456789')), true);
      assert.equal(isBigInt(BigInt(Number.MAX_VALUE)), true);
    });

    test('false', function () {
      assert.equal(isBigInt(), false);
      assert.equal(isBigInt(0), false);
      assert.equal(isBigInt(0.1), false);
      assert.equal(isBigInt(Number.MAX_VALUE), false);
      assert.equal(isBigInt(Number.MIN_VALUE), false);
      assert.equal(isBigInt(Number.POSITIVE_INFINITY), false);
      assert.equal(isBigInt(Number.NEGATIVE_INFINITY), false);
      assert.equal(isBigInt(Number.NaN), false);
      assert.equal(isBigInt(undefined), false);
      assert.equal(isBigInt(null), false);
      assert.equal(isBigInt({}), false);
      assert.equal(isBigInt([]), false);
      assert.equal(isBigInt('1n'), false);
    });
  });
}
