'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('..');

for (const value of [
  undefined,
  null,
  false,
  true,
  0,
  -0,
  1,
  NaN,
  Infinity,
  '',
  'x',
  Symbol(),
  1n,
  {},
  [],
  Object.create(null),
  () => {}
]) {
  test(
    'complementary boundaries: ' +
      String(typeof value) +
      ' / ' +
      (typeof value === 'object' ? 'object' : String(value)),
    () => {
      assert.equal(T.isNullish(value), value === null || value === undefined);
      assert.equal(T.isNonNullish(value), !T.isNullish(value));
      assert.equal(T.isPrimitive(value), !T.isObject(value));
    }
  );
}

test('array fast paths retain unsupported-size errors instead of disguising them as false', () => {
  for (const length of [NaN, -1, 0.5, Infinity, undefined, '0']) {
    const array = new Proxy([], {
      get(target, key, receiver) {
        return key === 'length' ? length : Reflect.get(target, key, receiver);
      }
    });
    assert.throws(() => T.isEmpty(array), TypeError);
    assert.throws(() => T.isBlank(array), TypeError);
  }
});

test('fast paths read array length once and each blankness item once', () => {
  let lengthReads = 0,
    itemReads = 0;
  const array = new Proxy([undefined], {
    get(target, key, receiver) {
      if (key === 'length') lengthReads++;
      if (key === '0') itemReads++;
      return Reflect.get(target, key, receiver);
    }
  });
  assert.equal(T.isBlank(array), true);
  assert.equal(lengthReads, 1);
  assert.equal(itemReads, 1);
});

for (const value of [
  0,
  -0,
  1,
  -1,
  1.5,
  -1.5,
  NaN,
  Infinity,
  -Infinity,
  Number.MAX_SAFE_INTEGER,
  Number.MAX_SAFE_INTEGER + 1,
  Number.MIN_VALUE
]) {
  for (const [name, expected] of [
    ['isFinite', Number.isFinite(value)],
    ['isInteger', Number.isInteger(value)],
    ['isSafeInteger', Number.isSafeInteger(value)],
    ['isFloat', Number.isFinite(value) && !Number.isInteger(value)],
    ['isNaN', Number.isNaN(value)],
    ['isInfinite', value === Infinity || value === -Infinity]
  ])
    test('numeric fast-path equivalence: ' + name + ' / ' + String(value), () => {
      assert.equal(T[name](value), expected);
      const boxed = new Number(value);
      Object.defineProperty(boxed, 'valueOf', {
        get() {
          throw Error('user valueOf must not be read');
        }
      });
      Object.defineProperty(boxed, Symbol.toPrimitive, {
        get() {
          throw Error('coercion must not be read');
        }
      });
      assert.equal(T[name](boxed), expected);
    });
}
