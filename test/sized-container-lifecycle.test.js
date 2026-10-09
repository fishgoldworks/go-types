'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const Types = require('../index.js');

const contentChecks = [
  ['array', (matcher) => Types.isArrayOf([1], matcher)],
  ['array-like', (matcher) => Types.isArrayLikeOf({ 0: 1, length: 1 }, matcher)],
  ['Set', (matcher) => Types.isSetOf(new Set([1]), matcher)],
  ['Map key', (matcher) => Types.isMapOf(new Map([[1, 1]]), matcher, 'number')],
  ['Map value', (matcher) => Types.isMapOf(new Map([[1, 1]]), 'number', matcher)]
];
for (const [label, check] of contentChecks) {
  test(label + ' validation invokes each reached predicate with one argument and no supplied receiver', () => {
    const policy = { allowed: true };
    let calls = 0;
    assert.equal(
      check({
        predicate(value) {
          calls++;
          assert.equal(this, undefined);
          assert.equal(arguments.length, 1);
          assert.equal(value, 1);
          return true;
        }
      }),
      true
    );
    function needsReceiver(value) {
      assert.equal(arguments.length, 1);
      assert.equal(value, 1);
      return this.allowed;
    }
    assert.throws(() => check({ predicate: needsReceiver }), TypeError);
    assert.equal(check({ predicate: needsReceiver.bind(policy) }), true);
    policy.allowed = false;
    assert.equal(check({ predicate: needsReceiver.bind(policy) }), false);
    const failure = { label };
    assert.throws(
      () =>
        check({
          predicate() {
            throw failure;
          }
        }),
      (error) => error === failure
    );
    assert.equal(calls, 1);
  });
}

for (const name of ['isArrayOf', 'isArrayLikeOf']) {
  test(name + ' snapshots matcher and length while later inherited positions remain live', () => {
    const prototype = Object.create(Array.prototype);
    prototype[1] = 2;
    const target = [1, 20];
    Object.setPrototypeOf(target, prototype);
    let lengthReads = 0;
    const input = new Proxy(target, {
      get(object, key, receiver) {
        if (key === 'length') lengthReads++;
        return Reflect.get(object, key, receiver);
      }
    });
    const seen = [];
    const matcher = {
      predicate(value) {
        seen.push(value);
        delete target[1];
        target.push('beyond snapshot');
        matcher.predicate = () => {
          throw Error('matcher recompiled');
        };
        return typeof value === 'number';
      }
    };
    assert.equal(Types[name](input, matcher), true);
    assert.deepEqual(seen, [1, 2]);
    assert.equal(lengthReads, 1);
  });

  test(name + ' short-circuits indexed reads and remains usable after a nested failure', () => {
    const failure = { message: 'nested value' };
    const nested = [];
    Object.defineProperty(nested, 0, {
      get() {
        throw failure;
      }
    });
    const input = [1, 2];
    Object.defineProperty(input, 1, {
      get() {
        throw Error('read after mismatch');
      }
    });
    let calls = 0;
    assert.equal(
      Types[name](input, {
        predicate() {
          calls++;
          assert.throws(
            () => Types[name](nested, 'number'),
            (error) => error === failure
          );
          return false;
        }
      }),
      false
    );
    assert.equal(calls, 1);
    assert.equal(Types[name]([1, 2], 'number'), true);
  });
}

test('array and array-like length limits remain distinct without traversing enormous fixtures', () => {
  for (const [length, arrayLength, arrayLikeLength] of [
    [-0, true, true],
    [0xffffffff, true, true],
    [0x100000000, false, true],
    [Number.MAX_SAFE_INTEGER, false, true],
    [Number.MAX_SAFE_INTEGER + 1, false, false]
  ]) {
    let reads = 0;
    const input = new Proxy([], {
      get(_target, key) {
        if (key === 'length') return length;
        if (key === '0') {
          reads++;
          return 'stop';
        }
        throw Error('unexpected property read: ' + String(key));
      }
    });
    assert.equal(Types.isNonEmptyArray(input), arrayLength && length > 0);
    assert.equal(Types.isPair(input), false);
    assert.equal(Types.isArrayLike(input), arrayLikeLength);
    assert.equal(Types.isArrayOf(input, 'number'), arrayLength && length === 0);
    assert.equal(Types.isArrayLikeOf(input, 'number'), arrayLikeLength && length === 0);
    assert.equal(reads, length === 0 ? 0 : Number(arrayLength) + Number(arrayLikeLength));
  }
});

test('cardinality-only checks read length once without inspecting values or iterator properties', () => {
  for (const name of ['isPair', 'isNonEmptyArray', 'isEmpty', 'isArrayLike']) {
    const reads = [];
    const input = new Proxy(new Array(2), {
      get(target, key, receiver) {
        reads.push(key);
        if (key !== 'length') throw Error('non-length read');
        return Reflect.get(target, key, receiver);
      }
    });
    assert.equal(Types[name](input), name !== 'isEmpty');
    assert.deepEqual(reads, ['length']);
  }
});

