'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isPromise } = require('../../');

if (typeof Promise !== 'undefined') {
  suite('#isPromise', function () {
    test('true', function () {
      assert.equal(
        isPromise(
          new Promise(
            function () {},
            function () {}
          )
        ),
        true
      );
      assert.equal(isPromise(Promise.resolve(true)), true);
      assert.equal(isPromise(Promise.reject(false).catch(() => {})), true);
    });

    test('false', function () {
      assert.equal(isPromise(), false);
      assert.equal(isPromise({}), false);
      assert.equal(isPromise({ then: function () {}, catch: function () {} }), false);
    });
  });
}
