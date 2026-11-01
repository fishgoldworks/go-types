'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const T = require('..');
const { moduleLoader } = require('./fixtures/verify-optional-apis.cjs');

function fresh(missing = [], setup = '') {
  const context = vm.createContext({ missing });
  const held = vm.runInContext(
    '(() => { const set = new Set([1, 2]); const has = Set.prototype.has; const size = Object.getOwnPropertyDescriptor(Set.prototype, "size").get; for (const name of missing) { const parts = name.split("."); let owner = globalThis; for (let i=0; i<parts.length-1 && owner; i++) owner=owner[parts[i]]; if (owner) delete owner[parts[parts.length-1]]; } return { set, has, size }; })()',
    context
  );
  if (setup) vm.runInContext(setup, context);
  return { context, held, ensureSet: moduleLoader(path.resolve(__dirname, '..'), context)('src/ensureSet.js') };
}

test('ensureSet preserves empty, frozen, subclassed, circular and foreign Sets without reading own properties', () => {
  class Selection extends Set {}
  const circular = new Set();
  circular.add(circular);
  const hostile = new Set([1]);
  for (const key of ['size', 'has', Symbol.iterator, Symbol.toStringTag])
    Object.defineProperty(hostile, key, {
      get() {
        throw Error('Do not inspect existing Sets');
      }
    });
  for (const value of [
    new Set(),
    Object.freeze(new Set([1])),
    new Selection([1]),
    circular,
    hostile,
    vm.runInNewContext('new Set([1, 2])')
  ])
    assert.equal(T.ensureSet(value), value);
});

for (const [name, value] of [
  ['undefined', undefined],
  ['null', null],
  ['zero', 0],
  ['false', false],
  ['empty string', ''],
  ['string', 'read'],
  ['symbol', Symbol('member')],
  ['bigint', 1n],
  ['object', { id: 1 }],
  ['Map', new Map([['a', 1]])],
  ['typed array', new Uint8Array([1, 2])],
  ['Buffer', Buffer.from([1, 2])],
  ['function', function member() {}],
  ['promise', Promise.resolve(1)]
]) {
  test('ensureSet retains ' + name + ' as one member in a fresh Set', () => {
    const first = T.ensureSet(value),
      second = T.ensureSet(value);
    assert.equal(first.size, 1);
    assert.equal(first.has(value), true);
    assert.notEqual(first, second);
  });
}

test('ensureSet expands only array input and preserves native equality, nested references and sparse input', () => {
  const first = {},
    second = {},
    nested = [1];
  const output = T.ensureSet([NaN, NaN, -0, 0, first, first, second, nested]);
  assert.equal(output.size, 5);
  assert.equal(output.has(first), true);
  assert.equal(output.has(second), true);
  assert.equal(output.has(nested), true);
  assert.equal(Number.isNaN(Array.from(output)[0]), true);
  assert.equal(1 / Array.from(output)[1], Infinity);
  const sparse = Array(2);
  const result = T.ensureSet(sparse);
  assert.equal(result.size, 1);
  assert.equal(result.has(undefined), true);
  assert.equal(0 in sparse, false);
  for (const value of [Object.freeze([1, 1, 2]), vm.runInNewContext('[1, 1, 2]')])
    assert.deepEqual(Array.from(T.ensureSet(value)), [1, 2]);
});

test('ensureSet does not consume non-array iterables or inspect proxy properties', () => {
  const fail = () => {
    throw Error('Do not inspect single values');
  };
  const iterable = Object.defineProperty({}, Symbol.iterator, { get: fail });
  const generator = (function* () {
    yield fail();
  })();
  const object = new Proxy({}, { get: fail, ownKeys: fail, getPrototypeOf: fail });
  const setProxy = new Proxy(new Set([1]), { get: fail, ownKeys: fail, getPrototypeOf: fail });
  for (const value of [iterable, generator, object, setProxy, Object.create(Set.prototype), { 0: 'x', length: 1 }])
    assert.equal(T.ensureSet(value).has(value), true);
});

