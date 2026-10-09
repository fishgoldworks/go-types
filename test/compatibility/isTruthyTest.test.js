'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isTruthy } = require('../../');

suite('#isTruthy', function () {
  test('truthy', function () {
    assert.equal(isTruthy(true), true);
    assert.equal(isTruthy(1), true);
    assert.equal(isTruthy('a'), true);
    assert.equal(isTruthy({}), true);
    assert.equal(isTruthy([]), true);
    assert.equal(
      isTruthy(function () {}),
      true
    );
  });

  test('not truthy', function () {
    assert.equal(isTruthy(), false);
    assert.equal(isTruthy(undefined), false);
    assert.equal(isTruthy(null), false);
    assert.equal(isTruthy(0), false);
    assert.equal(isTruthy(NaN), false);
    assert.equal(isTruthy(''), false);
    assert.equal(isTruthy(false), false);
  });
});
