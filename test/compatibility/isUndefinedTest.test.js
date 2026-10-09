'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isUndefined } = require('../../');

suite('#isUndefined', function () {
  test('undefined', function () {
    assert.equal(isUndefined(), true);
    assert.equal(isUndefined(undefined), true);
    assert.equal(isUndefined(void 0), true);
  });

  test('not undefined', function () {
    assert.equal(isUndefined(null), false);
    assert.equal(isUndefined(false), false);
    assert.equal(isUndefined(0), false);
    assert.equal(isUndefined(''), false);
    assert.equal(isUndefined(NaN), false);
    assert.equal(isUndefined({}), false);
    assert.equal(isUndefined([]), false);
    assert.equal(
      isUndefined(function () {}),
      false
    );
  });
});
