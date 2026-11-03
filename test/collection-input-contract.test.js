'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const Types = require('../index.js');

for (const name of ['toArray', 'toSet', 'toMap']) {
  const values = (input) => (name === 'toMap' ? [...Types[name](input).values()] : [...Types[name](input)]);
  test(name + ' includes enumerable symbols and treats record length as data', () => {
    const symbol = Symbol('item');
    const object = {};
    const input = { 2: 'two', 1: 'one', a: object, length: 2, [symbol]: 'symbol' };
    Object.defineProperty(input, 'hidden', { value: 'hidden' });
    Object.defineProperty(input, Symbol('hidden'), { value: 'hidden' });
    assert.deepEqual(values(input), ['one', 'two', object, 2, 'symbol']);
    if (name === 'toMap') assert.equal(Types.toMap(input).get(symbol), 'symbol');
    assert.deepEqual(values({ 0: 'a', 1: 'b', length: 2 }), ['a', 'b', 2]);
    assert.deepEqual(values(Object.assign(Object.create(null), { a: 1, b: 2 })), [1, 2]);
    assert.deepEqual(values(vm.runInNewContext('({a:1,b:2})')), [1, 2]);
  });
  test(name + ' snapshots symbol keys and observes live enumerability and values', () => {
    const symbol = Symbol('present');
    const added = Symbol('late');
    const input = {
      get a() {
        delete input.b;
        input[symbol] = 3;
        input[added] = 4;
        return 1;
      },
      b: 2,
      [symbol]: 0
    };
    assert.deepEqual(values(input), [1, 3]);
  });
  test(name + ' rejects scalar objects and functions even when given an iterator', () => {
    for (const input of [
      new Date(),
      /x/,
      Object('abc'),
      Object(1),
      Object(false),
      Object(Symbol('x')),
      Object(BigInt(1)),
      function (a) {
        return a;
      }
    ]) {
      Object.defineProperty(input, Symbol.iterator, {
        value: function* () {
          yield name === 'toMap' ? ['x', 1] : 1;
        }
      });
      assert.throws(() => Types[name](input), TypeError);
    }
    for (const input of [1, true, Symbol('x'), BigInt(1), Promise.resolve(1), new (class {})()])
      assert.throws(() => Types[name](input), TypeError);
  });
  test(name + ' honours a synchronous iterator before record properties', () => {
    let reads = 0;
    const input = {
      get ignored() {
        throw Error('record read');
      },
      get [Symbol.iterator]() {
        reads++;
        return function* () {
          assert.equal(this, input);
          yield name === 'toMap' ? ['key', 7] : 7;
        };
      }
    };
    assert.deepEqual(values(input), [7]);
    assert.equal(reads, 1);
  });
}
for (const name of ['toArray', 'toSet']) {
  test(name + ' validates non-plain array-like length once and preserves indexed holes', () => {
    class Container {}
    const input = Object.assign(new Container(), { 0: 'a', 2: 'c' });
    let reads = 0;
    Object.defineProperty(input, 'length', {
      get() {
        reads++;
        return 3;
      }
    });
    assert.deepEqual([...Types[name](input)], ['a', undefined, 'c']);
    assert.equal(reads, 1);
    for (const length of [undefined, -1, 1.5, Infinity, NaN, '2', Object(2), 9007199254740992]) {
      assert.throws(() => Types[name](Object.assign(new Container(), { length })), TypeError);
    }
    assert.deepEqual([...Types[name](Object.assign(new Container(), { length: 0 }))], []);
  });
  test(name + ' uses the same value sources without unboxing or parsing strings', () => {
    assert.deepEqual([...Types[name]('A😀B')], ['A', '😀', 'B']);
    assert.deepEqual([...Types[name](new Map([['a', 1]]))], [['a', 1]]);
    const array = Types[name](Array(2));
    assert.deepEqual([...array], name === 'toArray' ? [undefined, undefined] : [undefined]);
  });
}
test('toMap rejects incomplete, extra, sparse and non-array pairs and closes their iterator', () => {
  for (const pair of [
    [],
    ['a'],
    ['a', 1, 2],
    Array(2),
    Object.assign(Array(2), { 0: 'a' }),
    { 0: 'a', 1: 1, length: 2 }
  ]) {
    let closed = 0;
    function* input() {
      try {
        yield pair;
      } finally {
        closed++;
      }
    }
    assert.throws(() => Types.toMap(input()), TypeError);
    assert.equal(closed, 1);
  }
  assert.deepEqual([...Types.toMap([['a', undefined]])], [['a', undefined]]);
  const key = {};
  assert.equal(
    Types.toMap([
      [key, 1],
      [key, 2]
    ]).get(key),
    2
  );
});

for (const name of ['toArray', 'toSet', 'toMap', 'toPlainObject']) {
  test(name + ' reads an enumerable nullish iterator getter only once', () => {
    for (const method of [null, undefined]) {
      let reads = 0;
      const input = {
        a: 1,
        get [Symbol.iterator]() {
          if (++reads > 1) throw Error('iterator read twice');
          return method;
        }
      };
      const output = Types[name](input);
      assert.equal(reads, 1);
      if (name === 'toMap') {
        assert.equal(output.has(Symbol.iterator), true);
        assert.equal(output.get(Symbol.iterator), method);
      } else if (name === 'toPlainObject') {
        assert.equal(Object.hasOwn(output, Symbol.iterator), true);
        assert.equal(output[Symbol.iterator], method);
      } else assert.deepEqual([...output], [1, method]);
    }
  });
}

for (const name of ['toMap', 'toSet']) {
  test(name + ' closes an input iterator if native insertion fails without replacing its error', () => {
    const prototype = name === 'toMap' ? Map.prototype : Set.prototype;
    const key = name === 'toMap' ? 'set' : 'add';
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const failure = { insertion: true };
    let closed = 0;
    const input = {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        return { value: name === 'toMap' ? ['a', 1] : 1, done: false };
      },
      return() {
        closed++;
        throw Error('close failed');
      }
    };
    try {
      Object.defineProperty(prototype, key, {
        configurable: true,
        value() {
          throw failure;
        }
      });
      assert.throws(
        () => Types[name](input),
        (error) => error === failure
      );
      assert.equal(closed, 1);
    } finally {
      Object.defineProperty(prototype, key, descriptor);
    }
  });
}
