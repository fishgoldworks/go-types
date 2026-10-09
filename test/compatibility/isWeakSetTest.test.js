'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isWeakSet } = require('../../');

if (typeof WeakSet !== 'undefined') {
  suite('#isWeakSet', function () {
    test('true', function () {
      assert.equal(isWeakSet(new WeakSet()), true);
    });

    test('false', function () {
      assert.equal(isWeakSet(), false);
      assert.equal(isWeakSet(WeakSet), false);
      assert.equal(isWeakSet(undefined), false);
      assert.equal(isWeakSet(null), false);
      assert.equal(isWeakSet({}), false);
      assert.equal(isWeakSet([]), false);
    });
  });
}
