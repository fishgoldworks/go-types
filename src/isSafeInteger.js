const getNumberValue = require('./util/getNumberValue');
const nativeCheck = Number.isSafeInteger;

/**
 * Checks for an integer in [-9007199254740991, 9007199254740991].
 * Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isSafeInteger(Number.MAX_SAFE_INTEGER);             // => true
 * @example isSafeInteger(new Number(Number.MAX_SAFE_INTEGER)); // => true
 * @example isSafeInteger(Number.MAX_SAFE_INTEGER + 1);         // => false
 */
function isSafeInteger(value) {
    return nativeCheck(typeof value === 'number' ? value : getNumberValue(value));
}
module.exports = isSafeInteger;
