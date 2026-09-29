'use strict';

const nativeNumber = Number;

/**
 * Converts a value to a primitive number using Number.
 * Native coercion is intentional: null, false and empty/whitespace strings become 0; true becomes 1; invalid numeric text becomes NaN. Unlike isNumeric, whitespace is not rejected. Symbols throw; object coercion hooks may run and throw. Bigints may lose precision or overflow to infinity. No locale parsing or safe-number guarantee is provided. Omitted/undefined input produces NaN.
 * @param {*} value Value to convert.
 * @returns {number}
 * @example toNumber('12.5');               // => 12.5
 * @example toNumber('0x10');               // => 16
 * @example toNumber(null);                 // => 0
 * @example Number.isNaN(toNumber('12px')); // => true
 */
function toNumber(value) {
    return nativeNumber(value);
}

module.exports = toNumber;
