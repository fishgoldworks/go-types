/**
 * Checks whether a value is exactly `null`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is `null`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnullvalue
 * @example isNull(null);                  // => true
 * @example isNull("x");                   // => false
 */
function isNull(value) {
  return value === null;
}

module.exports = isNull;
