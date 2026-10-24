// Shared behaviour checks run inside each isolated source/package/browser realm.
module.exports = function optionalApiChecks() {
  const features = [
    'Set',
    'Map',
    'WeakSet',
    'WeakMap',
    'Symbol',
    'Promise',
    'Promise.resolve',
    'BigInt',
    'SharedArrayBuffer',
    'ArrayBuffer',
    'DataView',
    'Uint8Array',
    'Reflect',
    'ArrayBuffer.isView',
    'Reflect.apply',
    'Number.isFinite',
    'Number.isInteger',
    'Number.isSafeInteger',
    'Math.trunc',
    'Array.from',
    'Object.entries',
    'Object.getOwnPropertySymbols',
    'Reflect.ownKeys',
    'Error.isError',
    'Map.prototype.has',
    'Set.prototype.has',
    'WeakSet.prototype.has',
    'WeakSet.prototype.add',
    'WeakSet.prototype.delete',
    'WeakMap.prototype.has',
    'WeakMap.prototype.get',
    'WeakMap.prototype.set',
    'Map.prototype.entries',
    'Map.prototype.values',
    'Set.prototype.values',
    'Map.prototype.size',
    'Set.prototype.size'
  ];
  const scenarios = [[]].concat(
    features.map((name) => [name]),
    [
      ['Symbol', 'Error.isError'],
      ['Reflect.ownKeys', 'Object.getOwnPropertySymbols'],
      ['Symbol', 'Reflect.ownKeys', 'Object.getOwnPropertySymbols'],
      features
    ]
  );
  function prepare(missing) {
    const held = {
      map: new Map([['a', null]]),
      recordIterable: {
        a: 1,
        [Symbol.iterator]: function* () {
          yield ['from iterator', 2];
        }
      },
      recordSymbol: Symbol('record'),
      symbolRecord: { a: 1 },
      set: new Set([null]),
      weakMap: new WeakMap(),
      weakSet: new WeakSet(),
      buffer: new ArrayBuffer(4),
      view: new DataView(new ArrayBuffer(4)),
      typed: new Uint8Array(2),
      promise: Promise.resolve(1),
      boxedSymbol: Object(Symbol('held')),
      bigint: typeof BigInt === 'function' ? BigInt('12') : undefined,
      boxedBigInt: typeof BigInt === 'function' ? Object(BigInt('12')) : undefined,
      date: new Date(0),
      error: new Error('native'),
      spoofedError: { [Symbol.toStringTag]: 'Error' },
      taggedError: Object.defineProperty({}, Symbol.toStringTag, {
        get() {
          throw Error('Error detection must not evaluate a custom tag');
        }
      }),
      shared: typeof SharedArrayBuffer === 'function' ? new SharedArrayBuffer(4) : undefined
    };
    held.symbolValue = Symbol.prototype.valueOf.call(held.boxedSymbol);
    held.symbolRecord[held.recordSymbol] = 2;
    for (const name of missing) {
      const parts = name.split('.');
      let owner = globalThis;
      for (let index = 0; index < parts.length - 1 && owner; index++) owner = owner[parts[index]];
      if (owner) delete owner[parts[parts.length - 1]];
    }
    return held;
  }
  function check(api, missing, held) {
    let count = 0;
    function equal(actual, expected, label) {
      count++;
      if (actual !== expected) throw Error(label + ': expected ' + expected + ', received ' + actual);
    }
    function throws(action, message) {
      count++;
      try {
        action();
      } catch (error) {
        if (error.name !== 'TypeError' || (message && error.message !== message)) throw error;
        return;
      }
      throw Error('Expected TypeError: ' + (message || 'invalid configuration'));
    }
    const absent = (name) => missing.indexOf(name) !== -1;
    for (const name of missing) {
      const parts = name.split('.');
      let value = globalThis;
      for (const part of parts) value = value && value[part];
      equal(value, undefined, name + ' must not be polyfilled globally');
    }
    equal(api.isArray([]), true, 'unrelated array check');
    equal(api.fromJson('{"a":1}').a, 1, 'JSON parsing without optional capabilities');
    equal(api.fromJson('false'), false, 'JSON boolean parsing');
    equal(
      api.fromJson('1', (key, value) => (typeof value === 'number' ? value + 1 : value)),
      2,
      'JSON reviver'
    );
    equal(api.fromJsonIf('[', false), '[', 'skipped invalid JSON');
    equal(api.box(null), null, 'box preserves null');
    equal(Number.prototype.valueOf.call(api.box(3)), 3, 'box number');
    equal(typeof api.box(held.symbolValue), 'object', 'box held symbol');
    equal(api.unbox(Object(3)), 3, 'unbox number');
    equal(api.unbox(Object(false)), false, 'unbox boolean');
    equal(api.unbox(Object('x')), 'x', 'unbox string');
    equal(
      api.unbox({
        valueOf() {
          throw Error('unbox hook');
        }
      }).valueOf instanceof Function,
      true,
      'unbox ignores hooks'
    );
    equal(
      api.unbox(held.boxedSymbol),
      absent('Symbol') || absent('Symbol.prototype.valueOf') ? held.boxedSymbol : held.symbolValue,
      'optional symbol unboxing'
    );
    if (held.boxedBigInt) {
      equal(
        api.unbox(held.boxedBigInt),
        absent('BigInt') || absent('BigInt.prototype.valueOf') ? held.boxedBigInt : held.bigint,
        'optional bigint unboxing'
      );
      equal(typeof api.box(held.bigint), 'object', 'box held bigint');
    }
    equal(api.toRegExp('a', 'i').test('A'), true, 'regex conversion without optional APIs');
    const hostile = {
      get then() {
        throw Error('must not inspect');
      }
    };
    equal(api.toPromiseIf(hostile, false), hostile, 'skipped Promise conversion');
    if (absent('Promise') || absent('Promise.resolve')) {
      throws(() => api.toPromise(hostile), 'toPromise requires native Promise.resolve support.');
      throws(() => api.toPromiseIf(hostile, true), 'toPromise requires native Promise.resolve support.');
    } else equal(api.toPromise(held.promise), held.promise, 'native Promise identity');
    equal(api.toPlainObject('{"a":1}').a, 1, 'JSON object without optional capabilities');
    equal(api.toPlainObject([['a', 1]]).a, 1, 'plain entry conversion without optional capabilities');
    equal(api.toPlainObjectIf(held.map, false), held.map, 'skipped plain conversion preserves identity');
    const missingKeys = (absent('Reflect') || absent('Reflect.ownKeys')) && absent('Object.getOwnPropertySymbols');
    if (missingKeys) {
      throws(() => api.toPlainObject({ a: 1 }));
    } else {
      equal(api.toPlainObject({ a: 1 }).a, 1, 'record copying without optional capabilities');
      if (!absent('Map.prototype.entries')) equal(api.toPlainObject(held.map).a, null, 'held Map conversion');
    }

    equal(api.isString('x'), true, 'unrelated string check');
    equal(api.isEmpty({}), true, 'empty dictionary');
    equal(api.isBlank({ a: null }), true, 'blank dictionary');
    equal(api.isBlank([null, undefined]), true, 'blank array');
    equal(api.isError(held.spoofedError), false, 'spoofed error tag');
    equal(api.isError(held.taggedError), false, 'custom tag getter stays unread');
    equal(api.isError(Object.create(held.taggedError)), false, 'inherited custom tag getter stays unread');
    equal(
      api.isError(held.error),
      typeof Error.isError === 'function' || !absent('Symbol'),
      'error detection capability'
    );
    equal(api.isMap(held.map), !absent('Map') && !absent('Map.prototype.has'), 'Map detection');
    equal(api.isSet(held.set), !absent('Set') && !absent('Set.prototype.has'), 'Set detection');
    equal(api.isWeakMap(held.weakMap), !absent('WeakMap') && !absent('WeakMap.prototype.has'), 'WeakMap detection');
    equal(api.isWeakSet(held.weakSet), !absent('WeakSet') && !absent('WeakSet.prototype.has'), 'WeakSet detection');
    equal(api.isPromise(held.promise), !absent('Promise'), 'Promise detection');
    equal(
      api.isSharedArrayBuffer(held.shared),
      !!held.shared && !absent('SharedArrayBuffer'),
      'shared buffer detection'
    );
    equal(api.isArrayBuffer(held.buffer), !absent('ArrayBuffer'), 'buffer detection');
    equal(api.isDataView(held.view), !absent('DataView'), 'view detection');
    equal(api.isTypedArray(held.typed), !absent('Uint8Array'), 'typed-array intrinsic fallback');
    equal(api.isArrayBufferView(held.typed), !(absent('ArrayBuffer') && absent('Uint8Array')), 'binary view fallback');
    equal(api.isArrayBufferView(held.view), !(absent('ArrayBuffer') && absent('DataView')), 'DataView fallback');
    equal(api.isTypedArray(held.view), false, 'DataView is not a typed array');
    equal(api.isTypedArray({}), false, 'object is not a typed array');
    equal(api.isIterable([]), !absent('Symbol'), 'iterator detection');
    equal(api.isAsyncIterable({}), false, 'async iterator detection');
    const leaf = Object.freeze({ value: 1 });
    equal(api.isCyclic({ left: leaf, right: { leaf } }), false, 'shared acyclic identity');
    const cycle = {};
    cycle.self = cycle;
    equal(api.isCyclic(cycle), true, 'actual cycle');
    let reads = 0;
    const shared = {
      get item() {
        reads++;
        return null;
      }
    };
    equal(api.isCyclic({ a: shared, b: shared }), false, 'completed shared child');
    equal(reads, 1, 'shared child is read once');
    const union = ['number', 'string'];
    const matcher = (value) => api.isTypeOf(value, [union, [union, null]]);
    equal(matcher(1), true, 'nested numeric matcher');
    equal(matcher('a'), true, 'shared string matcher');
    equal(matcher({}), false, 'nested matcher rejects objects');
    equal(api.isTypeOf(held.date, Date), true, 'instance matcher');
    const cyclicMatcher = [];
    cyclicMatcher.push(cyclicMatcher);
    throws(() => api.isTypeOf(undefined, cyclicMatcher));
    throws(() => api.isMapOf({}, 'invalid-type'));
    throws(() => api.isSetOf({}, 'invalid-type'));
    equal(api.isSetOf({}, 'number'), false, 'invalid Set input');
    equal(api.isMapOf({}, 'string', 'number'), false, 'invalid Map input');
    for (const [value, finite, integer, safe] of [
      [0, true, true, true],
      [-0, true, true, true],
      [1.5, true, false, false],
      [9007199254740992, true, true, false],
      [-9007199254740992, true, true, false],
      [Infinity, false, false, false],
      [-Infinity, false, false, false],
      [NaN, false, false, false],
      ['1', false, false, false]
    ]) {
      equal(api.isFinite(value), finite, 'finite number');
      equal(api.isInteger(value), integer, 'integer');
      equal(api.isSafeInteger(value), safe, 'safe integer');
      if (typeof value === 'number') equal(api.isInteger(Object(value)), integer, 'boxed integer');
    }
    equal(api.toInteger('1.9'), 1, 'integer conversion');
    equal(api.toInteger('-1.9'), -1, 'negative integer conversion');
    equal(1 / api.toInteger(-0.5), -Infinity, 'preserved negative zero');
    for (const [native, name, description, argument] of [
      ['Set', 'toSet', 'Set', []],
      ['Map', 'toMap', 'Map', []],
      ['Symbol', 'toSymbol', 'Symbol', 'x'],
      ['BigInt', 'toBigInt', 'BigInt', 1],
      ['Array.from', 'toArray', 'array', []]
    ]) {
      const original = {
        valueOf() {
          throw Error('must not coerce skipped input');
        }
      };
      equal(api[name + 'If'](original, false), original, name + ' skipped conversion');
      equal(api[name + 'If'](original), original, name + ' omitted condition');
      throws(() => api[name + 'If'](original, 'invalid'));
      const failure = new Error('predicate error');
      let caught;
      try {
        api[name + 'If'](original, () => {
          throw failure;
        });
      } catch (error) {
        caught = error;
      }
      equal(caught, failure, name + ' predicate error identity');
      if (absent(native)) {
        const message = 'Native ' + description + ' conversion is unavailable in this runtime.';
        throws(() => api[name](argument), message);
        throws(() => api[name + 'If'](original, true), message);
      } else {
        const value = api[name](argument);
        equal(value !== undefined, true, name + ' native conversion');
      }
    }
    if (!absent('Map')) {
      if (missingKeys) throws(() => api.toMap({ a: 1 }));
      else equal(api.toMap({ a: 1, b: 2 }).get('b'), 2, 'record conversion without optional APIs');
      equal(api.toMap(held.recordIterable).get('from iterator'), 2, 'iterable record precedence without Symbol global');
    }
    for (const [native, name] of [
      ['Array.from', 'toArray'],
      ['Set', 'toSet'],
      ['Map', 'toMap']
    ]) {
      if (absent(native)) continue;
      if (missingKeys) throws(() => api[name](held.symbolRecord));
      else {
        const output = api[name](held.symbolRecord);
        const values = [];
        for (const item of output) values.push(item);
        equal(name === 'toMap' ? output.get(held.recordSymbol) : values[1], 2, name + ' preserves symbols');
      }
      if (name === 'toMap') throws(() => api.toMap([['a']]));
    }
    for (const [native, operation, label] of [
      ['Map.prototype.entries', () => api.isMapOf(held.map, 'string', null), 'Map iteration'],
      ['Map.prototype.values', () => api.isBlank(held.map), 'Map iteration'],
      ['Set.prototype.values', () => api.isBlank(held.set), 'Set iteration'],
      ['Set.prototype.values', () => api.isSetOf(held.set, null), 'Set iteration'],
      ['Map.prototype.size', () => api.isEmpty(held.map), 'Map size'],
      ['Set.prototype.size', () => api.isEmpty(held.set), 'Set size']
    ]) {
      if (absent(native) && !absent(native.split('.')[0]))
        throws(operation, 'Native ' + label + ' is unavailable in this runtime.');
    }
    return count;
  }
  return { scenarios, prepare, check };
};
