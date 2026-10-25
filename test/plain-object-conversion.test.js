'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('../index');
const scope = {};
vm.runInNewContext(require('../scripts/source-test-loader')(), scope);
const backends = [T, scope.Types];
const typeError = (e) => e && e.name === 'TypeError';
for (const [backend, api] of backends.entries()) {
  const prototype = backend ? vm.runInNewContext('Object.prototype', scope) : Object.prototype;
  test('plain conversion: all string inputs are rejected without parsing, backend ' + backend, () => {
    for (const text of [
      '{}',
      '  {"a":1}  ',
      '{"nested":{"a":[1,null]}}',
      '[]',
      '[["a",1]]',
      'null',
      '1',
      'true',
      '"text"',
      '',
      ' ',
      '{',
      "{'a':1}",
      '{a:1}',
      '{"a":1,}',
      '{}x',
      'ordinary text'
    ]) {
      assert.throws(() => api.toPlainObject(text), typeError);
    }
  });
  test('plain conversion: own enumerable string/symbol data and shallow copies, backend ' + backend, () => {
    const symbol = Symbol('key');
    const nested = {};
    for (const input of [
      { a: nested },
      Object.assign(Object.create(null), { a: nested }),
      vm.runInNewContext('({a:{}})')
    ]) {
      input[symbol] = nested;
      Object.defineProperty(input, 'hidden', { value: 1 });
      Object.defineProperty(input, Symbol('hidden'), { value: 2 });
      const result = api.toPlainObject(input);
      assert.notEqual(result, input);
      assert.equal(Object.getPrototypeOf(result), prototype);
      assert.equal(result.a, input.a);
      assert.equal(result[symbol], nested);
      assert.deepEqual(Reflect.ownKeys(result), ['a', symbol]);
      for (const key of Reflect.ownKeys(result))
        assert.deepEqual(Object.getOwnPropertyDescriptor(result, key), {
          value: result[key],
          writable: true,
          enumerable: true,
          configurable: true
        });
    }
  });
  test('plain conversion: getters, descriptor changes and errors, backend ' + backend, () => {
    const trace = [];
    const input = {
      get a() {
        trace.push('a');
        delete this.b;
        this.c = 3;
        return 1;
      },
      b: 2
    };
    const result = api.toPlainObject(input);
    assert.deepEqual(Reflect.ownKeys(result), ['a']);
    assert.deepEqual(trace, ['a']);
    for (const reason of [undefined, null, new Error('getter'), Symbol('error')]) {
      assert.throws(
        () =>
          api.toPlainObject({
            get a() {
              throw reason;
            }
          }),
        (e) => e === reason
      );
      for (const trap of ['getPrototypeOf', 'ownKeys', 'getOwnPropertyDescriptor']) {
        assert.throws(
          () =>
            api.toPlainObject(
              new Proxy(
                { a: 1 },
                {
                  [trap]() {
                    throw reason;
                  }
                }
              )
            ),
          (e) => e === reason
        );
      }
    }
  });
  test('plain conversion: entries, duplicate keys, symbols and foreign maps, backend ' + backend, () => {
    const symbol = Symbol('key');
    const nested = {};
    for (const input of [
      [
        ['a', 1],
        ['a', 2],
        [symbol, nested]
      ],
      new Map([
        ['a', 2],
        [symbol, nested]
      ]),
      (function* () {
        yield ['a', 2];
        yield [symbol, nested];
      })()
    ]) {
      const result = api.toPlainObject(input);
      assert.equal(Object.getPrototypeOf(result), prototype);
      assert.equal(result.a, 2);
      assert.equal(result[symbol], nested);
      assert.deepEqual(Reflect.ownKeys(result), ['a', symbol]);
    }
    assert.equal(api.toPlainObject(vm.runInNewContext('new Map([["a",1]])')).a, 1);
    assert.equal(api.toPlainObject(vm.runInNewContext('[["a",1]]')).a, 1);
    for (const input of [[], new Map(), new Set(), (function* () {})()])
      assert.equal(Reflect.ownKeys(api.toPlainObject(input)).length, 0);
    assert.ok(Object.hasOwn(api.toPlainObject([['a', undefined]]), 'a'));
  });
  test('plain conversion: malformed pairs and strict keys, backend ' + backend, () => {
    for (const pair of [
      undefined,
      null,
      1,
      'ab',
      {},
      [],
      ['a'],
      ['a', 1, 2],
      Object.assign(Array(2), { 1: 1 }),
      Object.assign(Array(2), { 0: 'a' }),
      { 0: 'a', 1: 1, length: 2 }
    ]) {
      assert.throws(() => api.toPlainObject([pair]), typeError);
    }
    for (const key of [
      1,
      -0,
      null,
      undefined,
      true,
      1n,
      new String('a'),
      {
        toString() {
          throw Error('coercion');
        }
      }
    ])
      assert.throws(() => api.toPlainObject([[key, 1]]), typeError);
    for (const input of [
      [1, 2],
      ['a', 'b']
    ])
      assert.throws(() => api.toPlainObject(input), typeError);
  });
  test('plain conversion: special keys are safe own data properties, backend ' + backend, () => {
    const input = JSON.parse('{"__proto__":{"polluted":true},"constructor":1,"prototype":2,"toString":3}');
    for (const value of [input, Object.entries(input), new Map(Object.entries(input))]) {
      const result = api.toPlainObject(value);
      assert.equal(Object.getPrototypeOf(result), prototype);
      assert.equal(result.polluted, undefined);
      for (const key of Object.keys(input)) assert.ok(Object.getOwnPropertyDescriptor(result, key).enumerable);
      assert.equal(result.__proto__.polluted, true);
      assert.equal(result.constructor, 1);
      assert.equal(result.prototype, 2);
      assert.equal(result.toString, 3);
    }
  });
  test('plain conversion: rejected inputs and no implicit boxing, backend ' + backend, () => {
    for (const value of [
      null,
      undefined,
      0,
      false,
      1n,
      Symbol(),
      new String(''),
      new String('{}'),
      new Number(42),
      new Boolean(false),
      Object(1n),
      Object(Symbol()),
      new Date(),
      /x/,
      function () {},
      new (class A {
        constructor() {
          this.a = 1;
        }
      })(),
      Promise.resolve(1),
      vm.runInNewContext('new Number(42)')
    ])
      assert.throws(() => api.toPlainObject(value), typeError);
    assert.throws(() => api.toPlainObject(), typeError);
    const revocable = Proxy.revocable({}, {});
    revocable.revoke();
    assert.throws(() => api.toPlainObject(revocable.proxy), typeError);
  });
  test('plain conversion: iterator precedence, method capture and native cleanup, backend ' + backend, () => {
    const trace = [];
    const input = {
      ignored: true,
      get [Symbol.iterator]() {
        trace.push('get');
        return function () {
          assert.equal(this, input);
          trace.push('call');
          return (function* () {
            try {
              yield ['a', 1];
              yield [1, 2];
            } finally {
              trace.push('close');
            }
          })();
        };
      }
    };
    assert.throws(() => api.toPlainObject(input), typeError);
    assert.deepEqual(trace, ['get', 'call', 'close']);
    const error = new Error('original');
    for (const failure of ['value', 'body', 'next']) {
      let closed = 0;
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() {
              if (failure === 'next') throw error;
              return {
                done: false,
                get value() {
                  if (failure === 'value') throw error;
                  return [['bad']];
                }
              };
            },
            return() {
              closed++;
              throw Error('closing');
            }
          };
        }
      };
      assert.throws(() => api.toPlainObject(iterable), failure === 'body' ? typeError : (e) => e === error);
      assert.equal(closed, failure === 'body' ? 1 : 0);
    }
    for (const method of [1, {}, false, () => 1, () => ({ next: 1 })])
      assert.throws(() => api.toPlainObject({ [Symbol.iterator]: method }), typeError);
    assert.equal(api.toPlainObject({ a: 1, [Symbol.iterator]: undefined }).a, 1);
  });
  test('plain conversion: condition identity and strict predicates, backend ' + backend, () => {
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    for (const value of [revoked.proxy, null, undefined, -0, NaN, new Date(), '{', '{"a":1}']) {
      assert.equal(api.toPlainObjectIf(value), value);
      assert.equal(api.toPlainObjectIf(value, false), value);
      assert.equal(api.toPlainObjectIf(value, undefined), value);
      assert.equal(
        api.toPlainObjectIf(value, () => false),
        value
      );
    }
    let calls = 0;
    const input = { a: 1 };
    assert.equal(
      api.toPlainObjectIf(input, function (v) {
        assert.equal(this, undefined);
        assert.equal(v, input);
        calls++;
        v.a = 2;
        return true;
      }).a,
      2
    );
    assert.equal(calls, 1);
    for (const invalid of [null, 1, 'true', {}, new Boolean(true)])
      assert.throws(() => api.toPlainObjectIf(input, invalid), typeError);
    for (const invalid of [undefined, null, 1, {}, Promise.resolve(true)])
      assert.throws(() => api.toPlainObjectIf(input, () => invalid), typeError);
    assert.throws(() => api.toPlainObjectIf(null, true), typeError);
    for (const text of ['{"a":1}', '[["a",1]]', '{', 'ordinary text']) {
      for (const condition of [true, () => true]) {
        assert.throws(() => api.toPlainObjectIf(text, condition), typeError);
      }
    }
    const error = new Error('predicate');
    assert.throws(
      () =>
        api.toPlainObjectIf(input, () => {
          throw error;
        }),
      (e) => e === error
    );
  });
}

