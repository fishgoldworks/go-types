'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { toJson, toJsonIf } = require('../index.js');

// Literal expectations distinguish serialization from String conversion or JSON parsing.
for (const [label, input, expected] of [
  ['record', { a: 1 }, '{"a":1}'],
  ['array', [1, 2], '[1,2]'],
  ['string', 'hello', '"hello"'],
  ['JSON text remains a string', '{"a":1}', '"{\\"a\\":1}"'],
  ['number', 42, '42'],
  ['boolean', false, 'false'],
  ['null', null, 'null'],
  ['undefined', undefined, undefined],
  ['function', function () {}, undefined],
  ['symbol', Symbol('x'), undefined],
  ['NaN', NaN, 'null'],
  ['infinity', Infinity, 'null'],
  ['negative zero', -0, '0'],
  ['boxed number', new Number(42), '42'],
  ['boxed boolean', new Boolean(false), 'false'],
  ['boxed string', new String('x'), '"x"'],
  ['valid Date', new Date(0), '"1970-01-01T00:00:00.000Z"'],
  ['invalid Date', new Date(NaN), 'null'],
  ['Map is not transformed', new Map([['a', 1]]), '{}'],
  ['Set is not transformed', new Set([1]), '{}'],
  ['foreign record', vm.runInNewContext('({a:1})'), '{"a":1}']
]) {
  test('toJson serializes ' + label, () => assert.equal(toJson(input), expected));
}

test('toJson omits unsupported properties but preserves array positions', () => {
  const symbol = Symbol('key');
  assert.equal(toJson({ a: undefined, b() {}, c: symbol, [symbol]: 1, d: null }), '{"d":null}');
  const items = [undefined, function () {}, symbol];
  items.length = 4; // Leave one array slot absent.
  items.push(NaN);
  assert.equal(toJson(items), '[null,null,null,null,null]');
  assert.equal(toJson(), undefined);
});

test('toJson visits own enumerable string keys and safely serializes special keys', () => {
  const input = Object.create({ inherited: true });
  Object.defineProperty(input, 'hidden', { value: 2 });
  Object.defineProperty(input, '__proto__', { value: { safe: true }, enumerable: true });
  input.a = 1;
  assert.equal(toJson(input), '{"__proto__":{"safe":true},"a":1}');
  assert.equal(Object.getPrototypeOf(input).inherited, true);
});

test('toJson serializes shared references but rejects cycles and unhandled bigints', () => {
  const shared = { a: 1 };
  assert.equal(toJson([shared, shared]), '[{"a":1},{"a":1}]');
  const cycle = {};
  cycle.self = cycle;
  assert.throws(() => toJson(cycle), TypeError);
  for (const input of [1n, Object(1n), { a: 1n }, [1n]]) assert.throws(() => toJson(input), TypeError);
});

test('toJson preserves toJSON then replacer order, native receivers and root key', () => {
  const visits = [];
  const input = {
    toJSON(key) {
      assert.equal(this, input);
      visits.push(['toJSON', key]);
      return { a: 1 };
    }
  };
  const result = toJson(input, function (key, value) {
    visits.push(['replacer', key]);
    assert.equal(this[key], key === '' ? input : 1);
    return key === 'a' ? 2 : value;
  });
  assert.equal(result, '{"a":2}');
  assert.deepEqual(visits, [
    ['toJSON', ''],
    ['replacer', ''],
    ['replacer', 'a']
  ]);
});

test('toJson forwards replacer lists and indentation unchanged', () => {
  const input = Object.freeze({ a: 1, b: 2, 3: 'three' });
  const keys = Object.freeze(['b', 'b', 3]);
  assert.equal(toJson(input, keys, 2), '{\n  "b": 2,\n  "3": "three"\n}');
  assert.equal(toJson({ a: 1 }, null, '\t'), '{\n\t"a": 1\n}');
  assert.equal(toJson({ a: 1 }, undefined, 20), '{\n          "a": 1\n}');
});

test('toJson lets a replacer filter values, handle bigints and replace the root', () => {
  assert.equal(
    toJson({ a: 1, secret: 2 }, (key, value) => (key === 'secret' ? undefined : value)),
    '{"a":1}'
  );
  assert.equal(
    toJson({ a: 1n }, (_key, value) => (typeof value === 'bigint' ? String(value) : value)),
    '{"a":"1"}'
  );
  assert.equal(
    toJson(undefined, () => 42),
    '42'
  );
  assert.equal(
    toJson({ a: 1 }, () => undefined),
    undefined
  );
});

test('toJson propagates original getter, toJSON, replacer and proxy exceptions', () => {
  const failure = new Error('application failure');
  const fail = () => {
    throw failure;
  };
  for (const run of [
    () =>
      toJson({
        get a() {
          return fail();
        }
      }),
    () => toJson({ toJSON: fail }),
    () => toJson({}, fail),
    () => toJson(new Proxy({}, { get: fail }))
  ])
    assert.throws(run, (error) => error === failure);
});

test('toJson does not await promises or asynchronous serialization hooks', () => {
  assert.equal(toJson(Promise.resolve(1)), '{}');
  assert.equal(toJson({ toJSON: async () => 1 }), '{}');
  assert.equal(
    toJson(1, async () => 2),
    '{}'
  );
});

test('toJsonIf forwards both options after evaluating its condition exactly once', () => {
  const input = { a: 1, b: 2 };
  let calls = 0;
  const result = toJsonIf(
    input,
    function (value) {
      assert.equal(this, undefined);
      assert.equal(arguments.length, 1);
      assert.equal(value, input);
      calls++;
      value.a = 3;
      return true;
    },
    ['a'],
    2
  );
  assert.equal(result, '{\n  "a": 3\n}');
  assert.equal(calls, 1);
  assert.equal(
    toJsonIf({ a: 1 }, true, (_key, value) => (typeof value === 'number' ? 2 : value)),
    '{"a":2}'
  );
  assert.equal(toJsonIf(undefined, true), undefined);
});

test('toJsonIf skips input, replacer and spacing inspection for false or omitted conditions', () => {
  const poison = new Proxy([], {
    get() {
      throw Error('unexpected inspection');
    }
  });
  for (const condition of [false, undefined, () => false]) {
    assert.equal(toJsonIf(poison, condition, poison, poison), poison);
  }
  assert.equal(toJsonIf(poison), poison);
  assert.equal(toJsonIf(), undefined);
  assert.equal(toJsonIf(1n, false), 1n);
});

test('toJsonIf rejects invalid conditions before touching serialization input or options', () => {
  const poison = new Proxy(
    {},
    {
      get() {
        throw Error('unexpected inspection');
      }
    }
  );
  for (const condition of [null, 0, 1, 'false', new Boolean(false), () => undefined, () => 1, async () => false]) {
    assert.throws(() => toJsonIf(poison, condition), TypeError);
  }
  const failure = new Error('predicate failure');
  assert.throws(
    () =>
      toJsonIf(poison, () => {
        throw failure;
      }),
    (error) => error === failure
  );
  assert.throws(() => toJsonIf(1n, true), TypeError);
});
