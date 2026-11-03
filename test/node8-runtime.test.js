'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function inHost(body) {
  const result = spawnSync(
    process.execPath,
    ['-e', `const assert = require('node:assert/strict'); (${body.toString()})();`],
    {
      cwd: root,
      encoding: 'utf8',
      timeout: 10000
    }
  );
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
}
test('missing BigInt does not prevent importing the API or using unrelated functions', () =>
  inHost(() => {
    delete globalThis.BigInt;
    const T = require('./index.js');
    assert.deepEqual(Object.keys(T).sort(), require('./scripts/exports.json').slice().sort());
    assert.equal(T.toJson({ a: 1 }), '{"a":1}');
    assert.equal(T.toNumber('42'), 42);
    assert.equal(T.isBigInt(42), false);
    const value = {
      valueOf() {
        throw Error('must not coerce');
      }
    };
    const unsupported = (error) =>
      error instanceof TypeError && error.message === 'Native BigInt conversion is unavailable in this runtime.';
    assert.throws(() => T.toBigInt(value), unsupported);
  }));
test('collection predicates work without optional array flatMap', () =>
  inHost(() => {
    Array.prototype.flatMap = undefined;
    const T = require('./index.js');
    const calls = [];
    const predicate = (value) => {
      calls.push(value);
      return typeof value === 'number' || value === null;
    };
    assert.equal(T.isArrayOf([1, null], predicate), true);
    assert.deepEqual(calls, [1, null]);
    assert.equal(T.isArrayOf([false], predicate), false);
  }));
test('missing async-iterator symbol never reads the string undefined property', () =>
  inHost(() => {
    const NativeSymbol = Symbol;
    function LegacySymbol(value) {
      return NativeSymbol(value);
    }
    Object.setPrototypeOf(LegacySymbol, NativeSymbol);
    LegacySymbol.prototype = NativeSymbol.prototype;
    Object.defineProperty(LegacySymbol, 'asyncIterator', { value: undefined });
    globalThis.Symbol = LegacySymbol;
    const T = require('./index.js');
    const value = Object.defineProperty({}, 'undefined', {
      get() {
        throw Error('unrelated getter');
      }
    });
    assert.equal(T.isAsyncIterable(value), false);
    assert.equal(T.isEmpty(value), true);
    assert.equal(T.isBlank(value), true);
    assert.equal(T.isAsyncIterable({ undefined() {} }), false);
    assert.equal(T.isAsyncIterable(null), false);
    assert.equal(T.isAsyncIterable(undefined), false);
    assert.equal(T.isIterable([]), true);
  }));
