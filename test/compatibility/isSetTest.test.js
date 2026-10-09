'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isSet } = require('../../');

if (typeof Set !== 'undefined') {
  suite('#isSet', function () {
    test('true', function () {
      assert.equal(isSet(new Set()), true);
    });

    test('false', function () {
      assert.equal(isSet(), false);
      assert.equal(isSet(Set), false);
      assert.equal(isSet(undefined), false);
      assert.equal(isSet(null), false);
      assert.equal(isSet({}), false);
      assert.equal(isSet([]), false);
    });
  });
}
