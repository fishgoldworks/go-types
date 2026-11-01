'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isCircular } = require('../../');

suite('#isCircular', function () {
  test('true', function () {
    var c1 = {};
    var c2 = [{ id: 1 }, { id: 2 }];

    c1.ref = c1;
    c2.push(c1);

    assert.equal(isCircular(c1), true);
    assert.equal(isCircular(c2), true);
  });

  test('false', function () {
    var obj = {};

    Object.defineProperty(obj, 'ref', {
      enumerable: false,
      value: obj
    });
    assert.equal(isCircular(), false);
    assert.equal(isCircular(null), false);
    assert.equal(isCircular({ a: null }), false);
    assert.equal(isCircular(obj), false);
    assert.equal(isCircular([1, 2, 3]), false);
    assert.equal(
      isCircular(function () {}),
      false
    );
    assert.equal(isCircular('abc'), false);
  });
});
