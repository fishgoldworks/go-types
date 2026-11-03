'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = require('../');

const checks = [
  ['array', (value) => T.isArrayOf([1], value)],
  ['array-like', (value) => T.isArrayLikeOf({ 0: 1, length: 1 }, value)],
  ['Set', (value) => T.isSetOf(new Set([1]), value)],
  ['Map key', (value) => T.isMapOf(new Map([[1, 'value']]), value, 'string')],
  ['Map value', (value) => T.isMapOf(new Map([['key', 1]]), 'string', value)]
];

for (const [name, check] of checks) {
  test(name + ' interprets ordinary predicate results using truthiness and returns booleans', () => {
    for (const result of [undefined, null, false, 0, -0, NaN, '', 0n]) {
      assert.equal(
        check(() => result),
        false
      );
    }
    for (const result of [true, 1, -1, Infinity, 'false', [], {}, new Boolean(false), Symbol(), 1n]) {
      assert.equal(
        check(() => result),
        true
      );
    }
  });

  test(name + ' does not inspect, coerce or await a truthy object result', () => {
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    const opaque = new Proxy(
      {},
      {
        get() {
          throw Error('must not inspect');
        }
      }
    );
    const coercion = {
      [Symbol.toPrimitive]() {
        throw Error('must not coerce');
      }
    };
    assert.equal(
      check(() => revoked.proxy),
      true
    );
    assert.equal(
      check(() => opaque),
      true
    );
    assert.equal(
      check(() => coercion),
      true
    );
    assert.equal(
      check(() => Promise.resolve(false)),
      true
    );
    assert.equal(
      check(async () => false),
      true
    );
  });

  test(name + ' propagates thrown callback values unchanged', () => {
    for (const failure of [undefined, null, 'failure', new Error('failure')]) {
      let caught = false;
      try {
        check(() => {
          throw failure;
        });
      } catch (error) {
        caught = true;
        assert.equal(error, failure);
      }
      assert.equal(caught, true);
    }
  });
}

test('truthy collection matches retain short-circuiting and Map key-before-value order', () => {
  const calls = [];
  assert.equal(
    T.isMapOf(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', 3]
      ]),
      (key) => {
        calls.push(key);
        return key === 'second' ? '' : key;
      },
      (value) => {
        calls.push(value);
        return value;
      }
    ),
    false
  );
  assert.deepEqual(calls, ['first', 1, 'second']);
  for (const [check, input] of [
    [T.isArrayOf, [1, 0, 3]],
    [T.isArrayLikeOf, { 0: 1, 1: 0, 2: 3, length: 3 }],
    [T.isSetOf, new Set([1, 0, 3])]
  ]) {
    const seen = [];
    assert.equal(
      check(input, (value) => {
        seen.push(value);
        return value;
      }),
      false
    );
    assert.deepEqual(seen, [1, 0]);
  }
});

test('conditional conversion helpers and their implementation files are absent', () => {
  const names = [
    'toArrayIf',
    'toBigIntIf',
    'toBooleanIf',
    'toDateIf',
    'toIntegerIf',
    'toJsonIf',
    'toMapIf',
    'toNumberIf',
    'toPlainObjectIf',
    'toSetIf',
    'toStringIf',
    'toSymbolIf',
    'boxIf',
    'unboxIf',
    'toRegExpIf',
    'toPromiseIf',
    'parseJsonIf'
  ];
  for (const name of names) {
    assert.equal(Object.hasOwn(T, name), false, name);
    assert.equal(fs.existsSync(path.join(__dirname, '../src/conversion', name + '.js')), false, name);
  }
  assert.equal(fs.existsSync(path.join(__dirname, '../src/util/shouldConvert.js')), false);
});
