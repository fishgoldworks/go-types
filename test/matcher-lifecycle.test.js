'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('..');

test('bound and foreign predicates run normally without reading instance hooks', () => {
  function check(value) {
    return value === this.wanted;
  }
  const bound = check.bind({ wanted: 7 });
  Object.defineProperty(bound, Symbol.hasInstance, {
    get() {
      throw Error('instance hook must not be read');
    }
  });
  assert.equal(T.isArrayOf([7], bound), true);
  assert.equal(T.isArrayOf([8], bound), false);
  assert.equal(T.isArrayOf([7], vm.runInNewContext('(value => value === 7)')), true);
});

test('instance checks use explicit predicates without invoking constructor bodies', () => {
  let constructions = 0;
  class Account {
    constructor() {
      constructions++;
    }
  }
  const instance = Object.create(Account.prototype);
  assert.equal(
    T.isArrayOf([instance], (value) => value instanceof Account),
    true
  );
  assert.equal(
    T.isArrayOf([{}], (value) => value instanceof Account),
    false
  );
  assert.equal(constructions, 0);
});

test('reentrant collection predicates keep independent traversal state', () => {
  const calls = [];
  const check = (value) => {
    calls.push(value);
    return value === 'outer' ? T.isArrayOf(['inner'], check) : value === 'inner';
  };
  assert.equal(T.isArrayOf(['outer'], check), true);
  assert.deepEqual(calls, ['outer', 'inner']);
});

test('predicates retain live closure state across independent operations', () => {
  let wanted = 1;
  const check = (value) => value === wanted;
  assert.equal(T.isArrayOf([1], check), true);
  wanted = 2;
  assert.equal(T.isArrayOf([1], check), false);
  assert.equal(T.isArrayOf([2], check), true);
});

test('invalid predicate results are rejected without reading then or coercion hooks', () => {
  let reads = 0;
  const value = Object.defineProperties(
    {},
    {
      then: {
        get() {
          reads++;
          throw Error('then read');
        }
      },
      valueOf: {
        get() {
          reads++;
          throw Error('valueOf read');
        }
      }
    }
  );
  assert.throws(() => T.isArrayOf([1], () => value), TypeError);
  assert.equal(reads, 0);
});
