/**
 * Checks whether a value is exactly `undefined`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is `undefined`; otherwise `false`.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isundefinedvalue
 * @example isUndefined(undefined);        // => true
 * @example isUndefined("x");              // => false
 */
function isUndefined(value) {
  return value === undefined;
}

module.exports = isUndefined;
