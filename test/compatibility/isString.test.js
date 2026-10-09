'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isString } = require('../../');

suite('#isString', function () {
  test('true', function () {
    assert.equal(isString(''), true);
    assert.equal(isString('1'), true);
    assert.equal(isString('abc'), true);
    assert.equal(isString(new String('abc')), true);
  });

  test('false', function () {
    assert.equal(isString(), false);
    assert.equal(isString(undefined), false);
    assert.equal(isString(null), false);
    assert.equal(isString(0), false);
    assert.equal(isString(false), false);
    assert.equal(isString(String), false);
    assert.equal(isString({}), false);
    assert.equal(isString(['a', 'b']), false);
    assert.equal(isString(Symbol('abc')), false);
  });
});
