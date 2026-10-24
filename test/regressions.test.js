'use strict';
// Dependency-free public-API regressions for the version-2 contracts.
// Run on the declared Node 22+ baseline: node --test test/regressions.test.js
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { test } = require('node:test');
const T = require('../');
const foreign = (source) => vm.runInNewContext(source);
const predicate = (fn) => ({ predicate: fn });

// Foundational identity and documented compatibility controls.
for (const [name, value] of [
  ['null-prototype dictionary', Object.create(null)],
  ['foreign object', foreign('({})')],
  ['foreign function', foreign('(function () {})')],
  ['ordinary function', function () {}],
  ['array', []],
  ['boxed number', new Number(1)]
]) {
  test('identity: ' + name + ' is an object, not primitive', () => {
    assert.equal(T.isObject(value), true);
    assert.equal(T.isPrimitive(value), false);
  });
}
for (const value of [undefined, null, false, 0, NaN, '', Symbol('x'), 1n]) {
  test('identity: primitive ' + String(value), () => {
    assert.equal(T.isObject(value), false);
    assert.equal(T.isPrimitive(value), true);
  });
}
test('arrays: foreign arrays and pairs work', () => {
  const value = foreign('[1, 2]');
  assert.equal(T.isArray(value), true);
  assert.equal(T.isPair(value), true);
  assert.equal(T.isArrayOf(value, 'number'), true);
});
test('arrays: prototype inheritance is not array identity', () => {
  const fake = Object.create(Array.prototype);
  fake[0] = 1;
  fake.length = 1;
  assert.equal(T.isArray(fake), false);
  assert.equal(T.isArrayOf(fake, 'number'), false);
});
test('arrays: empty Of inputs are accepted and sparse slots mean undefined', () => {
  assert.equal(T.isArrayOf([], 'number'), true);
  assert.equal(T.isArrayLikeOf({ length: 0 }, 'number'), true);
  assert.equal(T.isArrayOf(new Array(2), undefined), true);
  assert.equal(T.isArrayOf(new Array(2), 'number'), false);
});
for (const length of [-1, 0.5, 1.5, NaN, Infinity, -Infinity, 9007199254740992, '2', new Number(2)]) {
  test('array-like: invalid length ' + String(length), () => {
    assert.equal(T.isArrayLike({ length }), false);
    assert.equal(T.isArrayLikeOf({ 0: 'x', length }, 'string'), false);
  });
}
for (const length of [0, -0, 1, 2, 9007199254740991]) {
  test('array-like: valid integer length ' + String(length), () => assert.equal(T.isArrayLike({ length }), true));
}
for (const fn of ['isArrayLike', 'isArrayLikeOf', 'isEmpty', 'isBlank']) {
  test('array-like: ' + fn + ' reads length exactly once', () => {
    let reads = 0;
    const object = {
      0: null,
      get length() {
        reads++;
        return reads === 1 ? 1 : 0;
      }
    };
    const expected = fn === 'isEmpty' ? false : true;
    assert.equal(T[fn](object, null), expected);
    assert.equal(reads, 1);
  });
}
test('arrays: Of checks snapshot length before invoking a mutating predicate', () => {
  const a = [1, 2];
  assert.equal(
    T.isArrayOf(
      a,
      predicate((value) => {
        a.length = 1;
        return typeof value === 'number';
      })
    ),
    false
  );
  const b = { 0: 1, 1: 2, length: 2 };
  let count = 0;
  assert.equal(
    T.isArrayLikeOf(
      b,
      predicate(() => {
        count++;
        b.length = 0;
        return true;
      })
    ),
    true
  );
  assert.equal(count, 2);
});
test('array-like: functions do not have their length getter inspected', () => {
  function fn() {}
  Object.defineProperty(fn, 'length', {
    get() {
      throw Error('must not read');
    }
  });
  assert.equal(T.isArrayLike(fn), false);
});

