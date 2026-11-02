const getNumberValue = require('./util/getNumberValue');
const nativeCheck =
  typeof Number.isFinite === 'function'
    ? Number.isFinite
    : (value) => typeof value === 'number' && value === value && value !== Infinity && value !== -Infinity;

/**
 * Checks whether a primitive or boxed number is a finite number.
 *
 * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive or boxed finite number; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfinitevalue
 * @example isFinite(1);                   // => true
 * @example isFinite(new Number(1));       // => true
 * @example isFinite(Infinity);            // => false
 */
function isFinite(value) {
  return nativeCheck(typeof value === 'number' ? value : getNumberValue(value));
}
module.exports = isFinite;
