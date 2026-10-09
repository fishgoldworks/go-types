'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const Types = require('../index.js');
const source = require('../scripts/source-test-loader.js')();
const portableScope = {};
vm.runInNewContext(source, portableScope);
const backends = [Types, portableScope.Types];
const foreign = vm.createContext({});
const ForeignNumber = vm.runInContext('Number', foreign);
const ForeignString = vm.runInContext('String', foreign);
const numericNames = ['isInteger', 'isSafeInteger', 'isFloat', 'isFinite', 'isInfinite', 'isNaN', 'isNumeric'];

// An independent binary64 model: classify the encoding, not the library's
// valueOf/Math.floor/Number.isInteger implementation or another API's result.
function classifyBits(high, low) {
  const exponent = (high >>> 20) & 0x7ff;
  const fraction = (BigInt(high & 0xfffff) << 32n) | BigInt(low);
  const finite = exponent !== 0x7ff;
  const zero = exponent === 0 && fraction === 0n;
  const integral =
    finite && (zero || (exponent >= 1023 && (exponent >= 1075 || fraction % (1n << BigInt(1075 - exponent)) === 0n)));
  return [
    integral,
    integral && exponent < 1076,
    finite && !integral,
    finite,
    !finite && fraction === 0n,
    !finite && fraction !== 0n,
    finite
  ];
}

function binarySamples() {
  const samples = [];
  // Signed zero, subnormals, normal boundary, fractional transitions around 1,
  // integer/safe-integer boundaries, largest finite values, infinities and NaNs.
  for (const exponent of [0, 1, 1021, 1022, 1023, 1024, 1074, 1075, 1076, 2046, 2047]) {
    for (const fraction of [0n, 1n, 1n << 51n, (1n << 52n) - 1n]) {
      for (const sign of [0, 0x80000000]) {
        samples.push([(sign | (exponent << 20) | Number(fraction >> 32n)) >>> 0, Number(fraction & 0xffffffffn)]);
      }
    }
  }
  let state = 0x8a060123;
  function nextWord() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  for (let index = 0; index < 96; index++) samples.push([nextWord(), nextWord()]);
  return samples;
}

test('numeric partitions match binary64 encodings across primitive and boxed representations', () => {
  const view = new DataView(new ArrayBuffer(8));
  const samples = binarySamples();
  assert.equal(samples.length, 184);
  for (const [high, low] of samples) {
    view.setUint32(0, high);
    view.setUint32(4, low);
    const value = view.getFloat64(0);
    const expected = classifyBits(high, low);
    for (const input of [value, new Number(value), new ForeignNumber(value)]) {
      for (const api of backends) {
        for (const [index, name] of numericNames.entries()) {
          assert.equal(api[name](input), expected[index], `${name} on bits ${high.toString(16)}:${low.toString(16)}`);
        }
      }
    }
  }
});

test('numeric text and JSON numeric syntax remain distinct contracts', () => {
  const cases = [
    ['0', true, true],
    ['-0', true, true],
    ['+0', true, false],
    ['01', true, false],
    ['.5', true, false],
    ['1.', true, false],
    ['0x10', true, false],
    ['0b10', true, false],
    ['0o10', true, false],
    ['-0x10', false, false],
    ['+0b10', false, false],
    ['0o8', false, false],
    ['1_000', false, false],
    ['1n', false, false],
    ['1e+3', true, true],
    ['1e', false, false],
    ['1e400', false, true],
    ['-1e400', false, true],
    ['0e400', true, true],
    ['1e-400', true, true],
    ['9007199254740993', true, true],
    ['Infinity', false, false],
    ['NaN', false, false],
    ['null', false, true],
    ['true', false, true],
    ['"1"', false, true],
    ['[1]', false, true],
    ['{"n":1e400}', false, true],
    ['1 2', false, false],
    ['1\u0000', false, false],
    ['1px', false, false]
  ];
  for (const [text, numeric, json] of cases) {
    for (const input of [text, new String(text), new ForeignString(text)]) {
      for (const api of backends) {
        assert.equal(api.isNumeric(input), numeric, JSON.stringify(text));
        assert.equal(api.isJson(input), json, JSON.stringify(text));
      }
    }
  }
});

