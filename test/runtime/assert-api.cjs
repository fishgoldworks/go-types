'use strict';
// This consumer contract intentionally uses only Node 8 syntax and built-ins.
const assert = require('assert');
const vm = require('vm');
module.exports = function assertAPI(T, PromiseConstructor) {
  // isPromise intentionally follows the library realm's local constructor.
  const LocalPromise = PromiseConstructor || Promise;
  const checked = new Set();
  assert.strictEqual(Object.prototype.hasOwnProperty.call(T, 'createTypeChecker'), false);
  for (const name of [
    'isNonNullish',
    'isObjectLike',
    'isNonFunctionObject',
    'ensureArrayIf',
    'ensureSetIf',
    'ensureMap',
    'ensurePlainObject',
    'isFragment',
    'isEmptyIterable',
    'isBlankIterable',
    'isNonEmptyArray',
    'isNonEmptyMap',
    'isNonEmptySet',
    'isNonEmptyPlainObject'
  ])
    assert.strictEqual(Object.prototype.hasOwnProperty.call(T, name), false, name);
  function result(name, args, expected) {
    checked.add(name);
    assert.strictEqual(T[name].apply(undefined, args), expected, name);
  }
  const emptyNormalisation = T.ensureArray();
  assert.strictEqual(Array.isArray(emptyNormalisation), true);
  assert.strictEqual(emptyNormalisation.length, 0);
  assert.notStrictEqual(emptyNormalisation, T.ensureArray());
  const normalised = Object.freeze([1, 2]);
  result('ensureArray', [normalised], normalised);
  for (const value of [null, undefined, false, '', 1, new Set([1, 2])]) {
    const items = T.ensureArray(value);
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0], value);
  }
  const sparseArray = [];
  sparseArray.length = 2;
  assert.strictEqual(T.ensureArray(sparseArray), sparseArray);
  assert.strictEqual(0 in sparseArray, false);
  const existingSet = new Set([1, 2]);
  result('ensureSet', [existingSet], existingSet);
  assert.strictEqual(T.ensureSet().size, 0);
  assert.notStrictEqual(T.ensureSet(), T.ensureSet());
  assert.deepStrictEqual(Array.from(T.ensureSet([1, 2, 1])), [1, 2]);
  for (const value of [undefined, null, 'read', false, {}, new Map(), new Uint8Array(2), LocalPromise.resolve(1)]) {
    const output = T.ensureSet(value);
    assert.strictEqual(output.size, 1);
    assert.strictEqual(output.has(value), true);
  }
  const foreignSet = vm.runInNewContext('new Set([1, 2])');
  assert.strictEqual(T.ensureSet(foreignSet), foreignSet);
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
    ['isCircular', cycle, {}],
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
    ['isPromiseLike', { then() {} }, { then: true }],
    ['isError', new Error('x'), Object.create(Error.prototype)],
    ['isArrayBuffer', data, {}],
    ['isArrayBufferView', new Uint8Array(data), data],
    ['isTypedArray', new Uint8Array(data), new DataView(data)],
    ['isDataView', new DataView(data), data],
    ['isIteratorLike', { next() {} }, {}],
    ['isNotNullish', 0, null],

    ['isJson', 'null', 'undefined']
  ];
  for (const entry of predicates) {
    result(entry[0], [entry[1]], true);
    result(entry[0], [entry[2]], false);
  }
  // Protocol detection must not subscribe or inspect optional convenience methods.
  let thenReads = 0;
  result(
    'isPromiseLike',
    [
      {
        get then() {
          thenReads++;
          return function () {
            throw Error('Do not invoke then');
          };
        },
        get catch() {
          throw Error('Do not read catch');
        },
        get finally() {
          throw Error('Do not read finally');
        }
      }
    ],
    true
  );
  assert.strictEqual(thenReads, 1);
  // Node 8 can enumerate a hidden own property when a dictionary object shadows
  // an enumerable inherited key. Hidden getters must remain unread as well.
  for (const nullPrototype of [true, false]) {
    for (const accessor of [false, true]) {
      const value = nullPrototype ? Object.create(null) : { temporary: 1 };
      delete value.temporary;
      const proto = { edge: value };
      Object.setPrototypeOf(value, proto);
      result('isCircular', [value], true);
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
      result('isCircular', [value], false);
      assert.strictEqual(reads, 0, 'A hidden getter must not be invoked');
      Object.defineProperty(value, 'edge', { enumerable: true });
      result('isCircular', [value], true);
      assert.strictEqual(reads, accessor ? 1 : 0);
    }
  }
  const mapCycle = new Map(),
    keyCycle = new Map(),
    setCycle = new Set();
  mapCycle.set('self', mapCycle);
  keyCycle.set(keyCycle, 0);
  setCycle.add(setCycle);
  for (const value of [mapCycle, keyCycle, setCycle]) result('isCircular', [value], true);
  const sharedCollectionLeaf = {};
  result(
    'isCircular',
    [{ map: new Map([[sharedCollectionLeaf, sharedCollectionLeaf]]), set: new Set([sharedCollectionLeaf]) }],
    false
  );
  const mixedCycle = { members: new Set() };
  mixedCycle.members.add({ parent: mixedCycle });
  result('isCircular', [mixedCycle], true);
  for (const name of ['isNode', 'isElement', 'isDocumentFragment']) result(name, [{}], false);
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
    result(
      pair[0],
      [pair[1], (value) => typeof value === 'number' || value === null || typeof value === 'string'],
      true
    );
    result(pair[0], [pair[1], 'boolean'], false);
  }
  result('isMapOf', [new Map([['x', 1]]), 'string', 'number'], true);
  result('isMapOf', [new Map([['x', '1']]), 'string', 'number'], false);
  const matcherChecks = [
    (matcher) => T.isArrayOf([1], matcher),
    (matcher) => T.isArrayLikeOf({ 0: 1, length: 1 }, matcher),
    (matcher) => T.isSetOf(new Set([1]), matcher),
    (matcher) => T.isMapOf(new Map([[1, 1]]), matcher, 'number'),
    (matcher) => T.isMapOf(new Map([[1, 1]]), 'number', matcher)
  ];
  for (const check of matcherChecks) {
    let calls = 0;
    assert.strictEqual(
      check(function (value) {
        calls++;
        assert.strictEqual(this, undefined);
        assert.strictEqual(arguments.length, 1);
        return value === 1;
      }),
      true
    );
    assert.strictEqual(calls, 1);
    assert.strictEqual(
      check(() => false),
      false
    );
    for (const matcher of [undefined, null, new String('number'), ['number'], { predicate: T.isNumber }]) {
      assert.throws(
        () => check(matcher),
        (error) => error.name === 'TypeError'
      );
    }
    for (const result of [1, new Boolean(true), Promise.resolve(true)]) {
      assert.throws(
        () => check(() => result),
        (error) => error.name === 'TypeError'
      );
    }
    const failure = {};
    assert.throws(
      () =>
        check(() => {
          throw failure;
        }),
      (error) => error === failure
    );
  }
  assert.throws(
    () => T.isMapOf(new Map(), 'number'),
    (error) => error.name === 'TypeError'
  );
  assert.throws(
    () => T.isArrayOf([]),
    (error) => error.name === 'TypeError'
  );
  assert.strictEqual(T.isTypeOf, undefined);
  assert.strictEqual(T.isInstanceOf, undefined);
  assert.strictEqual(
    T.isArrayOf([1, null], (value) => typeof value === 'number' || value === null),
    true
  );
  assert.throws(
    () => T.isArrayOf([], ['number']),
    (error) => error.name === 'TypeError'
  );
  assert.throws(
    () => T.isMapOf(new Map(), 'string'),
    (error) => error.name === 'TypeError'
  );

  const plainSymbol = Symbol('plain');
  const plainNested = { value: 1 };
  const plainInput = Object.create(null);
  plainInput.a = plainNested;
  plainInput[plainSymbol] = 2;
  Object.defineProperty(plainInput, 'hidden', { value: 3 });
  const plain = T.toPlainObject(plainInput);
  assert.strictEqual(Object.getPrototypeOf(plain), Object.getPrototypeOf(LocalPromise.prototype));
  assert.notStrictEqual(plain, plainInput);
  assert.strictEqual(plain.a, plainNested);
  assert.strictEqual(plain[plainSymbol], 2);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(plain, 'hidden'), false);
  const special = T.toPlainObject([['__proto__', { injected: true }]]);
  assert.strictEqual(Object.getPrototypeOf(special), Object.getPrototypeOf(LocalPromise.prototype));
  assert.strictEqual(special.injected, undefined);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(special, '__proto__'), true);
  assert.throws(
    () => T.toPlainObject(null),
    (error) => error.name === 'TypeError'
  );
  assert.throws(
    () => T.toPlainObject([['a']]),
    (error) => error.name === 'TypeError'
  );
  assert.throws(
    () => T.toPlainObject([[1, 2]]),
    (error) => error.name === 'TypeError'
  );
  assert.throws(
    () => T.toPlainObject('[]'),
    (error) => error.name === 'TypeError'
  );
  assert.throws(
    () => T.toPlainObject('{'),
    (error) => error.name === 'TypeError'
  );
  for (const text of ['{"a":1}', '[["a",1]]', 'ordinary text', '']) {
    assert.throws(
      () => T.toPlainObject(text),
      (error) => error.name === 'TypeError'
    );
    assert.throws(
      () => T.toPlainObjectIf(text, true),
      (error) => error.name === 'TypeError'
    );
    assert.strictEqual(T.toPlainObjectIf(text, false), text);
    assert.strictEqual(T.toPlainObjectIf(text), text);
    assert.strictEqual(
      T.toPlainObjectIf(text, function () {
        return false;
      }),
      text
    );
  }
  assert.strictEqual(T.toPlainObjectIf(null, false), null);
  let plainClosed = false;
  assert.throws(
    () =>
      T.toPlainObject(
        (function* () {
          try {
            yield ['a', 1];
            yield ['bad'];
          } finally {
            plainClosed = true;
          }
        })()
      ),
    (error) => error.name === 'TypeError'
  );
  assert.strictEqual(plainClosed, true);
  assert.strictEqual('toObject' in T, false);
  assert.strictEqual('toObjectIf' in T, false);

  const collectionSymbol = Symbol('record value');
  const collectionRecord = { a: 1, length: 2, [collectionSymbol]: 3 };
  assert.deepStrictEqual(Array.from(T.toArray(collectionRecord)), [1, 2, 3]);
  assert.deepStrictEqual(Array.from(T.toSet(collectionRecord)), [1, 2, 3]);
  assert.strictEqual(T.toMap(collectionRecord).get(collectionSymbol), 3);
  for (const pair of [[], ['a'], ['a', 1, 2], Array(2), { 0: 'a', 1: 1, length: 2 }]) {
    let closed = false;
    function* entries() {
      try {
        yield pair;
      } finally {
        closed = true;
      }
    }
    assert.throws(
      () => T.toMap(entries()),
      (error) => error.name === 'TypeError'
    );
    assert.strictEqual(closed, true);
  }
  assert.strictEqual(T.toMap([['a', undefined]]).has('a'), true);
  for (const name of ['toArray', 'toSet', 'toMap'])
    assert.throws(
      () => T[name](Object('abc')),
      (error) => error.name === 'TypeError'
    );
  const revivedKeys = [];
  const revivedJson = T.parseJson('{"a":1}', function (key, value, context) {
    assert.strictEqual(this[key], value);
    revivedKeys.push(key);
    if (Number(process.versions.node.split('.')[0]) === 8) assert.strictEqual(context, undefined);
    return typeof value === 'number' ? value + 1 : value;
  });
  assert.strictEqual(revivedJson.a, 2);
  assert.strictEqual(revivedKeys.join(','), 'a,');
  assert.throws(
    () => T.parseJson('['),
    (error) => error.name === 'SyntaxError'
  );
  const promiseInput = LocalPromise.resolve(3);
  const conversions = [
    ['parseJson', '{"a":1}', (value) => value.a, 1],
    ['box', 3, (value) => Number.prototype.valueOf.call(value), 3],
    ['unbox', Object(3), (value) => value, 3],
    ['toRegExp', 'a', (value) => value.source, 'a'],
    ['toPromise', promiseInput, (value) => value, promiseInput],
    ['toArray', new Set([1, 2]), (value) => Array.from(value).join(','), '1,2'],
    ['toBoolean', 'false', (value) => value, true],
    ['toDate', 0, (value) => value.getTime(), 0],
    ['toInteger', '2.7', (value) => value, 2],
    ['toJson', { a: 1 }, (value) => value, '{"a":1}'],
    [
      'toMap',
      [
        ['key', 1],
        ['key', 2]
      ],
      (value) => value.get('key'),
      2
    ],
    ['toMap', { a: 1, b: 2 }, (value) => value.get('a') + value.get('b'), 3],
    ['toSet', [2, 1, 2], (value) => Array.from(value).join(','), '2,1'],
    ['toNumber', '12.5', (value) => value, 12.5],
    ['toPlainObject', { a: 12 }, (value) => value.a, 12],
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
