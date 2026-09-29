const getNumberValue = require('./util/getNumberValue');
const nativeCheck = Number.isInteger;

/**
 * Checks for a finite integral number.
 * Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isInteger(1);             // => true
 * @example isInteger(new Number(1)); // => true
 * @example isInteger(1.5);           // => false
 */
function isInteger(value) {
    return nativeCheck(typeof value === 'number' ? value : getNumberValue(value));
}
module.exports = isInteger;
