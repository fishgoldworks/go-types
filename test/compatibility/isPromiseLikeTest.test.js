'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isPromiseLike } = require('../../');

suite('#isPromiseLike', function () {
  test('accepts a callable then without catch or finally', function () {
    assert.equal(isPromiseLike({ then: function () {} }), true);
    assert.equal(isPromiseLike({ then: function () {}, catch: true, finally: null }), true);
    assert.equal(isPromiseLike({ then: function () {}, catch: function () {} }), true);
    assert.equal(isPromiseLike(Promise.resolve(1)), true);
  });

  test('accepts functions and inherited then methods', function () {
    const then = function () {};
    assert.equal(isPromiseLike(Object.assign(function () {}, { then })), true);
    assert.equal(isPromiseLike(Object.create({ then })), true);
  });

  test('rejects primitive inputs and missing or non-callable then', function () {
    for (const value of [undefined, null, false, 0, 'text', {}, { catch: function () {} }]) {
      assert.equal(isPromiseLike(value), false);
    }
    for (const then of [undefined, null, true, 1, 'function', {}]) {
      assert.equal(isPromiseLike({ then }), false);
    }
  });

  test('recognises a then-only value that Promise.resolve can adopt', async function () {
    let calls = 0;
    const value = {
      then(resolve) {
        calls++;
        resolve(42);
      }
    };
    assert.equal(isPromiseLike(value), true);
    assert.equal(calls, 0);
    assert.equal(await Promise.resolve(value), 42);
    assert.equal(calls, 1);
  });
});