test('numeric whitespace does not silently broaden the JSON whitespace grammar', () => {
  const jsonWhitespace = [0x09, 0x0a, 0x0d, 0x20];
  const numericOnlyWhitespace = [
    0xb, 0xc, 0xa0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a,
    0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff
  ];
  for (const code of [...jsonWhitespace, ...numericOnlyWhitespace]) {
    const space = String.fromCharCode(code);
    for (const api of backends) {
      assert.equal(api.isNumeric(space), false, 'blank U+' + code.toString(16));
      assert.equal(api.isJson(space), false, 'blank U+' + code.toString(16));
      for (const text of [space + '1', '1' + space, space + '1' + space]) {
        assert.equal(api.isNumeric(new String(text)), true, JSON.stringify(text));
        assert.equal(api.isJson(new String(text)), jsonWhitespace.includes(code), JSON.stringify(text));
      }
    }
  }
});

test('numeric and JSON text reject invisible non-whitespace and non-ASCII digit lookalikes', () => {
  for (const code of [0x0085, 0x180e, 0x200b, 0x2060]) {
    const character = String.fromCharCode(code);
    for (const text of [character, character + '1', '1' + character]) {
      for (const api of backends) {
        assert.equal(api.isNumeric(text), false, JSON.stringify(text));
        assert.equal(api.isJson(text), false, JSON.stringify(text));
      }
    }
  }
  for (const text of ['\u0661', '\uff11', '\u22121', '1,5', '1\u00a0000']) {
    for (const api of backends) {
      assert.equal(api.isNumeric(text), false, text);
      assert.equal(api.isJson(text), false, text);
    }
  }
});

test('numeric success describes the represented number, not exact decimal preservation', () => {
  const rounded = Number('9007199254740993');
  const underflow = Number('-1e-400');
  assert.equal(rounded, 9007199254740992);
  assert.ok(Object.is(underflow, -0));
  for (const api of backends) {
    assert.equal(api.isNumeric('9007199254740993'), true);
    assert.equal(api.isInteger(rounded), true);
    assert.equal(api.isSafeInteger(rounded), false);
    assert.equal(api.isNumeric('-1e-400'), true);
    assert.equal(api.isInteger(underflow), true);
    assert.equal(api.isFloat(underflow), false);
    assert.equal(api.isSafeInteger(underflow), true);
    assert.equal(api.isNumeric('1e400'), false);
    assert.equal(api.isInfinite(Number('1e400')), true);
  }
});

test('primitive bigints remain numeric even beyond Number range, but boxed bigints do not', () => {
  const huge = 10n ** 400n;
  assert.equal(Number(huge), Infinity);
  for (const value of [0n, huge, -huge]) {
    for (const api of backends) {
      assert.equal(api.isNumeric(value), true);
      assert.equal(api.isNumeric(Object(value)), false);
      for (const name of numericNames.filter((name) => name !== 'isNumeric')) assert.equal(api[name](value), false);
    }
  }
});

test('text checks read immutable String payloads despite changed prototypes and poisoned hooks', () => {
  let reads = 0;
  for (const [text, numeric, json] of [
    ['42', true, true],
    ['{"a":1}', false, true],
    ['bad', false, false]
  ]) {
    for (const Constructor of [String, ForeignString]) {
      const input = new Constructor(text);
      Object.setPrototypeOf(input, null);
      for (const key of ['valueOf', 'toString', 'toJSON', 'constructor', Symbol.toPrimitive, Symbol.toStringTag]) {
        Object.defineProperty(input, key, {
          get() {
            reads++;
            throw Error('conversion hook read');
          }
        });
      }
      Object.freeze(input);
      for (const api of backends) {
        assert.equal(api.isNumeric(input), numeric);
        assert.equal(api.isJson(input), json);
      }
    }
  }
  assert.equal(reads, 0);
});

