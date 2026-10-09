'use strict';

const assert = require('node:assert/strict');
const { describe: suite, test } = require('node:test');
const { isValidDate } = require('../../');

suite('#isValidDate', function () {
  test('true', function () {
    assert.equal(isValidDate(new Date()), true);
    assert.equal(isValidDate(new Date('2001-01-01T00:00:00.000Z')), true);
    assert.equal(isValidDate(new Date(0)), true);
    assert.equal(isValidDate(new Date(-1)), true);
  });

  test('false', function () {
    assert.equal(isValidDate(new Date('')), false);
    assert.equal(isValidDate(new Date(NaN)), false);
    assert.equal(isValidDate('2001-01-01T00:00:00.000Z'), false);
    assert.equal(isValidDate(0), false);
  });
});
