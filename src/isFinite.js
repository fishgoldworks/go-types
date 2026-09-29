const getNumberValue = require('./util/getNumberValue');
const nativeCheck = Number.isFinite;

/**
 * Checks for a finite number.
 * Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isFinite(1);             // => true
 * @example isFinite(new Number(1)); // => true
 * @example isFinite(Infinity);      // => false
 */
function isFinite(value) {
    return nativeCheck(typeof value === 'number' ? value : getNumberValue(value));
}
module.exports = isFinite;
