/**
 * Checks whether a value is neither `null` nor `undefined`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is neither `null` nor `undefined`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnotnullishvalue
 * @example isNotNullish(0);               // => true
 * @example isNotNullish(false);           // => true
 * @example isNotNullish(null);            // => false
 */
function isNotNullish(value) {
  return value !== null && value !== undefined;
}
module.exports = isNotNullish;
