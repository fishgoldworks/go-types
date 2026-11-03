'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const Types = require('../index.js');

for (const name of ['toArray', 'toMap', 'toSet']) {
  test(name + ' captures iterator and next once and does not request closing after exhaustion', () => {
    const events = [];
    const item = {};
    let steps = 0;
    const iterator = {
      get next() {
        events.push('get next');
        return function () {
          assert.equal(this, iterator);
          events.push('step');
          Object.defineProperty(iterator, 'next', {
            value: () => {
              throw Error('next was read again');
            }
          });
          if (steps++ === 0) return { value: name === 'toMap' ? ['key', item] : item, done: false };
          return {
            done: true,
            get value() {
              throw Error('completed value was read');
            }
          };
        };
      },
      get return() {
        throw Error('exhaustion must not request closing');
      }
    };
    const input = {
      get [Symbol.iterator]() {
        events.push('get iterator');
        return function () {
          assert.equal(this, input);
          events.push('acquire');
          return iterator;
        };
      }
    };
    const result = Types[name](input);
    assert.equal(name === 'toMap' ? result.get('key') : Array.from(result)[0], item);
    assert.deepEqual(events, ['get iterator', 'acquire', 'get next', 'step', 'step']);
  });

  test(name + ' retains stepping-error identity without synthesising a close request', () => {
    for (const stage of ['next', 'done', 'value']) {
      const failure = { stage };
      let returnReads = 0;
      const input = {
        [Symbol.iterator]() {
          return this;
        },
        next() {
          if (stage === 'next') throw failure;
          return {
            get done() {
              if (stage === 'done') throw failure;
              return false;
            },
            get value() {
              throw failure;
            }
          };
        },
        get return() {
          returnReads++;
          return () => ({});
        }
      };
      assert.throws(
        () => Types[name](input),
        (error) => error === failure
      );
      assert.equal(returnReads, 0);
    }
  });

  test(name + ' honours an overridden iterator instead of copying an existing collection by brand', () => {
    const original = name === 'toArray' ? [1] : name === 'toMap' ? new Map([['old', 1]]) : new Set([1]);
    const item = {};
    let calls = 0;
    Object.defineProperty(original, Symbol.iterator, {
      value: function* () {
        calls++;
        yield name === 'toMap' ? ['new', item] : item;
      }
    });
    Object.defineProperty(original, 'constructor', {
      get() {
        throw Error('constructor read');
      }
    });
    const result = Types[name].call(function WrongConstructor() {
      throw Error('receiver used');
    }, original);
    assert.notEqual(result, original);
    const prototype = name === 'toArray' ? Array.prototype : name === 'toMap' ? Map.prototype : Set.prototype;
    assert.equal(Object.getPrototypeOf(result), prototype);
    assert.equal(name === 'toMap' ? result.get('new') : Array.from(result)[0], item);
    assert.equal(calls, 1);
  });
}

test('toArray snapshots validated length while later indices and inherited values stay live', () => {
  const events = [];
  const input = Object.assign(Object.create({ 1: 'inherited' }), { 1: 'deleted' });
  Object.defineProperties(input, {
    length: {
      get() {
        events.push('length');
        return 2;
      }
    },
    0: {
      get() {
        events.push('0');
        delete input[1];
        return 'first';
      }
    }
  });
  const output = Types.toArray(input);
  assert.deepEqual(output, ['first', 'inherited']);
  assert.deepEqual(events, ['length', '0']);
});

test('toMap reads entry slots in order without enumerating or iterating the entry', () => {
  const events = [];
  const key = {};
  const value = {};
  const entry = ['key', undefined];
  Object.defineProperties(entry, {
    0: {
      get() {
        events.push('0');
        Object.defineProperty(entry, '1', { value, configurable: true });
        return key;
      }
    },
    1: {
      configurable: true,
      get() {
        throw Error('replaced value read');
      }
    },
    [Symbol.iterator]: {
      get() {
        throw Error('entry iterated');
      }
    }
  });
  const result = Types.toMap([entry]);
  assert.equal(result.get(key), value);
  assert.deepEqual(events, ['0']);
});

test('toMap preserves the entry error even when closing throws or returns a non-object', () => {
  for (const result of ['getter-error', 'call-error', 'primitive', 'thenable']) {
    const entryError = { result };
    const closeError = Error('close failed');
    const events = [];
    const entry = Object.defineProperty(['key', 1], '0', {
      get() {
        events.push('entry');
        throw entryError;
      }
    });
    const input = {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        events.push('step');
        return { done: false, value: entry };
      },
      get return() {
        events.push('get return');
        if (result === 'getter-error') throw closeError;
        return function () {
          assert.equal(this, input);
          events.push('close');
          if (result === 'call-error') throw closeError;
          if (result === 'primitive') return 1;
          return {
            get then() {
              throw Error('cleanup awaited');
            }
          };
        };
      }
    };
    assert.throws(
      () => Types.toMap(input),
      (error) => error === entryError
    );
    const expected =
      result === 'getter-error' ? ['step', 'entry', 'get return'] : ['step', 'entry', 'get return', 'close'];
    assert.deepEqual(events, expected);
  }
});

test('collection conversions retain thenables and cyclic references without awaiting or recursive copying', () => {
  const thenable = {
    get then() {
      throw Error('item awaited');
    }
  };
  const array = [thenable];
  array.push(array);
  const map = new Map([['item', thenable]]);
  map.set('self', map);
  const set = new Set([thenable]);
  set.add(set);
  const newArray = Types.toArray(array);
  const newMap = Types.toMap(map);
  const newSet = Types.toSet(set);
  assert.notEqual(newArray, array);
  assert.equal(newArray[0], thenable);
  assert.equal(newArray[1], array);
  assert.notEqual(newMap, map);
  assert.equal(newMap.get('item'), thenable);
  assert.equal(newMap.get('self'), map);
  assert.notEqual(newSet, set);
  assert.equal(newSet.has(thenable), true);
  assert.equal(newSet.has(set), true);
});
