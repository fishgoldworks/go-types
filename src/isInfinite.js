const getNumberValue = require('./util/getNumberValue');

/**
 * Determines whether a primitive or boxed number is positive or negative infinity.
 *
 * Accepts genuine `Number` wrappers without invoking conversion hooks; rejects numeric strings.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is primitive or boxed positive or negative infinity;
 * otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isinfinitevalue
 * @example isInfinite(-Infinity);               // => true
 * @example isInfinite(new Number(-Infinity));   // => true
 * @example isInfinite(NaN);                     // => false
 */
function isInfinite(value) {
  const number = typeof value === 'number' ? value : getNumberValue(value);
  return number === Infinity || number === -Infinity;
}
module.exports = isInfinite;