// Plainness is deliberately narrower than isObject: null-prototype dictionaries are included.
for (const [name, value, expected] of [
  ['literal', {}, true],
  ['own constructor data', { constructor: null }, true],
  ['foreign literal', foreign('({})'), true],
  ['custom prototype', Object.create({}), false],
  ['array with spoofed constructor', Object.assign([], { constructor: Object }), false],
  ['null-prototype dictionary', Object.create(null), true],
  ['class instance', new (class Example {})(), false]
]) {
  test('plain object: ' + name, () => assert.equal(T.isPlainObject(value), expected));
}
test('plain object: own constructor getter is not invoked', () => {
  const value = {};
  Object.defineProperty(value, 'constructor', {
    get() {
      throw Error('must not read');
    }
  });
  assert.equal(T.isPlainObject(value), true);
});
test('blank object: constructor is ordinary nullish data', () => assert.equal(T.isBlank({ constructor: null }), true));

// Explicit matcher modes replace ambiguous predicate/constructor guessing.
test('matching: class mismatch returns false without executing it', () => {
  class Account {
    constructor() {
      throw Error('must not construct');
    }
  }
  assert.equal(T.isTypeOf({}, Account), false);
});
test('matching: function constructors are never invoked', () => {
  let calls = 0;
  function Account() {
    calls++;
    return true;
  }
  assert.equal(T.isTypeOf({}, Account), false);
  assert.equal(calls, 0);
  assert.equal(T.isTypeOf(Object.create(Account.prototype), Account), true);
  assert.equal(calls, 0);
});
test('matching: bound class is supported as an instance matcher', () => {
  class Account {}
  const Bound = Account.bind(null);
  assert.equal(T.isTypeOf(new Account(), Bound), true);
  assert.equal(T.isTypeOf({}, Bound), false);
});
test('matching: constructors no longer act as coercion predicates', () => {
  assert.equal(T.isTypeOf(null, Object), false);
  assert.equal(T.isTypeOf('12', Number), false);
  assert.equal(T.isTypeOf(0, Number), false); // primitive matching uses "number"
  assert.equal(T.isTypeOf(new Number(0), Number), true);
  assert.equal(T.isTypeOf(null, ['string', String]), false);
});
test('matching: arrow predicate on an object is explicit', () =>
  assert.equal(
    T.isTypeOf(
      {},
      predicate((v) => typeof v === 'object')
    ),
    true
  ));
test('matching: native Array.isArray works as explicit predicate', () =>
  assert.equal(T.isTypeOf([], predicate(Array.isArray)), true));
test('matching: ordinary predicates with prototypes work explicitly', () => {
  assert.equal(T.isTypeOf('abc', predicate(T.isString)), true);
  assert.equal(T.isTypeOf(1, predicate(T.isString)), false);
});
test('matching: explicit instanceOf descriptor', () => {
  class Account {}
  assert.equal(T.isTypeOf(new Account(), { instanceOf: Account }), true);
  assert.equal(T.isTypeOf({}, { instanceOf: Account }), false);
});
test('matching: Symbol.hasInstance is honoured', () => {
  function Matcher() {}
  Object.defineProperty(Matcher, Symbol.hasInstance, { value: (value) => value === 42 });
  assert.equal(T.isTypeOf(42, Matcher), true);
});
test('matching: foreign union and boxed type names', () => {
  assert.equal(T.isTypeOf(1, foreign('["number", "boolean"]')), true);
  assert.equal(T.isTypeOf(1, new String('number')), true);
  assert.equal(T.isTypeOf(1, foreign('new String("number")')), true);
});
test('matching: null/undefined and nested union retain meaning', () => {
  assert.equal(T.isTypeOf(null, null), true);
  assert.equal(T.isTypeOf(undefined, undefined), true);
  assert.equal(T.isTypeOf(null, 'object'), true); // literal typeof contract
  assert.equal(T.isTypeOf('yes', [null, ['number', predicate(T.isString)]]), true);
  assert.equal(T.isTypeOf('yes', []), false);
});
test('matching: Of helpers accept explicit predicates', () => {
  assert.equal(T.isArrayOf([{}, {}], predicate(T.isObject)), true);
  assert.equal(T.isArrayLikeOf({ 0: [], length: 1 }, predicate(Array.isArray)), true);
});
for (const matcher of [
  { predicate: 1 },
  { predicate: () => true, instanceOf: Object },
  { instanceOf: 1 },
  {},
  1,
  true,
  Symbol('bad'),
  Object.create(null)
]) {
  test('matching: invalid matcher fails without coercion', () =>
    assert.throws(() => T.isTypeOf({}, matcher), TypeError));
}
test('matching: inherited descriptor fields are rejected', () =>
  assert.throws(() => T.isTypeOf({}, Object.create({ predicate: () => true })), TypeError));
