'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const native = require('node:util').types;
const T = require('..');
const source = require('../scripts/source-test-loader.js')();

function inHost(types) {
  const scope = { process: { getBuiltinModule: () => ({ types }) } };
  vm.runInNewContext(source, scope);
  return scope.Types;
}

// A failed optional capability must not make unrelated public functions unloadable.
// Use real classifiers for the available capabilities, not fabricated type results.
const classifierCases = [
  ['isBooleanObject', 'isBoolean', () => new Boolean(false)],
  ['isNumberObject', 'isNumber', () => new Number(NaN)],
  ['isStringObject', 'isString', () => new String('')],
  ['isDate', 'isDate', () => new Date(NaN)],
  ['isRegExp', 'isRegExp', () => /x/],
  ['isMap', 'isMap', () => new Map()],
  ['isSet', 'isSet', () => new Set()],
  ['isWeakMap', 'isWeakMap', () => new WeakMap()],
  ['isWeakSet', 'isWeakSet', () => new WeakSet()],
  ['isArrayBuffer', 'isArrayBuffer', () => new ArrayBuffer(0)],
  ['isSharedArrayBuffer', 'isSharedArrayBuffer', () => new SharedArrayBuffer(0)],
  ['isDataView', 'isDataView', () => new DataView(new ArrayBuffer(0))]
];
for (const [key, name, create] of classifierCases) {
  test('optional classifier property failure falls back without aborting import: ' + key, () => {
    const types = Object.assign({}, native);
    let reads = 0;
    Object.defineProperty(types, key, {
      get() {
        reads++;
        throw new Error('optional host classifier unavailable');
      }
    });
    const api = inHost(types);
    assert.equal(api[name](create()), true);
    assert.equal(api[name]({}), false);
    assert.equal(api[name](new Proxy(create(), {})), false);
    assert.equal(api.isArray([]), true, 'an unrelated check must remain usable');
    assert.equal(api.isEmpty({}), true, 'downstream dictionary dispatch must remain usable');
    assert.equal(reads, 1, 'unavailable capabilities are inspected once, not at call time');
  });
}

test('optional classifier access is snapshotted once, without invoking it during discovery', () => {
  let reads = 0;
  let calls = 0;
  const types = Object.defineProperty({}, 'isNumberObject', {
    configurable: true,
    get() {
      reads++;
      if (reads > 1) throw new Error('host capability read twice');
      return (value) => {
        calls++;
        return native.isNumberObject(value);
      };
    }
  });
  const api = inHost(types);
  assert.equal(reads, 1);
  assert.equal(calls, 0);
  Object.defineProperty(types, 'isNumberObject', { value: () => false });
  assert.equal(api.isNumber(new Number(1)), true);
  assert.equal(api.isNumber({}), false);
  assert.equal(api.isInteger(new Number(1)), true);
  assert.equal(calls, 3);
  assert.equal(reads, 1);
});

test('optional native recovery does not swallow execution failures from a selected classifier', () => {
  const failure = new Error('selected classifier execution failed');
  const api = inHost({
    isNumberObject() {
      throw failure;
    }
  });
  assert.equal(api.isNumber(1), true);
  assert.throws(
    () => api.isNumber({}),
    (error) => error === failure
  );
});

test('an unavailable classifier does not disable other working native classifiers', () => {
  let calls = 0;
  const types = {
    get isBooleanObject() {
      throw new Error('denied');
    },
    isNumberObject(value) {
      calls++;
      return native.isNumberObject(value);
    }
  };
  const api = inHost(types);
  assert.equal(api.isBoolean(new Boolean(false)), true);
  assert.equal(api.isNumber(new Number(2)), true);
  assert.equal(calls, 1);
});

test('null, missing and non-function optional classifier properties preserve portable checks', () => {
  for (const value of [undefined, null, 0, 'not a function', {}]) {
    const api = inHost({ isBooleanObject: value, isNumberObject: value, isStringObject: value });
    for (const [name, input] of [
      ['isBoolean', new Boolean(false)],
      ['isNumber', new Number(NaN)],
      ['isString', new String('')]
    ]) {
      assert.equal(api[name](input), true);
      assert.equal(api[name]({}), false);
    }
  }
});

