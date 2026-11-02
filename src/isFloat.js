const getNumberValue = require('./util/getNumberValue');
const floor = Math.floor;

/**
 * Checks whether a primitive or boxed number is a finite number with a fractional part.
 *
 * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive or boxed finite non-integer number;
 * otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfloatvalue
 * @example isFloat(0.5);                  // => true
 * @example isFloat(new Number(0.5));      // => true
 * @example isFloat(1);                    // => false
 */
function isFloat(value) {
  const number = typeof value === 'number' ? value : getNumberValue(value);
  // NaN is rejected explicitly; infinities equal their own floors.
  return number !== undefined && number === number && floor(number) !== number;
}
module.exports = isFloat;
