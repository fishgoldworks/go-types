'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isArray } = require('../../');

suite('#isArray', function () {
  test('true', function () {
    assert.equal(isArray(['a', 'b']), true);
    assert.equal(isArray(new Array()), true);
  });

  test('false', function () {
    assert.equal(isArray(), false);
    assert.equal(isArray(undefined), false);
    assert.equal(isArray(null), false);
    assert.equal(isArray(false), false);
    assert.equal(isArray(0), false);
    assert.equal(isArray(''), false);
    assert.equal(isArray({}), false);
    assert.equal(isArray({ length: 0 }), false);
    assert.equal(isArray(new Int8Array()), false);
    assert.equal(isArray(Array), false);

    if (typeof Set !== 'undefined') {
      assert.equal(isArray(new Set()), false);
    }

    if (typeof Map !== 'undefined') {
      assert.equal(isArray(new Map()), false);
    }
  });
});
