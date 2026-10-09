'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isNull } = require('../../');

suite('#isNull', function () {
  test('null', function () {
    assert.equal(isNull(null), true);
  });

  test('not null', function () {
    assert.equal(isNull(), false);
    assert.equal(isNull(undefined), false);
    assert.equal(isNull(0), false);
    assert.equal(isNull(false), false);
    assert.equal(isNull(''), false);
    assert.equal(isNull(NaN), false);
    assert.equal(isNull({}), false);
    assert.equal(isNull([]), false);
    assert.equal(
      isNull(function () {}),
      false
    );
  });
});