test('rejected inputs stay false, not NaN, without consulting coercion or proxy traps', () => {
  let reads = 0;
  const hostile = {};
  hostile.self = hostile;
  for (const key of ['valueOf', 'toString', 'toJSON', Symbol.toPrimitive, Symbol.toStringTag]) {
    Object.defineProperty(hostile, key, {
      get() {
        reads++;
        throw Error('unexpected inspection');
      }
    });
  }
  const traps = {
    get() {
      reads++;
      throw Error('get');
    },
    getPrototypeOf() {
      reads++;
      throw Error('prototype');
    }
  };
  const revoked = Proxy.revocable(new String('1'), traps);
  revoked.revoke();
  const inputs = [
    undefined,
    null,
    true,
    Symbol('x'),
    Object(1n),
    hostile,
    Object.create(String.prototype),
    new Proxy(new String('1'), traps),
    new Proxy(new Number(NaN), traps),
    revoked.proxy
  ];
  for (const api of backends) {
    for (const input of inputs) {
      for (const name of [...numericNames, 'isJson']) assert.equal(api[name](input), false, name);
    }
    // A true NaN payload remains distinguishable from the rejection sentinel.
    assert.equal(api.isNaN(new Number(NaN)), true);
    assert.equal(api.isNaN(new String('NaN')), false);
  }
  assert.equal(reads, 0);
});

test('captured numeric predicates, payload readers and JSON parser survive later reassignment', () => {
  const scope = vm.createContext({});
  vm.runInContext(source, scope);
  vm.runInContext(
    `
    const fail = () => { throw Error('replacement must not run'); };
    Number.isInteger = Number.isSafeInteger = Number.isFinite = Math.floor = fail;
    Number.prototype.valueOf = String.prototype.valueOf = JSON.parse = fail;
  `,
    scope
  );
  const api = scope.Types;
  assert.equal(api.isInteger(new Number(3)), true);
  assert.equal(api.isSafeInteger(new Number(2 ** 53)), false);
  assert.equal(api.isFloat(new Number(0.5)), true);
  assert.equal(api.isFinite(new Number(Infinity)), false);
  assert.equal(api.isInfinite(new Number(-Infinity)), true);
  assert.equal(api.isNaN(new Number(NaN)), true);
  assert.equal(api.isNumeric(new String('0x10')), true);
  assert.equal(api.isNumeric(new String('1e400')), false);
  assert.equal(api.isJson(new String('null')), true);
  assert.equal(api.isJson(new String('{bad}')), false);
});

test('JSON distinguishes escaped controls, malformed escapes and permissible string contents', () => {
  for (const api of backends) {
    for (let code = 0; code < 32; code++) {
      assert.equal(api.isJson('"' + String.fromCharCode(code) + '"'), false, 'raw control ' + code);
      assert.equal(api.isJson('"\\u' + code.toString(16).padStart(4, '0') + '"'), true, 'escape ' + code);
    }
    for (const escape of ['\\"', '\\\\', '\\/', '\\b', '\\f', '\\n', '\\r', '\\t', '\\uD800', '\\uDC00']) {
      assert.equal(api.isJson('"' + escape + '"'), true, escape);
    }
    for (const escape of ['\\x00', '\\v', '\\0', '\\u000g', '\\u{41}', '\\u123']) {
      assert.equal(api.isJson('"' + escape + '"'), false, escape);
    }
    for (const character of ['\u2028', '\u2029', '\ufeff', '\ud800', '\udc00', '\ud83d\ude00']) {
      assert.equal(api.isJson('"' + character + '"'), true, JSON.stringify(character));
    }
  }
});

test('JSON validity does not assert finite payloads, unique keys, safe magnitudes or object serialisability', () => {
  const cases = [
    ['1e400', true],
    ['-1e400', true],
    ['9007199254740993', true],
    ['{"a":1,"a":2}', true],
    ['{"__proto__":{"a":1}}', true],
    ['{"n":NaN}', false],
    ['{"n":Infinity}', false],
    ['{"a":undefined}', false],
    ['[1,,2]', false],
    ['/* comment */null', false]
  ];
  for (const api of backends) {
    // Repeated mixed success/failure calls must not share parsing state.
    for (let pass = 0; pass < 3; pass++) {
      for (const [text, expected] of cases) assert.equal(api.isJson(text), expected, text);
    }
  }
});