test('ensureSet follows native array iteration and propagates original iterator errors', () => {
  const array = [1, 2];
  array[Symbol.iterator] = function* () {
    yield 'custom';
  };
  assert.deepEqual(Array.from(T.ensureSet(array)), ['custom']);
  const failure = Error('iterator failure');
  Object.defineProperty(array, Symbol.iterator, {
    get() {
      throw failure;
    }
  });
  assert.throws(
    () => T.ensureSet(array),
    (error) => error === failure
  );
  const revoked = Proxy.revocable([], {});
  revoked.revoke();
  assert.throws(() => T.ensureSet(revoked.proxy), TypeError);
});

test('ensureSet distinguishes omission and explicit nullish members and ignores callback arguments', () => {
  const first = T.ensureSet(),
    second = T.ensureSet();
  assert.equal(first.size, 0);
  assert.notEqual(first, second);
  assert.equal(T.ensureSet(undefined).has(undefined), true);
  assert.equal(T.ensureSet(null).has(null), true);
  const existing = new Set([3]);
  const outputs = [1, [2, 2], existing, undefined].map(T.ensureSet);
  assert.deepEqual(Array.from(outputs[0]), [1]);
  assert.deepEqual(Array.from(outputs[1]), [2]);
  assert.equal(outputs[2], existing);
  assert.equal(outputs[3].has(undefined), true);
});

for (const missing of [
  ['Set.prototype.size'],
  ['Set.prototype.size', 'Set.prototype.has'],
  ['Set.prototype.size', 'Set.prototype.has', 'Set.prototype.values'],
  ['Set.prototype.size', 'Set.prototype.has', 'Set.prototype.values', 'Set.prototype.entries']
]) {
  test('ensureSet preserves native identity after pre-load absence of ' + missing.join(', '), () => {
    const { ensureSet, held } = fresh(missing);
    assert.equal(ensureSet(held.set), held.set);
    assert.equal(held.has.call(ensureSet('read'), 'read'), true);
  });
}

test('ensureSet rejects opaque inputs when every native brand probe is absent, retaining safe creations', () => {
  const missing = [
    'Set.prototype.size',
    'Set.prototype.has',
    'Set.prototype.values',
    'Set.prototype.entries',
    'Set.prototype.keys'
  ];
  const { ensureSet, held } = fresh(missing);
  assert.throws(() => ensureSet(held.set), {
    name: 'TypeError',
    message: 'Native Set identity checks are unavailable in this runtime.'
  });
  assert.equal(held.size.call(ensureSet()), 0);
  assert.equal(held.has.call(ensureSet(null), null), true);
  assert.equal(held.has.call(ensureSet(undefined), undefined), true);
  assert.equal(held.has.call(ensureSet([1, 1]), 1), true);
  assert.equal(held.has.call(ensureSet('read'), 'read'), true);
});

test('ensureSet loading tolerates a missing constructor and fails clearly before input inspection', () => {
  const { ensureSet, held } = fresh(['Set']);
  for (const value of [held.set, [], Object.create(null)])
    assert.throws(() => ensureSet(value), {
      name: 'TypeError',
      message: 'Native Set normalisation is unavailable in this runtime.'
    });
  assert.throws(() => ensureSet(), { name: 'TypeError' });
});

test('ensureSet preserves existing Sets and empty construction when the native adder is absent', () => {
  const { ensureSet, held } = fresh(['Set.prototype.add']);
  assert.equal(ensureSet(held.set), held.set);
  assert.equal(held.size.call(ensureSet()), 0);
  assert.throws(() => ensureSet([1]), { name: 'TypeError' });
  assert.throws(() => ensureSet(1), { name: 'TypeError' });
});

test('ensureSet keeps native iterator closing and adder error identity during creation', () => {
  const { context, ensureSet } = fresh(
    [],
    'globalThis.failure = new Error("adder failure"); globalThis.closed = false; globalThis.items = [1]; items[Symbol.iterator] = function* () { try { yield 1; } finally { closed = true; } }; Set.prototype.add = function () { throw failure; };'
  );
  const array = vm.runInContext('items', context),
    failure = vm.runInContext('failure', context);
  assert.throws(
    () => ensureSet(array),
    (error) => error === failure
  );
  assert.equal(vm.runInContext('closed', context), true);
});