test('matching: predicate must produce a boolean, not a truthy object or promise', () => {
  for (const result of [1, 'yes', {}, Promise.resolve(true)]) {
    assert.throws(
      () =>
        T.isTypeOf(
          1,
          predicate(() => result)
        ),
      TypeError
    );
  }
});
test('matching: predicate exceptions propagate unchanged', () => {
  const error = Error('validation failed');
  assert.throws(
    () =>
      T.isTypeOf(
        1,
        predicate(() => {
          throw error;
        })
      ),
    (value) => value === error
  );
});

// Cycle identity and active-path traversal.
test('cycles: repeated primitive is not a cycle', () => assert.equal(T.isCyclic({ a: 1, b: { c: 1 } }), false));
test('cycles: nested shared descendants are not cycles', () => {
  const leaf = {};
  assert.equal(T.isCyclic({ a: leaf, b: { c: leaf } }), false);
});
test('cycles: key order does not change result', () =>
  assert.equal(T.isCyclic({ a: 1, b: { c: 1 } }), T.isCyclic({ b: { c: 1 }, a: 1 })));
test('cycles: null-prototype cycle', () => {
  const x = Object.create(null);
  x.self = x;
  assert.equal(T.isCyclic(x), true);
});
test('cycles: foreign cycle', () => assert.equal(T.isCyclic(foreign('var x = {}; x.self = x; x')), true));
test('cycles: mutual reference', () => {
  const a = {},
    b = { a };
  a.b = b;
  assert.equal(T.isCyclic(a), true);
});
test('cycles: function-owned enumerable cycle', () => {
  function fn() {}
  fn.self = fn;
  assert.equal(T.isCyclic(fn), true);
});
test('cycles: non-enumerable and symbol properties remain excluded', () => {
  const value = {};
  Object.defineProperty(value, 'self', { value });
  value[Symbol('self')] = value;
  assert.equal(T.isCyclic(value), false);
});
test('cycles: inherited enumerable properties remain included', () => {
  const parent = {},
    child = Object.create(parent);
  parent.self = child;
  assert.equal(T.isCyclic(child), true);
});
test('cycles: Map entries remain outside enumerable-property scope', () => {
  const m = new Map();
  m.set('self', m);
  assert.equal(T.isCyclic(m), false);
});
test('cycles: deep chain avoids call-stack overflow', () => {
  const root = {};
  let tail = root;
  for (let i = 0; i < 20000; i++) tail = tail.next = {};
  assert.equal(T.isCyclic(root), false);
  tail.next = root;
  assert.equal(T.isCyclic(root), true);
});
test('cycles: completed shared nodes are not re-read', () => {
  let reads = 0;
  const leaf = {
    get child() {
      reads++;
      return {};
    }
  };
  assert.equal(T.isCyclic({ a: leaf, b: leaf }), false);
  assert.equal(reads, 1);
});
test('cycles: getters that throw are not silently treated as acyclic', () => {
  const error = Error('get');
  assert.throws(
    () =>
      T.isCyclic({
        get x() {
          throw error;
        }
      }),
    (e) => e === error
  );
});
test('cycles: deterministic random graphs match an independent active-path oracle', () => {
  let seed = 0x12345678;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  }
  function oracle(node, active) {
    if (node === null || (typeof node !== 'object' && typeof node !== 'function')) return false;
    if (active.includes(node)) return true;
    const path = active.concat(node);
    for (const key in node) if (oracle(node[key], path)) return true;
    return false;
  }
  for (let run = 0; run < 200; run++) {
    const nodes = Array.from({ length: 6 }, () => ({}));
    for (const node of nodes)
      for (let edge = 0; edge < 3; edge++)
        node['k' + edge] = random() < 0.55 ? nodes[Math.floor(random() * nodes.length)] : Math.floor(random() * 3);
    assert.equal(T.isCyclic(nodes[0]), oracle(nodes[0], []), 'graph ' + run);
  }
});

