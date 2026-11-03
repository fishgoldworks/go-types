const getNumberValue = require('./util/getNumberValue');
const floor = Math.floor;
const nativeCheck =
  typeof Number.isInteger === 'function'
    ? Number.isInteger
    : (value) => typeof value === 'number' && value !== Infinity && value !== -Infinity && floor(value) === value;

/**
 * Checks whether a primitive or boxed number is an integer.
 *
 * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive or boxed finite integral number; otherwise
 * `false`.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isintegervalue
 * @example isInteger(1);                  // => true
 * @example isInteger(new Number(1));      // => true
 * @example isInteger(1.5);                // => false
 */
function isInteger(value) {
  return nativeCheck(typeof value === 'number' ? value : getNumberValue(value));
}
module.exports = isInteger;