test('plain conversion captures safe property creation before reassignment', () => {
  const context = vm.createContext({});
  const { moduleLoader } = require('./fixtures/verify-optional-apis.cjs');
  const convert = moduleLoader(require('node:path').join(__dirname, '..'), context)('src/conversion/toPlainObject.js');
  vm.runInContext('Object.defineProperty = Reflect.ownKeys = function () { throw Error("replaced"); };', context);
  assert.equal(convert({ a: 1 }).a, 1);
  assert.equal(convert([['a', 1]]).a, 1);
});

test('plain copying never invokes inherited setters, including symbol setters', () => {
  const context = vm.createContext({});
  const { moduleLoader } = require('./fixtures/verify-optional-apis.cjs');
  const convert = moduleLoader(require('node:path').join(__dirname, '..'), context)('src/conversion/toPlainObject.js');
  const symbol = Symbol('setter');
  context.symbol = symbol;
  vm.runInContext(
    'Object.defineProperty(Object.prototype, "a", {set() { throw Error("setter"); }}); Object.defineProperty(Object.prototype, symbol, {set() { throw Error("setter"); }});',
    context
  );
  const result = convert({ a: 1, [symbol]: 2 });
  assert.equal(result.a, 1);
  assert.equal(result[symbol], 2);
  assert.equal(
    convert([
      ['a', 1],
      [symbol, 2]
    ])[symbol],
    2
  );
});

