'use strict';

const nativeBigInt = BigInt;

/**
 * Converts a value to a primitive bigint with native BigInt conversion.
 * Accepts booleans, integral numbers and integer text, including hexadecimal, binary and octal forms. Fractional/non-finite numbers throw RangeError; invalid integer text throws SyntaxError; null, undefined and symbols throw TypeError. Empty/whitespace text becomes 0n. Already-rounded Number inputs cannot regain lost precision: pass bigint or integer text when exactness matters.
 * @param {*} value Value to convert.
 * @returns {bigint}
 * @example toBigInt('9007199254740993') === 9007199254740993n; // => true
 * @example toBigInt(true) === 1n;                              // => true
 * @example toBigInt('0xff') === 255n;                          // => true
 */
function toBigInt(value) {
    return nativeBigInt(value);
}

module.exports = toBigInt;
