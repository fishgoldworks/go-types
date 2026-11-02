'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseJson, parseJsonIf } = require('../index');

for (const [label, input, expected] of [
  ['object', '{"a":1}', { a: 1 }],
  ['array', '[1,2]', [1, 2]],
  ['string', '"hello"', 'hello'],
  ['number', '12.5', 12.5],
  ['boolean', 'false', false],
  ['null', 'null', null],
  ['whitespace', ' \r\n [true, null] \t', [true, null]],
  ['negative zero', '-0', -0],
  ['overflow follows native number parsing', '1e400', Infinity],
  ['duplicate keys', '{"a":1,"a":2}', { a: 2 }],
  ['nested JSON remains text', '"{\\"a\\":1}"', '{"a":1}'],
  ['native number input', 42, 42],
  ['native boolean input', true, true],
  ['native null input', null, null],
  ['native boxed text', Object('[1]'), [1]]
])
  test('parseJson parses ' + label, () => assert.deepEqual(parseJson(input), expected));

for (const input of [
  '',
  'undefined',
  '{',
  '[1,]',
  '{"a":1,}',
  "{'a':1}",
  'NaN',
  'Infinity',
  '01',
  'true false',
  undefined
]) {
  test('parseJson rejects invalid JSON: ' + String(input), () => assert.throws(() => parseJson(input), SyntaxError));
}
test('parseJson rejects omitted input and symbols using native errors', () => {
  assert.throws(() => parseJson(), SyntaxError);
  assert.throws(() => parseJson(Symbol('key')), TypeError);
});
test('parseJson coerces input once with the string hint and preserves hook errors', () => {
  const hints = [];
  assert.deepEqual(
    parseJson({
      [Symbol.toPrimitive](hint) {
        hints.push(hint);
        return '{"a":1}';
      }
    }),
    { a: 1 }
  );
  assert.deepEqual(hints, ['string']);
  const error = new Error('coercion');
  assert.throws(
    () =>
      parseJson({
        toString() {
          throw error;
        }
      }),
    (e) => e === error
  );
});
test('parseJson preserves safe own special keys without prototype pollution', () => {
  const result = parseJson('{"__proto__":{"polluted":true},"constructor":1,"prototype":2}');
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.equal(Object.prototype.hasOwnProperty.call(result, '__proto__'), true);
  assert.deepEqual(result.__proto__, { polluted: true });
  assert.equal(result.constructor, 1);
  assert.equal(result.prototype, 2);
  assert.equal({}.polluted, undefined);
});
test('parseJson reviver visits children before parents with native holder receivers', () => {
  const visits = [];
  const result = parseJson('{"a":{"b":1},"c":2}', function (key, value) {
    assert.equal(this[key], value);
    visits.push(key);
    return typeof value === 'number' ? value * 10 : value;
  });
  assert.deepEqual(visits, ['b', 'a', 'c', '']);
  assert.deepEqual(result, { a: { b: 10 }, c: 20 });
});
test('parseJson supports reviver deletion, array holes and root replacement', () => {
  assert.deepEqual(
    parseJson('{"a":1,"b":2}', (key) => (key === 'a' ? undefined : key === '' ? 'root' : 2)),
    'root'
  );
  assert.deepEqual(
    parseJson('{"a":1,"b":2}', (key, value) => (key === 'a' ? undefined : value)),
    { b: 2 }
  );
  const array = parseJson('[1,2]', (key, value) => (key === '0' ? undefined : value));
  assert.equal(array.length, 2);
  assert.equal(0 in array, false);
  assert.equal(array[1], 2);
  assert.equal(
    parseJson('1', () => undefined),
    undefined
  );
  assert.equal(parseJson('1', () => new Date(0)).getTime(), 0);
});
test('parseJson forwards native reviver argument availability without inventing context', () => {
  const native = [],
    actual = [];
  JSON.parse('{"a":1}', function (key, value, context) {
    native.push([key, arguments.length, context]);
    return value;
  });
  parseJson('{"a":1}', function (key, value, context) {
    actual.push([key, arguments.length, context]);
    return value;
  });
  assert.deepEqual(actual, native);
});
test('parseJson does not await reviver values or invoke non-callable revivers', () => {
  const promise = Promise.resolve(4);
  assert.equal(
    parseJson('1', () => promise),
    promise
  );
  const ignored = {
    get call() {
      throw Error('must not inspect');
    }
  };
  assert.equal(parseJson('1', ignored), 1);
  assert.equal(parseJson('1', null), 1);
});
test('parseJson propagates reviver errors and does not invoke a reviver for invalid JSON', () => {
  const error = new Error('reviver');
  let calls = 0;
  assert.throws(
    () =>
      parseJson('1', () => {
        throw error;
      }),
    (e) => e === error
  );
  assert.throws(
    () =>
      parseJson('[', () => {
        calls++;
      }),
    SyntaxError
  );
  assert.equal(calls, 0);
});
test('parseJsonIf converts on true, calls its predicate once and forwards the reviver', () => {
  let calls = 0;
  assert.deepEqual(
    parseJsonIf(
      '{"a":1}',
      function (value) {
        assert.equal(value, '{"a":1}');
        assert.equal(this, undefined);
        calls++;
        return true;
      },
      (_key, value) => (typeof value === 'number' ? value + 1 : value)
    ),
    { a: 2 }
  );
  assert.equal(calls, 1);
  assert.equal(parseJsonIf('null', true), null);
});
test('parseJsonIf skips input and reviver inspection when false or omitted', () => {
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  for (const condition of [false, undefined, () => false]) {
    assert.equal(parseJsonIf(revoked.proxy, condition, revoked.proxy), revoked.proxy);
    assert.equal(parseJsonIf('[', condition), '[');
  }
});
test('parseJsonIf rejects invalid conditions and non-boolean results before conversion', () => {
  const input = {
    toString() {
      throw Error('must not inspect');
    }
  };
  for (const condition of [null, 1, 'true', new Boolean(true), () => 1, () => undefined, async () => true]) {
    assert.throws(() => parseJsonIf(input, condition), TypeError);
  }
  const error = new Error('predicate');
  assert.throws(
    () =>
      parseJsonIf(input, () => {
        throw error;
      }),
    (e) => e === error
  );
});
test('parseJsonIf preserves requested conversion errors and deliberate predicate mutation', () => {
  assert.throws(() => parseJsonIf('[', true), SyntaxError);
  const input = {
    text: '[',
    toString() {
      return this.text;
    }
  };
  assert.equal(
    parseJsonIf(input, (value) => {
      value.text = '2';
      return true;
    }),
    2
  );
});
test('parseJson retains the captured parser after JSON.parse is replaced', () => {
  const { environment, moduleLoader } = require('./fixtures/verify-optional-apis.cjs');
  const vm = require('node:vm');
  const { context } = environment([]);
  const parse = moduleLoader(require('node:path').resolve(__dirname, '..'), context)('src/conversion/parseJson.js');
  vm.runInContext('JSON.parse = function() { throw Error("replaced"); }', context);
  assert.equal(parse('{"a":1}').a, 1);
});
