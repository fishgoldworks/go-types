'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const Types = require('../index.js');
const scope = {};
vm.runInNewContext(require('../scripts/source-test-loader.js')(), scope);
const backends = [Types, scope.Types];
const hinted = [
  ['toNumber', 'number', 42],
  ['toInteger', 'number', 42],
  ['toBigInt', 'number', 42n],
  ['toDate', 'default', 42],
  ['toString', 'string', '42'],
  ['toSymbol', 'string', '42']
];
function resultValue(name, result) {
  if (name === 'toDate') return Date.prototype.getTime.call(result);
  if (name === 'toSymbol') return result.description;
  return result;
}
function isTypeError(error) {
  // The portable source creates errors in its own realm.
  return error.name === 'TypeError';
}

test('scalar conversion reads the exotic coercion hook once and forwards its receiver and hint', () => {
  for (const api of backends) {
    for (const [name, hint, expected] of hinted) {
      const trace = [];
      const input = {
        get [Symbol.toPrimitive]() {
          trace.push('get');
          return function (actualHint) {
            trace.push(actualHint);
            assert.equal(this, input);
            assert.equal(arguments.length, 1);
            return name === 'toDate' ? 42 : '42';
          };
        },
        get valueOf() {
          throw Error('ordinary coercion must be skipped');
        },
        get toString() {
          throw Error('ordinary coercion must be skipped');
        }
      };
      assert.equal(resultValue(name, api[name](input)), expected, name);
      assert.deepEqual(trace, ['get', hint], name);
    }
  }
});

test('ordinary scalar coercion reads fallback methods in hint order and stops at the first primitive', () => {
  for (const api of backends) {
    for (const [name, hint, expected] of hinted) {
      const first = hint === 'string' ? 'toString' : 'valueOf';
      const second = first === 'valueOf' ? 'toString' : 'valueOf';
      const trace = [];
      const input = { [Symbol.toPrimitive]: null };
      Object.defineProperty(input, first, {
        get() {
          trace.push('get ' + first);
          return function () {
            trace.push('call ' + first);
            assert.equal(this, input);
            return {};
          };
        }
      });
      Object.defineProperty(input, second, {
        get() {
          trace.push('get ' + second);
          return function () {
            trace.push('call ' + second);
            assert.equal(this, input);
            assert.equal(arguments.length, 0);
            return name === 'toDate' ? 42 : '42';
          };
        }
      });
      assert.equal(resultValue(name, api[name](input)), expected, name);
      assert.deepEqual(trace, ['get ' + first, 'call ' + first, 'get ' + second, 'call ' + second]);
      const early = {
        [Symbol.toPrimitive]: undefined,
        [first]() {
          return name === 'toDate' ? 42 : '42';
        },
        get [second]() {
          throw Error('must not read after obtaining a primitive');
        }
      };
      assert.equal(resultValue(name, api[name](early)), expected);
    }
  }
});

test('scalar conversion does not recover from an invalid exotic hook by trying ordinary methods', () => {
  for (const api of backends) {
    for (const [name] of hinted) {
      for (const hook of [false, 1, {}, () => ({})]) {
        let ordinaryReads = 0;
        const input = {
          [Symbol.toPrimitive]: hook,
          get valueOf() {
            ordinaryReads++;
            return () => 1;
          },
          get toString() {
            ordinaryReads++;
            return () => '1';
          }
        };
        assert.throws(() => api[name](input), isTypeError, name);
        assert.equal(ordinaryReads, 0);
      }
    }
  }
});

test('scalar conversion propagates exact getter and hook failures, including non-Error values', () => {
  for (const api of backends) {
    for (const [name] of hinted) {
      for (const reason of [undefined, null, Symbol('failure'), new Error('failure')]) {
        for (const failureAtRead of [true, false]) {
          const input = {
            get [Symbol.toPrimitive]() {
              if (failureAtRead) throw reason;
              return function () {
                throw reason;
              };
            }
          };
          assert.throws(
            () => api[name](input),
            (error) => error === reason,
            name
          );
        }
      }
    }
  }
});

test('numeric and textual conversions honour overridden wrapper coercion, unlike type identity checks', () => {
  for (const api of backends) {
    for (const make of [() => new Number(3), () => new String('3'), () => Object(3n)]) {
      const input = make();
      const hints = [];
      Object.defineProperty(input, Symbol.toPrimitive, {
        value(hint) {
          hints.push(hint);
          return '42';
        }
      });
      assert.equal(api.toNumber(input), 42);
      assert.equal(api.toInteger(input), 42);
      assert.equal(api.toBigInt(input), 42n);
      assert.equal(api.toString(input), '42');
      assert.deepEqual(hints, ['number', 'number', 'number', 'string']);
    }
  }
});

test('Date identity survives prototype removal while ordinary timestamp conversion applies TimeClip', () => {
  const foreignDate = vm.runInNewContext('new Date(NaN)');
  Object.setPrototypeOf(foreignDate, null);
  Object.defineProperty(foreignDate, Symbol.toPrimitive, {
    get() {
      throw Error('genuine Dates bypass coercion');
    }
  });
  for (const api of backends) {
    assert.equal(api.toDate(foreignDate), foreignDate);
    for (const [input, expected] of [
      [-8640000000000000, -8640000000000000],
      [-8640000000000001, NaN],
      [8640000000000000, 8640000000000000],
      [8640000000000001, NaN],
      [-0.9, 0],
      [-1.9, -1],
      [0.9, 0],
      [NaN, NaN]
    ]) {
      const trace = [];
      const value = {
        [Symbol.toPrimitive](hint) {
          trace.push(hint);
          return input;
        }
      };
      assert.equal(resultValue('toDate', api.toDate(value)), expected);
      assert.deepEqual(trace, ['default']);
    }
  }
});

test('Symbol wrappers preserve payload despite removed prototypes, but proxies follow description conversion', () => {
  const boxed = vm.runInNewContext('Object(Symbol.for("go-types-scalar-test"))');
  const symbol = Symbol.prototype.valueOf.call(boxed);
  Object.setPrototypeOf(boxed, null);
  Object.defineProperty(boxed, Symbol.toPrimitive, {
    configurable: true,
    get() {
      throw Error('genuine wrappers bypass coercion');
    }
  });
  let hookCalls = 0;
  const proxy = new Proxy(boxed, {
    get(target, key) {
      if (key === Symbol.toPrimitive)
        return function (hint) {
          hookCalls++;
          assert.equal(this, proxy);
          assert.equal(hint, 'string');
          return 'proxy description';
        };
      throw Error('unexpected property read');
    }
  });
  for (const api of backends) {
    assert.equal(api.toSymbol(boxed), symbol);
    const result = api.toSymbol(proxy);
    assert.equal(result.description, 'proxy description');
    assert.notEqual(result, symbol);
    assert.equal(Symbol.keyFor(result), undefined);
    // Unlike a direct symbol input, an ordinary hook returning a symbol is not a description.
    assert.throws(() => api.toSymbol({ [Symbol.toPrimitive]: () => symbol }), isTypeError);
  }
  assert.equal(hookCalls, backends.length);
});
