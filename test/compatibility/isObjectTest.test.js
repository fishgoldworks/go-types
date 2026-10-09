'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isObject } = require('../../');

suite('#isObject', function () {
  test('true', function () {
    assert.equal(isObject({}), true);
    assert.equal(isObject(new Object()), true);
    assert.equal(isObject([]), true);
    assert.equal(isObject(new String('')), true);
    assert.equal(
      isObject(function () {}),
      true
    );
  });

  test('false', function () {
    assert.equal(isObject(), false);
    assert.equal(isObject(undefined), false);
    assert.equal(isObject(null), false);
    assert.equal(isObject(false), false);
    assert.equal(isObject(true), false);
    assert.equal(isObject(0), false);
    assert.equal(isObject(''), false);
  });
});
