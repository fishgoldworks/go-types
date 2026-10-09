'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isThenable } = require('../../');

suite('#isThenable', function () {
  test('true', function () {
    assert.equal(isThenable({ then: function () {} }), true);

    if (typeof Promise !== 'undefined') {
      assert.equal(isThenable(Promise.resolve(1)), true);
    }
  });

  test('false', function () {
    assert.equal(isThenable(), false);
    assert.equal(isThenable({ catch: function () {} }), false);
    assert.equal(isThenable({ then: true }), false);
  });
});