test('plain copying propagates value-access and iterator-getter errors without invoking coercion', () => {
  const error = new Error('get');
  for (const key of ['a', Symbol.iterator]) {
    const input = new Proxy(
      { a: 1 },
      {
        get(target, name) {
          if (name === key) throw error;
          return target[name];
        }
      }
    );
    assert.throws(
      () => T.toPlainObject(input),
      (e) => e === error
    );
  }
  let coercions = 0;
  const input = {
    valueOf() {
      coercions++;
    },
    toString() {
      coercions++;
    }
  };
  const result = T.toPlainObject(input);
  assert.equal(result.valueOf, input.valueOf);
  assert.equal(result.toString, input.toString);
  assert.equal(coercions, 0);
});

test('plain conversion preserves exact pair-access failures and closes its iterator once', () => {
  for (const key of ['length', '0', '1']) {
    const reason = new Error(key);
    let closed = 0;
    const pair = new Proxy(['a', 1], {
      get(target, name) {
        if (name === key) throw reason;
        return target[name];
      }
    });
    const input = (function* () {
      try {
        yield pair;
      } finally {
        closed++;
      }
    })();
    assert.throws(
      () => T.toPlainObject(input),
      (e) => e === reason
    );
    assert.equal(closed, 1);
  }
});

test('plain conversion rejects native wrappers and Dates/RegExps even with entries or changed prototypes', () => {
  for (const api of backends) {
    for (const make of [
      () => new Number(1),
      () => new Boolean(false),
      () => new String(''),
      () => Object(1n),
      () => Object(Symbol()),
      () => new Date(),
      () => /x/
    ]) {
      for (const changePrototype of [false, true]) {
        const input = make();
        if (changePrototype) Object.setPrototypeOf(input, null);
        input.a = 1;
        assert.throws(() => api.toPlainObject(input), typeError);
        input[Symbol.iterator] = function* () {
          yield ['a', 1];
        };
        assert.throws(() => api.toPlainObject(input), typeError);
      }
    }
  }
});

test('missing copied Object.prototype names retain inherited values, not the input property type', () => {
  const input = Object.defineProperty({ toString: 1 }, 'toString', { enumerable: false });
  assert.equal(T.toPlainObject(input).toString, Object.prototype.toString);
  assert.equal(T.toPlainObject(new Map()).toString, Object.prototype.toString);
  assert.equal(T.toPlainObject(input).__proto__, Object.prototype);
});

test('plain conversion loads and converts without accessing JSON.parse', () => {
  const context = vm.createContext({});
  vm.runInContext(
    'Object.defineProperty(JSON, "parse", { get() { throw Error("Do not access JSON.parse"); } });',
    context
  );
  const { moduleLoader } = require('./fixtures/verify-optional-apis.cjs');
  const convert = moduleLoader(require('node:path').join(__dirname, '..'), context)('src/conversion/toPlainObject.js');
  assert.equal(convert({ a: 1 }).a, 1);
  assert.equal(convert([['a', 1]]).a, 1);
  assert.throws(() => convert('{"a":1}'), typeError);
  assert.throws(() => convert('{'), typeError);
});