// Iteration: no double peek; native iterator completion and closing semantics.
test('iterable: disabled array iterator is not iterable', () => {
  const x = [];
  x[Symbol.iterator] = null;
  assert.equal(T.isIterable(x), false);
});
test('iterable: disabled boxed string iterator is not iterable', () => {
  const x = new String('x');
  x[Symbol.iterator] = null;
  assert.equal(T.isIterable(x), false);
});
test('iterable: normal arrays, strings and sets are iterable', () => {
  for (const value of [[], '', new Set(), foreign('[]')]) assert.equal(T.isIterable(value), true);
});
test('iterable: detection does not execute an iterator method', () => {
  let calls = 0;
  const value = {
    [Symbol.iterator]() {
      calls++;
      throw Error('not inspected');
    }
  };
  assert.equal(T.isIterable(value), true);
  assert.equal(calls, 0);
});
test('blank iterable: first non-nullish generator item is inspected', () =>
  assert.equal(
    T.isBlankIterable(
      (function* () {
        yield 42;
      })()
    ),
    false
  ));
test('blank iterable: first non-nullish item before null is inspected', () =>
  assert.equal(
    T.isBlankIterable(
      (function* () {
        yield 42;
        yield null;
      })()
    ),
    false
  ));
test('blank iterable: nullish-only and empty generators remain blank', () => {
  assert.equal(
    T.isBlankIterable(
      (function* () {
        yield null;
        yield undefined;
      })()
    ),
    true
  );
  assert.equal(T.isBlankIterable((function* () {})()), true);
});
for (const fn of ['isEmptyIterable', 'isBlankIterable']) {
  test('iterable: ' + fn + ' closes on early false', () => {
    let closed = false;
    const generator = (function* () {
      try {
        yield 1;
        yield 2;
      } finally {
        closed = true;
      }
    })();
    assert.equal(T[fn](generator), false);
    assert.equal(closed, true);
    assert.equal(generator.next().done, true);
  });
  test('iterable: ' + fn + ' coerces done with normal iterator semantics', () => {
    class Values {
      [Symbol.iterator]() {
        return {
          next() {
            return { done: 1, value: 42 };
          }
        };
      }
    }
    assert.equal(T[fn](new Values()), true);
  });
  test('iterable: ' + fn + ' rejects a primitive iterator result', () => {
    class Bad {
      [Symbol.iterator]() {
        let calls = 0;
        return {
          next() {
            return calls++ === 0 ? 1 : { done: true };
          }
        };
      }
    }
    assert.throws(() => T[fn](new Bad()), TypeError);
  });
  test('iterable: ' + fn + ' does not call return after natural completion', () => {
    let returns = 0;
    class Empty {
      [Symbol.iterator]() {
        return {
          next() {
            return { done: true };
          },
          return() {
            returns++;
            return { done: true };
          }
        };
      }
    }
    assert.equal(T[fn](new Empty()), true);
    assert.equal(returns, 0);
  });
  test('iterable: ' + fn + ' propagates iterator close errors', () => {
    const error = Error('close');
    class Values {
      [Symbol.iterator]() {
        return {
          next() {
            return { done: false, value: 42 };
          },
          return() {
            throw error;
          }
        };
      }
    }
    assert.throws(
      () => T[fn](new Values()),
      (e) => e === error
    );
  });
}
test('blankness: documented ordinary values are preserved', () => {
  for (const x of [undefined, null, '', ' \t\n ', [], [null, undefined], {}, { a: null }, new Set([null])])
    assert.equal(T.isBlank(x), true);
  for (const x of [0, false, NaN, ' x ', [''], [0], { a: '' }, new Set([0])]) assert.equal(T.isBlank(x), false);
});
test('blankness: an unsized iterable plain object is rejected without inspection', () => {
  const value = {
    [Symbol.iterator]: function* () {
      yield 42;
    }
  };
  assert.throws(() => T.isEmpty(value), TypeError);
  assert.throws(() => T.isBlank(value), TypeError);
});

