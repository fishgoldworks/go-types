'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const Types = require('../index.js');

test('toMap converts own enumerable string properties to fresh shallow entries', () => {
  const item = {};
  const input = Object.freeze({ a: 1, b: item, 2: 'two', 1: 'one' });
  const output = Types.toMap(input);
  assert.deepEqual(
    [...output],
    [
      ['1', 'one'],
      ['2', 'two'],
      ['a', 1],
      ['b', item]
    ]
  );
  assert.equal(output.get('b'), item);
  assert.notEqual(output, Types.toMap(input));
  output.set('a', 7);
  assert.equal(input.a, 1);
  assert.equal(Types.toMap({}).size, 0);
});

test('toMap accepts null-prototype and foreign records without reading constructor fields', () => {
  for (const input of [Object.assign(Object.create(null), { a: 1 }), vm.runInNewContext('({a: 1})')]) {
    Object.defineProperty(input, 'constructor', {
      get() {
        throw Error('hidden constructor read');
      }
    });
    Object.defineProperty(input, Symbol('hidden'), {
      enumerable: false,
      get() {
        throw Error('symbol read');
      }
    });
    const output = Types.toMap(input);
    assert.equal(Object.getPrototypeOf(output), Map.prototype);
    assert.deepEqual([...output], [['a', 1]]);
  }
  const keys = Object.assign(Object.create(null), { constructor: 1, prototype: 2 });
  keys.__proto__ = 3;
  assert.deepEqual(
    [...Types.toMap(keys)],
    [
      ['constructor', 1],
      ['prototype', 2],
      ['__proto__', 3]
    ]
  );
});

test('toMap snapshots own names and reads enumerable record values once in property order', () => {
  const reads = [];
  const input = {
    get a() {
      reads.push('a');
      delete input.b;
      Object.defineProperty(input, 'c', { enumerable: false });
      Object.defineProperty(input, 'd', { enumerable: true });
      input.extra = 9;
      return 1;
    },
    b: 2,
    c: 3
  };
  Object.defineProperty(input, 'd', { configurable: true, value: 4 });
  assert.deepEqual(
    [...Types.toMap(input)],
    [
      ['a', 1],
      ['d', 4]
    ]
  );
  assert.deepEqual(reads, ['a']);
  const failure = {};
  assert.throws(
    () =>
      Types.toMap({
        get a() {
          throw failure;
        }
      }),
    (error) => error === failure
  );
});

test('toMap keeps iterable precedence without inspecting its prototype or re-reading the method', () => {
  const entries = [['from iterator', 4]];
  let reads = 0;
  let input;
  input = new Proxy(
    { a: 1 },
    {
      getPrototypeOf() {
        throw Error('iterable prototype read');
      },
      get(target, key) {
        if (key === Symbol.iterator) {
          reads++;
          return function () {
            assert.equal(this, input);
            return entries[Symbol.iterator]();
          };
        }
        throw Error('unexpected property read: ' + String(key));
      }
    }
  );
  assert.deepEqual([...Types.toMap(input)], entries);
  assert.equal(reads, 1);
});

test('toMap accepts nullish iterator methods as record data but rejects malformed methods', () => {
  for (const method of [null, undefined]) {
    assert.deepEqual(
      [...Types.toMap({ a: 1, [Symbol.iterator]: method })],
      [
        ['a', 1],
        [Symbol.iterator, method]
      ]
    );
  }
  for (const method of [0, false, {}, class Iterator {}]) {
    assert.throws(() => Types.toMap({ a: 1, [Symbol.iterator]: method }), TypeError);
  }
  assert.throws(
    () =>
      Types.toMap(
        new (class Record {
          constructor() {
            this.a = 1;
          }
        })()
      ),
    TypeError
  );
});

test('toMap validates the native adder before inspecting records or iterables', () => {
  const failure = new Error('adder failed');
  const original = Object.getOwnPropertyDescriptor(Map.prototype, 'set');
  const input = new Proxy(
    {},
    {
      get() {
        throw Error('input inspected too early');
      },
      getPrototypeOf() {
        throw Error('prototype inspected too early');
      }
    }
  );
  try {
    Object.defineProperty(Map.prototype, 'set', {
      configurable: true,
      get() {
        throw failure;
      }
    });
    assert.throws(
      () => Types.toMap(input),
      (error) => error === failure
    );
    Object.defineProperty(Map.prototype, 'set', { configurable: true, value: 1 });
    assert.throws(() => Types.toMap(input), TypeError);
  } finally {
    Object.defineProperty(Map.prototype, 'set', original);
  }
});

test('toMap treats length and async symbol methods as record data without invoking them', () => {
  const method = () => {
    throw Error('async method invoked');
  };
  const value = { 0: 'first', length: 1, [Symbol.asyncIterator]: method };
  assert.deepEqual(
    [...Types.toMap(value)],
    [
      ['0', 'first'],
      ['length', 1],
      [Symbol.asyncIterator, method]
    ]
  );
});

test('toMap preserves record proxy failure identity for reflection and value access', () => {
  const failure = {};
  for (const trap of ['getPrototypeOf', 'ownKeys', 'getOwnPropertyDescriptor']) {
    const input = new Proxy(
      { a: 1 },
      {
        [trap]() {
          throw failure;
        }
      }
    );
    assert.throws(
      () => Types.toMap(input),
      (error) => error === failure
    );
  }
  const input = new Proxy(
    { a: 1 },
    {
      get(target, key) {
        if (key === 'a') throw failure;
        return target[key];
      }
    }
  );
  assert.throws(
    () => Types.toMap(input),
    (error) => error === failure
  );
});

test('toMap remains usable without Symbol reflection and preserves native fallback without a visible iterator key', () => {
  const { moduleLoader } = require('./fixtures/verify-optional-apis.cjs');
  const path = require('node:path');
  for (const missingSymbol of [false, true]) {
    for (const missingReflect of [false, true]) {
      const context = vm.createContext({});
      const input = vm.runInContext(
        `
      const input = { a: 1, [Symbol.iterator]: function* () { yield ['iterated', 2]; } };
      Object.getOwnPropertySymbols = undefined;
      ${missingReflect ? 'Reflect.ownKeys = undefined;' : ''}
      ${missingSymbol ? 'Symbol = undefined;' : ''}
      input;
    `,
        context
      );
      const toMap = moduleLoader(path.resolve(__dirname, '..'), context)('src/conversion/toMap.js');
      assert.equal(toMap(input).get('iterated'), 2);
      assert.equal(toMap(null).size, 0);
      if (missingReflect)
        assert.throws(
          () => toMap({ a: 1 }),
          (error) => error.name === 'TypeError'
        );
      else assert.equal(toMap({ a: 1 }).get('a'), 1);
    }
  }
});
