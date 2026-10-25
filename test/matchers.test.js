'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('../');
const pred = (predicate) => predicate;
for (const [name, build, check] of [
  ['Set', (items) => new Set(items), (v, m) => T.isSetOf(v, m)],
  ['Array', (items) => items, (v, m) => T.isArrayOf(v, m)]
]) {
  test(name + ' Of empty, valid, invalid and mixed values', () => {
    assert.equal(check(build([]), 'number'), true);
    assert.equal(check(build([1, 2]), 'number'), true);
    assert.equal(check(build([1, 'x']), 'number'), false);
    assert.equal(
      check(build([null, 1]), (value) => typeof value === 'number' || value === null),
      true
    );
  });
}
test('Map Of validates keys and values independently', () => {
  assert.equal(T.isMapOf(new Map(), 'string', 'number'), true);
  assert.equal(T.isMapOf(new Map([['x', 1]]), 'string', 'number'), true);
  assert.equal(T.isMapOf(new Map([[1, 1]]), 'string', 'number'), false);
  assert.equal(T.isMapOf(new Map([['x', '1']]), 'string', 'number'), false);
  assert.equal(T.isMapOf({}, 'string', 'number'), false);
});
test('Map/Set Of accept foreign collections and ignore overridden iteration', () => {
  assert.equal(T.isSetOf(vm.runInNewContext('new Set([1,2])'), 'number'), true);
  assert.equal(T.isMapOf(vm.runInNewContext('new Map([["a",1]])'), 'string', 'number'), true);
  const m = new Map([['a', 1]]),
    s = new Set([1]);
  for (const x of [m, s])
    x[Symbol.iterator] = () => {
      throw Error('must not run');
    };
  assert.equal(T.isMapOf(m, 'string', 'number'), true);
  assert.equal(T.isSetOf(s, 'number'), true);
});
test('Map/Set Of reject prototype and proxy imitations without running predicates', () => {
  let calls = 0;
  const p = pred(() => {
    calls++;
    return true;
  });
  for (const m of [{}, Object.create(Map.prototype), new Proxy(new Map(), {})]) assert.equal(T.isMapOf(m, p, p), false);
  for (const s of [{}, Object.create(Set.prototype), new Proxy(new Set(), {})]) assert.equal(T.isSetOf(s, p), false);
  assert.equal(calls, 0);
});
