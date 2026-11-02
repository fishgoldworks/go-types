const getNumberValue = require('./util/getNumberValue');
const floor = Math.floor;
const nativeCheck =
  typeof Number.isSafeInteger === 'function'
    ? Number.isSafeInteger
    : (value) =>
        typeof value === 'number' && value >= -9007199254740991 && value <= 9007199254740991 && floor(value) === value;

/**
 * Checks whether a primitive or boxed number is an integer in JavaScript’s safe-integer range.
 *
 * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive or boxed integer within the safe-integer
 * range; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issafeintegervalue
 * @example isSafeInteger(Number.MAX_SAFE_INTEGER);              // => true
 * @example isSafeInteger(new Number(Number.MAX_SAFE_INTEGER));  // => true
 * @example isSafeInteger(Number.MAX_SAFE_INTEGER + 1);          // => false
 */
function isSafeInteger(value) {
  return nativeCheck(typeof value === 'number' ? value : getNumberValue(value));
}
module.exports = isSafeInteger;
