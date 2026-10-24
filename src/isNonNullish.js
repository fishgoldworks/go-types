/**
 * Checks whether a value is neither `null` nor `undefined`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is neither `null` nor `undefined`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnonnullishvalue
 * @example isNonNullish(0);               // => true
 * @example isNonNullish(false);           // => true
 * @example isNonNullish(null);            // => false
 */
function isNonNullish(value) {
  return value !== null && value !== undefined;
}
module.exports = isNonNullish;
