const getNumberValue = require('./util/getNumberValue');

/**
 * Checks whether a primitive or boxed number is `NaN`.
 *
 * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is primitive or boxed `NaN`; otherwise `false`.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnanvalue
 * @example isNaN(NaN);                    // => true
 * @example isNaN(new Number(NaN));        // => true
 * @example isNaN("NaN");                  // => false
 */
function isNaN(value) {
  const number = typeof value === 'number' ? value : getNumberValue(value);
  return number !== number;
}
module.exports = isNaN;
