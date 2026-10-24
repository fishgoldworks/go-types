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

test('missing BigInt does not prevent importing the API or skipping conversion', () =>
  inHost(() => {
    delete globalThis.BigInt;
    const T = require('./index.js');
    assert.deepEqual(Object.keys(T).sort(), require('./scripts/exports.json').slice().sort());
    assert.equal(T.toJson({ a: 1 }), '{"a":1}');
    assert.equal(T.toJsonIf({ a: 1 }, true), '{"a":1}');
    assert.equal(T.toNumber('42'), 42);
    assert.equal(T.isBigInt(42), false);
    const value = {
      valueOf() {
        throw Error('must not coerce');
      }
    };
    for (const condition of [false, undefined, () => false]) assert.equal(T.toBigIntIf(value, condition), value);
    assert.equal(T.toBigIntIf(value), value);
    const unsupported = (error) =>
      error instanceof TypeError && error.message === 'Native BigInt conversion is unavailable in this runtime.';
    assert.throws(() => T.toBigInt(value), unsupported);
    assert.throws(() => T.toBigIntIf(value, true), unsupported);
    assert.throws(() => T.toBigIntIf(value, () => true), unsupported);
    const failure = Error('predicate failure');
    assert.throws(
      () =>
        T.toBigIntIf(value, () => {
          throw failure;
        }),
      (error) => error === failure
    );
    assert.throws(() => T.toBigIntIf(value, () => 1), /boolean/);
  }));

test('nested pure unions work without flatMap and preserve effectful branches', () =>
  inHost(() => {
    Array.prototype.flatMap = undefined;
    const T = require('./index.js');
    const shared = ['number', 'string'];
    const check = (value) => T.isTypeOf(value, [shared, [shared, null]]);
    for (const value of [1, 'x', null]) assert.equal(check(value), true);
    assert.equal(check(false), false);
    assert.equal(T.isArrayOf([1, 'x', null], [shared, null]), true);
    const calls = [];
    const effect = {
      predicate(value) {
        calls.push(value);
        return false;
      }
    };
    assert.equal(T.isTypeOf(1, [[effect], [effect], 'number']), true);
    assert.deepEqual(calls, [1, 1]);
    const cycle = [];
    cycle.push(cycle);
    assert.throws(() => T.isTypeOf(undefined, cycle), /cycles/);
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
