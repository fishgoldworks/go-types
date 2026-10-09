'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isBlank } = require('../../');

suite('#isBlank', function () {
  test('blank', function () {
    assert.equal(isBlank(), true);
    assert.equal(isBlank(undefined), true);
    assert.equal(isBlank(null), true);
    assert.equal(isBlank(''), true);
    assert.equal(isBlank(' '), true);
    assert.equal(isBlank(' \t\n '), true);
    assert.equal(isBlank([]), true);
    assert.equal(isBlank({}), true);
    assert.equal(isBlank([undefined, null]), true);
    assert.equal(isBlank({ a: undefined, b: null }), true);
    assert.equal(isBlank(new Set([undefined, null])), true);
  });

  test('not blank', function () {
    assert.equal(isBlank(0), false);
    assert.equal(isBlank(NaN), false);
    assert.equal(isBlank('a'), false);
    assert.equal(isBlank(' a '), false);
    assert.equal(isBlank(['']), false);
    assert.equal(isBlank([0]), false);
    assert.equal(isBlank({ a: '' }), false);
    assert.equal(isBlank({ a: 0 }), false);
    assert.equal(isBlank(new Set([0])), false);
  });
});
