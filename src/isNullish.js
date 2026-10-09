/**
 * Determines whether a value is `null` or `undefined`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is `null` or `undefined`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnullishvalue
 * @example isNullish(null);               // => true
 * @example isNullish(undefined);          // => true
 * @example isNullish(0);                  // => false
 */
function isNullish(value) {
  return value === null || value === undefined;
}

module.exports = isNullish;
