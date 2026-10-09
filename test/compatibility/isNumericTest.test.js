'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isNumeric } = require('../../');

suite('#isNumeric', function () {
  test('true', function () {
    assert.equal(isNumeric(0), true);
    assert.equal(isNumeric(1), true);
    assert.equal(isNumeric(-1), true);
    assert.equal(isNumeric(new Number(0)), true);
    assert.equal(isNumeric('0'), true);
    assert.equal(isNumeric('-1'), true);
    assert.equal(isNumeric('+1'), true);
    assert.equal(isNumeric('+1.234e5'), true);
    assert.equal(isNumeric('-1.234E5'), true);
    assert.equal(isNumeric(' 1 '), true);
    assert.equal(isNumeric(new String('1')), true);

    if (typeof BigInt !== 'undefined') {
      assert.equal(isNumeric(BigInt(1)), true);
    }
  });

  test('false', function () {
    assert.equal(isNumeric(), false);
    assert.equal(isNumeric(undefined), false);
    assert.equal(isNumeric(null), false);
    assert.equal(isNumeric({}), false);
    assert.equal(isNumeric([]), false);
    assert.equal(isNumeric(''), false);
    assert.equal(isNumeric(false), false);
    assert.equal(isNumeric(true), false);
    assert.equal(isNumeric(Number.POSITIVE_INFINITY), false);
    assert.equal(isNumeric(Number.NEGATIVE_INFINITY), false);
    assert.equal(isNumeric(Number.NaN), false);
    assert.equal(isNumeric('a1'), false);
    assert.equal(isNumeric('1n'), false);
    assert.equal(isNumeric('null'), false);
  });
});
