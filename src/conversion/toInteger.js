'use strict';

const toNumber = require('./toNumber');
const trunc = Math.trunc;

/**
 * Converts with Number, then truncates toward zero with Math.trunc.
 * Converts the entire value, not a numeric prefix: '12px' becomes NaN. Negative fractions truncate toward zero, not toward negative infinity. NaN, infinities and signed zero retain Math.trunc behaviour; this function does not guarantee a finite or safe integer. It does not clamp or substitute defaults. Use isInteger/isSafeInteger to validate the result. Symbols and failed object conversions can throw.
 * @param {*} value Value to convert.
 * @returns {number}
 * @example toInteger('12.9');               // => 12
 * @example toInteger(-12.9);                // => -12
 * @example Number.isNaN(toInteger('12px')); // => true
 * @example Object.is(toInteger(-0.5), -0);  // => true
 * @example toInteger('1e3');                // => 1000
 */
function toInteger(value) {
    // Convert the whole value before truncating: '12px' must not become 12.
    return trunc(toNumber(value));
}

module.exports = toInteger;
