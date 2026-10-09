'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isPrimitive } = require('../../');

suite('#isPrimitive', function () {
  test('true', function () {
    assert.equal(isPrimitive(), true);
    assert.equal(isPrimitive(undefined), true);
    assert.equal(isPrimitive(null), true);
    assert.equal(isPrimitive(false), true);
    assert.equal(isPrimitive(0), true);
    assert.equal(isPrimitive(NaN), true);
    assert.equal(isPrimitive(''), true);

    if (typeof Symbol !== 'undefined') {
      assert.equal(isPrimitive(Symbol('abc')), true);
    }

    if (typeof BigInt !== 'undefined') {
      assert.equal(isPrimitive(BigInt(1)), true);
    }
  });

  test('false', function () {
    assert.equal(isPrimitive(new Boolean(false)), false);
    assert.equal(isPrimitive(new Number(0)), false);
    assert.equal(isPrimitive(new String('')), false);
    assert.equal(isPrimitive({}), false);
    assert.equal(isPrimitive([]), false);
    assert.equal(
      isPrimitive(function () {}),
      false
    );
  });
});