// Intrinsic brand checks: foreign values accepted; prototype/tag imitations rejected.
for (const [name, create, type] of [
  ['isNumber', 'new Number(3)', Number],
  ['isString', 'new String("x")', String],
  ['isBoolean', 'new Boolean(false)', Boolean],
  ['isDate', 'new Date(0)', Date],
  ['isRegExp', '/x/g', RegExp],
  ['isMap', 'new Map()', Map],
  ['isSet', 'new Set()', Set],
  ['isWeakMap', 'new WeakMap()', WeakMap],
  ['isWeakSet', 'new WeakSet()', WeakSet]
]) {
  test('native brand: ' + name + ' accepts another realm', () => assert.equal(T[name](foreign(create)), true));
  test('native brand: ' + name + ' rejects inherited prototype only', () =>
    assert.equal(T[name](Object.create(type.prototype)), false)
  );
  test('native brand: ' + name + ' rejects toStringTag imitation', () =>
    assert.equal(T[name]({ [Symbol.toStringTag]: type.name }), false)
  );
}
test('native brand: collection predicates do not mutate collections', () => {
  const key = {},
    map = new Map([[key, 1]]),
    set = new Set([key]),
    wm = new WeakMap([[key, 1]]),
    ws = new WeakSet([key]);
  assert.equal(T.isMap(map), true);
  assert.equal(T.isSet(set), true);
  assert.equal(T.isWeakMap(wm), true);
  assert.equal(T.isWeakSet(ws), true);
  assert.deepEqual([...map], [[key, 1]]);
  assert.deepEqual([...set], [key]);
  assert.equal(wm.get(key), 1);
  assert.equal(ws.has(key), true);
});
test('dates: foreign valid and invalid dates', () => {
  assert.equal(T.isValidDate(foreign('new Date(0)')), true);
  assert.equal(T.isInvalidDate(foreign('new Date(NaN)')), true);
});
test('dates: overridden getTime does not change classification', () => {
  const good = new Date(0);
  good.getTime = () => NaN;
  const bad = new Date(NaN);
  bad.getTime = () => 0;
  assert.equal(T.isValidDate(good), true);
  assert.equal(T.isInvalidDate(good), false);
  assert.equal(T.isValidDate(bad), false);
  assert.equal(T.isInvalidDate(bad), true);
});
test('dates: prototype imitations return false instead of throwing', () => {
  const fake = Object.create(Date.prototype);
  assert.equal(T.isValidDate(fake), false);
  assert.equal(T.isInvalidDate(fake), false);
});
for (const [name, number, expected] of [
  ['isFinite', 2, true],
  ['isInfinite', Infinity, true],
  ['isNaN', NaN, true],
  ['isInteger', 2, true],
  ['isFloat', 0.5, true],
  ['isSafeInteger', 2, true]
]) {
  test('number unboxing: ' + name + ' ignores overridden coercion', () => {
    const n = new Number(number);
    n.valueOf = () => {
      throw Error('must not call override');
    };
    n[Symbol.toPrimitive] = () => {
      throw Error('must not coerce');
    };
    assert.equal(T[name](n), expected);
  });
}
test('number/string controls: wrapper and finite classifications preserved', () => {
  assert.equal(T.isNumber(NaN), true);
  assert.equal(T.isNumber(new Number(Infinity)), true);
  assert.equal(T.isString(new String('')), true);
  assert.equal(T.isBoolean(new Boolean(false)), true);
  assert.equal(T.isFinite(Infinity), false);
  assert.equal(T.isSafeInteger(9007199254740992), false);
});
test('errors: foreign ordinary errors and subtypes', () => {
  assert.equal(T.isError(foreign('new Error("x")')), true);
  assert.equal(T.isError(foreign('new TypeError("x")')), true);
});
test('errors: prototype and tag imitations rejected', () => {
  assert.equal(T.isError(Object.create(Error.prototype)), false);
  assert.equal(T.isError({ [Symbol.toStringTag]: 'Error' }), false);
});
test('errors: fallback does not read a custom toStringTag getter', () => {
  let reads = 0;
  const value = {};
  Object.defineProperty(value, Symbol.toStringTag, {
    get() {
      reads++;
      throw Error('tag');
    }
  });
  assert.equal(T.isError(value), false);
  assert.equal(reads, 0);
});
test('protocol checks: null-prototype thenables and promise-like objects', () => {
  const value = Object.assign(Object.create(null), { then() {}, catch() {} });
  assert.equal(T.isThenable(value), true);
  assert.equal(T.isPromiseLike(value), true);
});
test('protocol checks: foreign thenables are accepted', () => {
  const value = foreign('({then: function () {}, catch: function () {}})');
  assert.equal(T.isThenable(value), true);
  assert.equal(T.isPromiseLike(value), true);
});
test('protocol checks: then and catch requirement is preserved', () => {
  assert.equal(T.isThenable({ then() {} }), true);
  assert.equal(T.isPromiseLike({ then() {} }), false);
  assert.equal(T.isThenable({ then: true }), false);
});

