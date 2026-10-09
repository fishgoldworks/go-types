'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isFloat } = require('../../');

suite('#isFloat', function () {
  test('true', function () {
    assert.equal(isFloat(0.1), true);
    assert.equal(isFloat(-0.1), true);
    assert.equal(isFloat(12.34), true);
    assert.equal(isFloat(new Number(12.34)), true);

    // these tests will fail due to the precision limitation of JavaScript numbers
    //                assert.equal(isFloat(0.00000000001), true);
    //                assert.equal(isFloat(123456789.00000000001), true);
  });

  test('false', function () {
    assert.equal(isFloat(0), false);
    assert.equal(isFloat(1.0), false);
    assert.equal(isFloat(-1.0), false);
    assert.equal(isFloat(new Number(1)), false);
  });
});