test('real focused and root imports survive a denied optional classifier property', () => {
  const result = spawnSync(
    process.execPath,
    [
      '-e',
      `
      const assert = require('node:assert/strict');
      const original = process.getBuiltinModule;
      const types = Object.defineProperty({}, 'isNumberObject', {
        get() { throw new Error('denied optional capability'); }
      });
      try {
        process.getBuiltinModule = () => ({ types });
        const isNumber = require('./src/isNumber.js');
        const api = require('./index.js');
        assert.equal(isNumber(new Number(1)), true);
        assert.equal(api.isNumber, isNumber);
        assert.equal(api.isInteger(new Number(1)), true);
        assert.equal(api.isNumber({}), false);
      } finally { process.getBuiltinModule = original; }
      `
    ],
    { cwd: path.resolve(__dirname, '..'), encoding: 'utf8', timeout: 10000 }
  );
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

const fallbackScope = {};
vm.runInNewContext(source, fallbackScope);
for (const [label, api] of [
  ['native', T],
  ['portable', fallbackScope.Types]
]) {
  test(
    label + ': builtin wrapper prototypes carry their primitive brands but symbol/bigint checks stay primitive-only',
    () => {
      const values = vm.runInNewContext(
        '[Boolean.prototype, Number.prototype, String.prototype, Symbol.prototype, BigInt.prototype]'
      );
      const expected = ['isBoolean', 'isNumber', 'isString', null, null];
      for (let i = 0; i < values.length; i++) {
        for (const name of ['isBoolean', 'isNumber', 'isString', 'isSymbol', 'isBigInt']) {
          assert.equal(api[name](values[i]), name === expected[i], name + ' / prototype ' + i);
        }
        assert.equal(api.isPrimitive(values[i]), false);
        assert.equal(api.isObject(values[i]), true);
      }
    }
  );

  test(label + ': type and truthiness boundaries do not invoke coercion or proxy traps', () => {
    const failure = new Error('must not inspect');
    let reads = 0;
    const fail = () => {
      reads++;
      throw failure;
    };
    const target = Object.create(null);
    for (const key of ['constructor', 'valueOf', 'toString', Symbol.toPrimitive, Symbol.toStringTag]) {
      Object.defineProperty(target, key, { get: fail });
    }
    const proxy = new Proxy(target, { get: fail, getPrototypeOf: fail, has: fail, ownKeys: fail });
    const revoked = Proxy.revocable(target, {});
    revoked.revoke();
    for (const input of [target, proxy, revoked.proxy]) {
      for (const name of [
        'isUndefined',
        'isNull',
        'isNullish',
        'isBoolean',
        'isNumber',
        'isString',
        'isSymbol',
        'isBigInt',
        'isPrimitive',
        'isFalsy',
        'isFunction'
      ]) {
        assert.equal(api[name](input), false, name);
      }
      for (const name of ['isObject', 'isObjectLike', 'isNonNullish', 'isTruthy']) {
        assert.equal(api[name](input), true, name);
      }
    }
    assert.equal(reads, 0);
    assert.throws(
      () => api.isPlainObject(proxy),
      (error) => error === failure
    );
    assert.throws(
      () => api.isArray(revoked.proxy),
      (error) => error.name === 'TypeError'
    );
  });

  test(label + ': plain-object checks follow replaced prototypes but keep functions excluded', () => {
    const ordinary = vm.runInNewContext('Object.prototype');
    for (const input of [[], new Number(1), new Map(), new (class Example {})()]) {
      for (const prototype of [null, Object.prototype, ordinary]) {
        Object.setPrototypeOf(input, prototype);
        assert.equal(api.isPlainObject(input), true);
      }
      Object.setPrototypeOf(input, {});
      assert.equal(api.isPlainObject(input), false);
    }
    for (const input of [function () {}, class Example {}]) {
      for (const prototype of [null, Object.prototype]) {
        Object.setPrototypeOf(input, prototype);
        assert.equal(api.isPlainObject(input), false);
        assert.equal(api.isObject(input), true);
        assert.equal(api.isObjectLike(input), false);
        assert.equal(api.isFunction(input), true);
      }
    }
  });
}