// JSON validation is now a supported public root export.
for (const text of [
  'null',
  'false',
  '0',
  '"x"',
  '[]',
  '{}',
  ' [1, null] ',
  new String('{}'),
  foreign('new String("{}")')
]) {
  test('JSON: valid text ' + String(text), () => assert.equal(T.isJson(text), true));
}
for (const value of ['', ' ', '{', 'undefined', 'not JSON', 1, null, {}, ['1']]) {
  test('JSON: invalid/non-string input ' + String(value), () => assert.equal(T.isJson(value), false));
}
test('JSON: boxed string parser ignores a custom toString', () => {
  const text = new String('{}');
  text.toString = () => {
    throw Error('must not call override');
  };
  assert.equal(T.isJson(text), true);
});

//  Receiver binding and native special cases.
test('matching: explicit predicates are invoked without a descriptor receiver', () => {
  let receiver;
  assert.equal(
    T.isTypeOf(
      1,
      predicate(function (value) {
        receiver = this;
        return value === 1;
      })
    ),
    true
  );
  assert.equal(receiver, undefined);
});
test('matching: accessor descriptor fields are not executed', () => {
  const type = {};
  Object.defineProperty(type, 'predicate', {
    get() {
      throw Error('must not invoke');
    }
  });
  assert.throws(() => T.isTypeOf(1, type), TypeError);
});
test('regexp: prototypes are not RegExp instances', () => {
  assert.equal(T.isRegExp(RegExp.prototype), false);
  assert.equal(T.isRegExp(foreign('RegExp.prototype')), false);
});
test('regexp: detection preserves lastIndex and does not read instance source', () => {
  const value = /x/g;
  value.lastIndex = 3;
  Object.defineProperty(value, 'source', {
    get() {
      throw Error('must not read');
    }
  });
  assert.equal(T.isRegExp(value), true);
  assert.equal(value.lastIndex, 3);
});
test('native brand: modified toStringTag cannot hide actual native identity', () => {
  const values = [
    [T.isNumber, new Number(1)],
    [T.isString, new String('x')],
    [T.isDate, new Date()],
    [T.isMap, new Map()]
  ];
  for (const [check, value] of values) {
    Object.defineProperty(value, Symbol.toStringTag, {
      get() {
        throw Error('must not read');
      }
    });
    assert.equal(check(value), true);
  }
});
test('numeric: unbox string payload rather than executing custom coercion', () => {
  const value = new String('12');
  value[Symbol.toPrimitive] = () => {
    throw Error('must not coerce');
  };
  assert.equal(T.isNumeric(value), true);
});
test('numeric: finite values, nonblank text and BigInts follow the version-2 contract', () => {
  for (const value of [1, new Number(1), '1.5', new String('2'), 1n]) assert.equal(T.isNumeric(value), true);
  for (const value of [Infinity, NaN, '', ' ', 'Infinity', '12000n', {}, null]) assert.equal(T.isNumeric(value), false);
});
