'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isFalsy } = require('../../');

suite('#isFalsy', function () {
  test('falsy', function () {
    assert.equal(isFalsy(), true);
    assert.equal(isFalsy(undefined), true);
    assert.equal(isFalsy(null), true);
    assert.equal(isFalsy(0), true);
    assert.equal(isFalsy(NaN), true);
    assert.equal(isFalsy(false), true);
    assert.equal(isFalsy(''), true);
  });

  test('not falsy', function () {
    assert.equal(isFalsy(true), false);
    assert.equal(isFalsy(1), false);
    assert.equal(isFalsy(-1), false);
    assert.equal(isFalsy('a'), false);
    assert.equal(isFalsy({}), false);
    assert.equal(isFalsy([]), false);
    assert.equal(
      isFalsy(function () {}),
      false
    );
  });
});
