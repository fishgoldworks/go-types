'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../');

test('the matcher compiler is not a public root export', () => {
  assert.equal(Object.hasOwn(api, 'createTypeChecker'), false);
  assert.equal(api.createTypeChecker, undefined);
});

test('the retired matcher compiler source entry is absent for legacy resolvers', () => {
  assert.equal(fs.existsSync(path.join(__dirname, '../src/createTypeChecker.js')), false);
});

test('public type matching still supports ordered predicates and short-circuiting', () => {
  const calls = [];
  const rules = [
    {
      predicate(value) {
        calls.push('number');
        return typeof value === 'number';
      }
    },
    {
      predicate(value) {
        calls.push('null');
        return value === null;
      }
    }
  ];
  assert.equal(api.isTypeOf(1, rules), true);
  assert.deepEqual(calls, ['number']);
  calls.length = 0;
  assert.equal(api.isTypeOf(null, rules), true);
  assert.deepEqual(calls, ['number', 'null']);
  assert.throws(() => api.isTypeOf(1, { predicate: () => 1 }), TypeError);
});

test('public collection checks retain composite matcher behaviour', () => {
  const rules = ['number', null];
  assert.equal(api.isArrayOf([1, null], rules), true);
  assert.equal(api.isArrayLikeOf({ 0: 1, 1: null, length: 2 }, rules), true);
  assert.equal(api.isSetOf(new Set([1, null]), rules), true);
  assert.equal(
    api.isMapOf(
      new Map([
        ['one', 1],
        ['none', null]
      ]),
      'string',
      rules
    ),
    true
  );
  assert.equal(api.isArrayOf([1, '2'], rules), false);
});
