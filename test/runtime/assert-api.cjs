'use strict';
// This consumer contract intentionally uses only Node 8 syntax and built-ins.
const assert = require('assert');
const vm = require('vm');
module.exports = function assertAPI(T, PromiseConstructor) {
  // isPromise intentionally follows the library realm's local constructor.
  const LocalPromise = PromiseConstructor || Promise;
  const checked = new Set();
  function result(name, args, expected) {
    checked.add(name);
    assert.strictEqual(T[name].apply(undefined, args), expected, name);
  }
  const cycle = {};
  cycle.self = cycle;
  const data = new ArrayBuffer(8);
  const predicates = [
    ['isUndefined', undefined, null],
    ['isNull', null, undefined],
    ['isBoolean', new Boolean(false), 0],
    ['isNumber', new Number(1), '1'],
    ['isString', new String('x'), 1],
    ['isSymbol', Symbol('x'), 'x'],
    ['isPrimitive', null, {}],
    ['isNullish', undefined, 0],
    ['isEmpty', [], [0]],
    ['isBlank', [null], [0]],
    ['isTruthy', 1, 0],
    ['isFalsy', 0, 1],
    ['isInteger', 2, 2.5],
    ['isSafeInteger', Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1],
    ['isFloat', 2.5, 2],
    ['isFinite', 0, Infinity],
    ['isInfinite', Infinity, 0],
    ['isNaN', NaN, 'x'],
    ['isNumeric', '12', '  '],
    ['isObject', {}, null],
    ['isPlainObject', Object.create(null), new Date()],
    ['isCyclic', cycle, {}],
    ['isIterable', [], {}],
    ['isArray', [], {}],
    ['isArrayLike', { 0: 'x', length: 1 }, { length: -1 }],
    ['isPair', [1, 2], [1]],
    ['isMap', new Map(), {}],
    ['isSet', new Set(), {}],
    ['isWeakMap', new WeakMap(), {}],
    ['isWeakSet', new WeakSet(), {}],
    ['isFunction', function () {}, {}],
    ['isDate', new Date(), {}],
    ['isValidDate', new Date(0), new Date(NaN)],
    ['isInvalidDate', new Date(NaN), new Date(0)],
    ['isRegExp', /x/, {}],
    ['isPromise', LocalPromise.resolve(1), {}],
    ['isPromiseLike', { then() {}, catch() {} }, { then() {} }],
    ['isThenable', { then() {} }, {}],
    ['isError', new Error('x'), Object.create(Error.prototype)],
    ['isArrayBuffer', data, {}],
    ['isArrayBufferView', new Uint8Array(data), data],
    ['isTypedArray', new Uint8Array(data), new DataView(data)],
    ['isDataView', new DataView(data), data],
    ['isIteratorLike', { next() {} }, {}],
    ['isNonNullish', 0, null],
    ['isObjectLike', {}, null],
    ['isNonEmptyArray', [1], []],
    ['isJson', 'null', 'undefined'],
    ['isEmptyIterable', [], [1]],
    ['isBlankIterable', [null, undefined], [0]]
  ];
  for (const entry of predicates) {
    result(entry[0], [entry[1]], true);
    result(entry[0], [entry[2]], false);
  }
  // Node 8 can enumerate a hidden own property when a dictionary object shadows
  // an enumerable inherited key. Hidden getters must remain unread as well.
  for (const nullPrototype of [true, false]) {
    for (const accessor of [false, true]) {
      const value = nullPrototype ? Object.create(null) : { temporary: 1 };
      delete value.temporary;
      const proto = { edge: value };
      Object.setPrototypeOf(value, proto);
      result('isCyclic', [value], true);
      let reads = 0;
      const descriptor = accessor
        ? {
            get() {
              reads++;
              return value;
            }
          }
        : { value };
      Object.defineProperty(value, 'edge', Object.assign(descriptor, { configurable: true, enumerable: false }));
      result('isCyclic', [value], false);
      assert.strictEqual(reads, 0, 'A hidden getter must not be invoked');
      Object.defineProperty(value, 'edge', { enumerable: true });
      result('isCyclic', [value], true);
      assert.strictEqual(reads, accessor ? 1 : 0);
    }
  }
  for (const name of ['isNode', 'isElement', 'isFragment']) result(name, [{}], false);
  result('isSharedArrayBuffer', [{}], false);
  if (typeof SharedArrayBuffer === 'function') result('isSharedArrayBuffer', [new SharedArrayBuffer(4)], true);
  result('isBigInt', [1], false);
  if (typeof BigInt === 'function') result('isBigInt', [BigInt('42')], true);
  result('isAsyncIterable', [{ undefined() {} }], false);
  const unrelated = Object.defineProperty({}, 'undefined', {
    get() {
      throw Error('unrelated getter');
    }
  });
  result('isAsyncIterable', [unrelated], false);
  if (typeof Symbol.asyncIterator === 'symbol') {
    result(
      'isAsyncIterable',
      [
        {
          [Symbol.asyncIterator]() {
            throw Error('must not invoke');
          }
        }
      ],
      true
    );
  }
  for (const pair of [
    ['isArrayOf', [1, 2]],
    ['isArrayLikeOf', { 0: 1, 1: 2, length: 2 }],
    ['isSetOf', new Set([1, 2])]
  ]) {
    result(pair[0], [pair[1], [['number', null], 'string']], true);
    result(pair[0], [pair[1], 'boolean'], false);
  }
  result('isMapOf', [new Map([['x', 1]]), 'string', 'number'], true);
  result('isMapOf', [new Map([['x', '1']]), 'string', 'number'], false);
  result('isTypeOf', [1, [['number', 'string'], null]], true);
  result('isTypeOf', [false, [['number', 'string'], null]], false);
  checked.add('createTypeChecker');
  const shared = ['number', 'string'];
  const check = T.createTypeChecker([shared, [shared, null]]);
  for (const value of [1, 'x', null]) assert.strictEqual(check(value), true);
  assert.strictEqual(check(false), false);
  let calls = 0;
  const predicate = {
    predicate() {
      calls++;
      return false;
    }
  };
  assert.strictEqual(T.createTypeChecker([[predicate], [predicate], 'number'])(1), true);
  assert.strictEqual(calls, 2);
  const recursive = [];
  recursive.push(recursive);
  assert.throws(() => T.createTypeChecker(recursive), /cycles/);

  const conversions = [
    ['toArray', new Set([1, 2]), (value) => Array.from(value).join(','), '1,2'],
    ['toBoolean', 'false', (value) => value, true],
    ['toDate', 0, (value) => value.getTime(), 0],
    ['toInteger', '2.7', (value) => value, 2],
    [
      'toMap',
      [
        ['key', 1],
        ['key', 2]
      ],
      (value) => value.get('key'),
      2
    ],
    ['toSet', [2, 1, 2], (value) => Array.from(value).join(','), '2,1'],
    ['toNumber', '12.5', (value) => value, 12.5],
    ['toObject', 12, (value) => value.valueOf(), 12],
    ['toString', null, (value) => value, 'null'],
    ['toSymbol', 'key', (value) => value.toString(), 'Symbol(key)']
  ];
  const untouched = {
    [Symbol.toPrimitive]() {
      throw Error('skipped conversion coerced its input');
    }
  };
  for (const entry of conversions) {
    const name = entry[0],
      conditional = name + 'If';
    checked.add(name);
    checked.add(conditional);
    assert.strictEqual(entry[2](T[name](entry[1])), entry[3], name);
    assert.strictEqual(entry[2](T[conditional](entry[1], true)), entry[3], conditional);
    assert.strictEqual(T[conditional](untouched, false), untouched);
    assert.strictEqual(
      T[conditional](untouched, () => false),
      untouched
    );
  }
  checked.add('toBigInt');
  checked.add('toBigIntIf');
  assert.strictEqual(T.toBigIntIf(untouched, false), untouched);
  assert.strictEqual(
    T.toBigIntIf(untouched, () => false),
    untouched
  );
  if (typeof BigInt === 'function') {
    assert.strictEqual(T.toBigInt('9007199254740993').toString(), '9007199254740993');
    assert.strictEqual(T.toBigIntIf('42', true).toString(), '42');
  } else {
    const unsupported = (error) =>
      error.name === 'TypeError' && error.message === 'Native BigInt conversion is unavailable in this runtime.';
    assert.throws(() => T.toBigInt(untouched), unsupported);
    assert.throws(() => T.toBigIntIf(untouched, true), unsupported);
  }
  const applicationError = Error('application error');
  assert.throws(
    () =>
      T.toNumberIf(untouched, () => {
        throw applicationError;
      }),
    (error) => error === applicationError
  );
  assert.throws(
    () =>
      T.isArrayOf(
        new Proxy([1], {
          get(target, key) {
            if (key === '0') throw applicationError;
            return Reflect.get(target, key);
          }
        }),
        'number'
      ),
    (error) => error === applicationError
  );
  let closed = false;
  function* iterator() {
    try {
      yield 1;
      yield 2;
    } finally {
      closed = true;
    }
  }
  result('isEmptyIterable', [iterator()], false);
  assert.strictEqual(closed, true);
  for (const entry of [
    ['isDate', 'new Date(0)'],
    ['isMap', 'new Map()'],
    ['isTypedArray', 'new Uint8Array(2)']
  ]) {
    result(entry[0], [vm.runInNewContext(entry[1])], true);
  }
  assert.deepStrictEqual(
    Array.from(checked).sort(),
    Object.keys(T).sort(),
    'Every public function needs a runtime consumer check'
  );
  return checked.size;
};
