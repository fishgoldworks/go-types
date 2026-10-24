'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const compileTypeMatcher = require('../src/util/compileTypeMatcher');
const vm = require('node:vm');
const T = require('../');
const F = (s) => vm.runInNewContext(s);
const primitives = [undefined, null, false, true, 0, -0, NaN, Infinity, -Infinity, '', 'x', 0n, 1n, Symbol('x')];
const nativeCases = [
  ['boolean', new Boolean(false), 'isBoolean'],
  ['number', new Number(NaN), 'isNumber'],
  ['string', new String(''), 'isString'],
  ['date', new Date(NaN), 'isDate'],
  ['regexp', /x/g, 'isRegExp'],
  ['map', new Map(), 'isMap'],
  ['set', new Set(), 'isSet'],
  ['weakmap', new WeakMap(), 'isWeakMap'],
  ['weakset', new WeakSet(), 'isWeakSet'],
  ['arraybuffer', new ArrayBuffer(8), 'isArrayBuffer'],
  ['shared', new SharedArrayBuffer(8), 'isSharedArrayBuffer'],
  ['dataview', new DataView(new ArrayBuffer(8)), 'isDataView'],
  ['typed', new Uint8Array(2), 'isTypedArray']
];
for (const [label, _, name] of nativeCases) {
  test(name + ' rejects unrelated native identities, ordinary objects and callable values', () => {
    for (const [other, input] of nativeCases) if (other !== label) assert.equal(T[name](input), false, other);
    for (const input of [{}, Object.create(null), [], () => {}, class A {}]) assert.equal(T[name](input), false);
  });
  test(name + ' primitive inputs follow its declared primitive/boxed policy', () => {
    const allowed = { isBoolean: 'boolean', isNumber: 'number', isString: 'string' }[name];
    for (const input of primitives) assert.equal(T[name](input), typeof input === allowed);
  });
}
for (const n of [
  -Number.MAX_VALUE,
  -9007199254740992,
  -Number.MAX_SAFE_INTEGER,
  -1.5,
  -1,
  -Number.MIN_VALUE,
  -0,
  0,
  Number.MIN_VALUE,
  0.5,
  1,
  1.5,
  Number.MAX_SAFE_INTEGER,
  9007199254740992,
  Number.MAX_VALUE,
  NaN,
  Infinity,
  -Infinity
]) {
  for (const [label, make] of [
    ['primitive', () => n],
    ['boxed', () => new Number(n)],
    ['foreign boxed', () => F('new Number(' + String(n) + ')')]
  ]) {
    test('numeric partition ' + label + ' ' + String(n), () => {
      const v = make();
      assert.equal(T.isNumber(v), true);
      assert.equal(T.isFinite(v), Number.isFinite(n));
      assert.equal(T.isInfinite(v), n === Infinity || n === -Infinity);
      assert.equal(T.isNaN(v), Number.isNaN(n));
      assert.equal(T.isInteger(v), Number.isInteger(n));
      assert.equal(T.isSafeInteger(v), Number.isSafeInteger(n));
      assert.equal(T.isFloat(v), Number.isFinite(n) && !Number.isInteger(n));
    });
  }
}
for (const value of [null, undefined, {}, [], () => {}, '1', true, 1n, Symbol()]) {
  test('numeric refinements do not coerce ' + String(value), () => {
    for (const name of ['isFinite', 'isInfinite', 'isNaN', 'isInteger', 'isFloat', 'isSafeInteger'])
      assert.equal(T[name](value), false, name);
  });
}
test('array capture survives later replacement and preserves revoked-proxy exception', () => {
  const original = Array.isArray;
  try {
    Array.isArray = () => false;
    assert.equal(T.isArray([]), true);
  } finally {
    Array.isArray = original;
  }
  const { proxy, revoke } = Proxy.revocable([], {});
  revoke();
  assert.throws(() => T.isArray(proxy), TypeError);
});
test('binary view capture survives later replacement', () => {
  const original = ArrayBuffer.isView;
  try {
    ArrayBuffer.isView = () => false;
    assert.equal(T.isArrayBufferView(new Uint8Array()), true);
    assert.equal(T.isTypedArray(new Uint8Array()), true);
  } finally {
    ArrayBuffer.isView = original;
  }
});
test('captured boxed-number operations survive later override of the intrinsic', () => {
  const original = Number.prototype.valueOf;
  try {
    Number.prototype.valueOf = () => {
      throw Error('replacement');
    };
    assert.equal(T.isNumber(new Number(1)), true);
    assert.equal(T.isInteger(new Number(1)), true);
  } finally {
    Number.prototype.valueOf = original;
  }
});
test('array wrappers accept live proxies of genuine arrays but not prototype imitations', () => {
  assert.equal(T.isArray(new Proxy([], {})), true);
  assert.equal(T.isArrayOf(new Proxy([1, 2], {}), 'number'), true);
  assert.equal(T.isArray(new Proxy(Object.create(Array.prototype), {})), false);
});
test('collection length is snapshotted but indexed reads remain live and inherited', () => {
  const value = [1, 2];
  const seen = [];
  assert.equal(
    T.isArrayOf(value, {
      predicate(x) {
        seen.push(x);
        value.push(3);
        return true;
      }
    }),
    true
  );
  assert.deepEqual(seen, [1, 2]);
  const x = new Array(2),
    p = Object.create(Array.prototype);
  p[0] = 1;
  p[1] = 2;
  Object.setPrototypeOf(x, p);
  assert.equal(T.isArrayOf(x, 'number'), true);
});
test('throwing value accessors propagate their original error', () => {
  const error = Error('getter');
  const a = [];
  Object.defineProperty(a, 0, {
    get() {
      throw error;
    }
  });
  assert.throws(
    () => T.isArrayOf(a, 'number'),
    (e) => e === error
  );
  assert.throws(
    () => T.isBlank(a),
    (e) => e === error
  );
  assert.throws(
    () =>
      T.isArrayLike({
        get length() {
          throw error;
        }
      }),
    (e) => e === error
  );
  assert.throws(
    () =>
      T.isThenable({
        get then() {
          throw error;
        }
      }),
    (e) => e === error
  );
  assert.throws(
    () =>
      T.isIterable({
        get [Symbol.iterator]() {
          throw error;
        }
      }),
    (e) => e === error
  );
});
test('nonempty checks do not read values simply to count keys or elements', () => {
  const x = {
    get a() {
      throw Error('must not read');
    }
  };
  assert.equal(T.isEmpty(x), false);
  const a = [];
  Object.defineProperty(a, 0, {
    get() {
      throw Error('must not read');
    }
  });
  assert.equal(T.isEmpty(a), false);
  assert.equal(T.isNonEmptyArray(a), true);
});
test('native Promise check retains realm/prototype semantics; thenable checks do not subscribe', () => {
  assert.equal(T.isPromise(Promise.resolve(1)), true);
  assert.equal(T.isPromise(F('Promise.resolve(1)')), false);
  assert.equal(T.isPromise(Object.create(Promise.prototype)), true);
  let calls = 0;
  const x = {
    then() {
      calls++;
    },
    catch() {
      calls++;
    }
  };
  assert.equal(T.isThenable(x), true);
  assert.equal(T.isPromiseLike(x), true);
  assert.equal(T.isPromise(x), false);
  assert.equal(calls, 0);
});
test('DOM checks return false when the corresponding constructors are absent', () => {
  for (const value of [null, {}, { nodeType: 1 }, () => {}]) {
    assert.equal(T.isNode(value), false);
    assert.equal(T.isElement(value), false);
    assert.equal(T.isFragment(value), false);
  }
});
test('cross-realm arrows defer native instance errors until evaluation', () => {
  const arrow = F('(()=>true)');
  const check = compileTypeMatcher(arrow);
  assert.equal(check(1), false);
  assert.throws(
    () => check({}),
    (error) => error.name === 'TypeError'
  );
});
test('invalid and throwing Symbol.hasInstance configurations are observable', () => {
  function A() {}
  Object.defineProperty(A, Symbol.hasInstance, { value: 1 });
  assert.throws(() => compileTypeMatcher(A), TypeError);
  const error = Error('hook');
  function B() {}
  Object.defineProperty(B, Symbol.hasInstance, {
    value() {
      throw error;
    }
  });
  const check = compileTypeMatcher(B);
  assert.throws(
    () => check(1),
    (e) => e === error
  );
});
test('collection constraints validate complete matcher configurations before reading input', () => {
  let reads = 0;
  const input = {
    get length() {
      reads++;
      return 0;
    }
  };
  assert.throws(() => T.isArrayLikeOf(input, ['number', 42]), TypeError);
  assert.equal(reads, 0);
});
for (const fn of ['isEmptyIterable', 'isBlankIterable']) {
  test(fn + ' closes after early false and rejects invalid return results', () => {
    let returns = 0;
    const iterable = {
      [Symbol.iterator]() {
        return {
          next() {
            return { value: 1, done: false };
          },
          return() {
            returns++;
            return 1;
          }
        };
      }
    };
    assert.throws(() => T[fn](iterable), TypeError);
    assert.equal(returns, 1);
  });
  test(fn + ' propagates thrown next errors without inventing IteratorClose', () => {
    let returns = 0;
    const error = Error('next');
    const iterable = {
      [Symbol.iterator]() {
        return {
          next() {
            throw error;
          },
          return() {
            returns++;
            return { done: true };
          }
        };
      }
    };
    assert.throws(
      () => T[fn](iterable),
      (e) => e === error
    );
    assert.equal(returns, 0);
  });
}
test('default container checks never consume caller Map/Set iterators', () => {
  const map = new Map([['a', null]]),
    set = new Set([null]);
  const m = map.values(),
    s = set.values();
  assert.equal(T.isBlank(map), true);
  assert.equal(T.isBlank(set), true);
  assert.deepEqual(m.next(), { value: null, done: false });
  assert.deepEqual(s.next(), { value: null, done: false });
});
test('JSON checks accept JSON scalars but reject JS-only syntax and non-string coercion', () => {
  for (const text of ['true', 'false', 'null', '0', '-0', '1e2', '""', '"\\u0041"', '[1,null]', '{"__proto__":{}}'])
    assert.equal(T.isJson(text), true, text);
  for (const text of [
    "{'a':1}",
    '[1,]',
    '{"a":1,}',
    '//comment\n{}',
    'NaN',
    'Infinity',
    'undefined',
    '01',
    '+1',
    '1n',
    '{"a":undefined}'
  ])
    assert.equal(T.isJson(text), false, text);
  let calls = 0;
  assert.equal(
    T.isJson({
      toString() {
        calls++;
        return '{}';
      }
    }),
    false
  );
  assert.equal(calls, 0);
});