test('both Map matchers are compiled in order before input inspection or callbacks', () => {
  const events = [];
  let calls = 0;
  const descriptor = (label, predicate) =>
    new Proxy(
      { predicate },
      {
        getOwnPropertyDescriptor(target, key) {
          events.push(label + ':' + String(key));
          return Reflect.getOwnPropertyDescriptor(target, key);
        }
      }
    );
  const input = new Proxy(
    {},
    {
      get() {
        throw Error('input inspected');
      }
    }
  );
  assert.throws(
    () =>
      Types.isMapOf(
        input,
        descriptor('key', () => {
          calls++;
          return true;
        }),
        descriptor('value', 42)
      ),
    TypeError
  );
  assert.deepEqual(events, ['key:predicate', 'key:instanceOf', 'value:predicate', 'value:instanceOf']);
  assert.equal(calls, 0);
});

test('Map validation checks key before value and skips every later callback after a mismatch', () => {
  const input = new Map([
    ['first', 1],
    ['second', 2]
  ]);
  for (const stop of ['none', 'key', 'value']) {
    const calls = [];
    const result = Types.isMapOf(
      input,
      {
        predicate(value) {
          calls.push(['key', value]);
          return stop !== 'key';
        }
      },
      {
        predicate(value) {
          calls.push(['value', value]);
          return stop !== 'value';
        }
      }
    );
    assert.equal(result, stop === 'none');
    const all = [
      ['key', 'first'],
      ['value', 1],
      ['key', 'second'],
      ['value', 2]
    ];
    assert.deepEqual(calls, stop === 'none' ? all : all.slice(0, stop === 'key' ? 1 : 2));
  }
  assert.deepEqual(Array.from(input), [
    ['first', 1],
    ['second', 2]
  ]);
});

for (const family of ['Map', 'Set']) {
  test(family + ' native content and size take precedence over own length, iterator and size getters', () => {
    const input = family === 'Map' ? new Map([['key', null]]) : new Set([null]);
    for (const key of ['length', 'size', 'entries', 'values', 'next', Symbol.iterator, Symbol.asyncIterator]) {
      Object.defineProperty(input, key, {
        get() {
          throw Error('unexpected own read: ' + String(key));
        }
      });
    }
    Object.setPrototypeOf(input, null);
    assert.equal(Types.isEmpty(input), false);
    assert.equal(Types.isBlank(input), true);
    assert.equal(family === 'Map' ? Types.isMapOf(input, 'string', null) : Types.isSetOf(input, null), true);
    assert.equal(family === 'Map' ? Types.isMapOf(input, 'string', 'number') : Types.isSetOf(input, 'number'), false);
    if (family === 'Map') Map.prototype.clear.call(input);
    else Set.prototype.clear.call(input);
    assert.equal(Types.isEmpty(input), true);
    assert.equal(Types.isBlank(input), true);
  });
}

for (const name of ['isEmpty', 'isBlank']) {
  test(name + ' accepts valid size information before inspecting protocol capabilities', () => {
    const input = Object.create(null);
    Object.defineProperty(input, 'length', { value: 0 });
    for (const key of [Symbol.iterator, Symbol.asyncIterator, 'next']) {
      Object.defineProperty(input, key, {
        get() {
          throw Error('protocol inspected');
        }
      });
    }
    assert.equal(Types[name](input), true);
    const failure = { name };
    const badLength = {
      get length() {
        throw failure;
      },
      [Symbol.iterator]() {
        throw Error('iterator invoked');
      }
    };
    assert.throws(
      () => Types[name](badLength),
      (error) => error === failure
    );
  });
}

test('blank dictionaries snapshot own string keys but read their values live', () => {
  const input = Object.create(null);
  Object.defineProperty(input, 'first', {
    enumerable: true,
    get() {
      delete input.second;
      input.added = 42;
      return null;
    }
  });
  input.second = 42;
  input[Symbol('ignored')] = 42;
  Object.defineProperty(input, 'hidden', {
    get() {
      throw Error('hidden read');
    }
  });
  assert.equal(Types.isBlank(input), true);
  assert.equal(Types.isBlank(input), false);
  assert.equal(Types.isEmpty(input), false);
});

test('array-like strings use indexed UTF-16 units rather than iterator code points', () => {
  const text = '\u{1f600}';
  const observed = [];
  assert.equal(
    Types.isArrayLikeOf(text, {
      predicate(value) {
        observed.push(value);
        return true;
      }
    }),
    true
  );
  assert.deepEqual(observed, ['\ud83d', '\ude00']);
  assert.deepEqual(Types.toArray(text), [text]);
});
