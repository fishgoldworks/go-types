'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const Types = require('../index.js');

for (const [name, Native] of [
  ['toMap', Map],
  ['toSet', Set]
]) {
  test(name + ' creates fresh empty collections for omitted or nullish input', () => {
    for (const value of [undefined, null]) {
      const first = Types[name](value);
      assert.equal(Object.getPrototypeOf(first), Native.prototype);
      assert.equal(first.size, 0);
      assert.notEqual(first, Types[name](value));
    }
    assert.equal(Types[name]().size, 0);
  });
  test(name + ' rejects non-iterables and malformed synchronous iterators', () => {
    for (const value of [
      1,
      true,
      Symbol('value'),
      { [Symbol.iterator]: 1 },
      { [Symbol.iterator]: () => 1 },
      { [Symbol.iterator]: () => ({ next: () => 1 }) }
    ])
      assert.throws(() => Types[name](value), TypeError);
  });
  test(name + ' propagates iterator access and execution failures unchanged', () => {
    const failure = new Error('iteration failed');
    for (const value of [
      {
        get [Symbol.iterator]() {
          throw failure;
        }
      },
      {
        [Symbol.iterator]() {
          throw failure;
        }
      },
      {
        [Symbol.iterator]: () => ({
          next() {
            throw failure;
          }
        })
      }
    ])
      assert.throws(
        () => Types[name](value),
        (error) => error === failure
      );
  });
  test(name + ' consumes a one-shot iterable exactly once', () => {
    let calls = 0;
    function* items() {
      calls++;
      yield name === 'toMap' ? ['key', 1] : 1;
    }
    const input = items();
    assert.equal(calls, 0);
    assert.equal(Types[name](input).size, 1);
    assert.equal(calls, 1);
    assert.equal(Types[name](input).size, 0);
  });
}

test('toMap copies shallowly, retaining key identity and insertion order when keys repeat', () => {
  const key = {},
    value = {};
  const input = new Map([
    [key, value],
    ['second', 2]
  ]);
  const copy = Types.toMap(input);
  assert.notEqual(copy, input);
  assert.equal(copy.get(key), value);
  copy.set('third', 3);
  assert.equal(input.size, 2);
  const repeated = Types.toMap([
    ['a', 1],
    ['b', 2],
    ['a', 3],
    [NaN, 1],
    [NaN, 4],
    [-0, 5]
  ]);
  assert.deepEqual(
    [...repeated],
    [
      ['a', 3],
      ['b', 2],
      [NaN, 4],
      [0, 5]
    ]
  );
});
test('toMap rejects inherited, missing, extra and non-array entry slots', () => {
  const entry = Object.create({ 0: 'inherited', 1: 7 });
  for (const pair of [entry, [], ['extra', 2, 3]]) assert.throws(() => Types.toMap([pair]), TypeError);
  assert.equal(Types.toMap('').size, 0);
  for (const value of ['ab', [1], [null], [undefined], Array(1)]) assert.throws(() => Types.toMap(value), TypeError);
});
test('toMap closes the input iterator on invalid entries and entry-getter failures', () => {
  const failure = Error('entry read failed');
  for (const entry of [
    1,
    Object.defineProperty(['key', 1], '0', {
      get() {
        throw failure;
      }
    }),
    Object.defineProperty(['key', 1], '1', {
      get() {
        throw failure;
      }
    })
  ]) {
    let closed = 0;
    function* entries() {
      try {
        yield entry;
        yield ['later', 2];
      } finally {
        closed++;
      }
    }
    assert.throws(
      () => Types.toMap(entries()),
      (error) => (entry === 1 ? error instanceof TypeError : error === failure)
    );
    assert.equal(closed, 1);
  }
});
test('toMap copies foreign maps into an ordinary local Map', () => {
  const foreign = vm.runInNewContext('new Map([["key", { value: 1 }]])');
  const result = Types.toMap(foreign);
  assert.equal(Object.getPrototypeOf(result), Map.prototype);
  assert.equal(result.get('key'), foreign.get('key'));
});
test('toSet deduplicates native values and preserves object identity and insertion order', () => {
  const object = {};
  const result = Types.toSet([3, 1, 3, NaN, NaN, -0, 0, object, object, {}]);
  assert.deepEqual([...result].slice(0, 5), [3, 1, NaN, 0, object]);
  assert.equal(result.size, 6);
  const copy = Types.toSet(result);
  assert.notEqual(copy, result);
  assert.equal(copy.has(object), true);
  copy.add('new');
  assert.equal(result.has('new'), false);
});
test('toSet reads strings by code point, sparse slots, and typed arrays', () => {
  assert.deepEqual([...Types.toSet('A😀A')], ['A', '😀']);
  assert.deepEqual([...Types.toSet(Array(2))], [undefined]);
  assert.deepEqual([...Types.toSet(new Uint8Array([2, 1, 2]))], [2, 1]);
  const entries = Types.toSet(new Map([['key', 1]]));
  assert.deepEqual([...entries], [['key', 1]]);
});
test('toSet copies foreign sets into an ordinary local Set', () => {
  const foreign = vm.runInNewContext('new Set([{ value: 1 }, 2])');
  const result = Types.toSet(foreign);
  assert.equal(Object.getPrototypeOf(result), Set.prototype);
  assert.equal([...result][0], [...foreign][0]);
});
