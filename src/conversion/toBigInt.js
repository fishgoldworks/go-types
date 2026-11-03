'use strict';

const nativeBigInt = typeof BigInt === 'function' ? BigInt : undefined;

/**
 * Converts a value to a primitive bigint using native conversion.
 *
 * Requires native BigInt. Fractional numbers and invalid integer text throw; input conversion
 * hooks may run.
 *
 * @param {*} [value] The value to convert.
 * @returns {bigint} The converted primitive bigint.
 * @throws {*} `RangeError` for fractional or non-finite numbers; `SyntaxError` for invalid integer
 * text; `TypeError` for nullish values, symbols, or unavailable native BigInt support.
 * Object-coercion errors propagate.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tobigintvalue
 * @example toBigInt('9007199254740993') === 9007199254740993n;  // => true
 * @example toBigInt(true) === 1n;                               // => true
 * @example toBigInt('0xff') === 255n;                           // => true
 */
function toBigInt(value) {
  if (!nativeBigInt) throw new TypeError('Native BigInt conversion is unavailable in this runtime.');
  return nativeBigInt(value);
}

module.exports = toBigInt;
