'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('../index.js');
function outcome(run) {
  try {
    return { value: run() };
  } catch (error) {
    return { error: error.name, message: error.message };
  }
}

// Native conversions are the oracle for the supported conversion contracts;
// object-returning identity exceptions (Date/Symbol) have explicit assertions.
const conversions = {
  toBigInt: (value) => BigInt(value),
  toBoolean: (value) => Boolean(value),
  toInteger: (value) => Math.trunc(Number(value)),
  toNumber: (value) => Number(value),
  toString: (value) => String(value)
};
test('toArray preserves native iteration for supported iterable collections', () => {
  for (const value of [[1, 2], Array(2), 'A\u{1F600}B', new Set([1, 2]), new Map([['a', 1]]), new Uint8Array([2, 1])]) {
    assert.deepEqual(T.toArray(value), Array.from(value));
  }
});
const inputFactories = [
  () => undefined,
  () => null,
  () => true,
  () => false,
  () => 0,
  () => -0,
  () => -1.5,
  () => NaN,
  () => Infinity,
  () => -Infinity,
  () => 1n,
  () => '0x10',
  () => '',
  () => ' \t',
  () => 'false',
  () => 'A😀B',
  () => 'not numeric',
  () => [1, 2],
  () => new Set([1, 2]),
  () => ({ 0: 'x', length: 2 }),
  () => ({ length: 1.5 }),
  () => new Number(3),
  () => new String('12.5'),
  () => new Boolean(false),
  () => ({
    valueOf() {
      return 3;
    }
  }),
  () => ({
    [Symbol.toPrimitive]() {
      return '4.8';
    }
  }),
  () => ({
    valueOf() {
      throw new SyntaxError('conversion failure');
    }
  })
];
for (const [name, native] of Object.entries(conversions)) {
  test(name + ' agrees with independent native-conversion expectations', () => {
    for (const make of inputFactories) {
      const value = make();
      assert.deepEqual(
        outcome(() => T[name](value)),
        outcome(() => native(value))
      );
    }
  });
}
for (const name of Object.keys(conversions).concat(['toArray', 'toDate', 'toSymbol'])) {
  test(name + 'If does not inspect a skipped revoked proxy and invokes conditions once', () => {
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();
    assert.equal(T[name + 'If'](proxy, false), proxy);
    let calls = 0;
    assert.equal(
      T[name + 'If'](proxy, (value) => {
        calls++;
        assert.equal(value, proxy);
        return false;
      }),
      proxy
    );
    assert.equal(calls, 1);
  });
}
