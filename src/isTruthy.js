/**
 * Checks whether JavaScript treats a value as `true` in a condition.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is truthy under JavaScript boolean coercion; otherwise
 * `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istruthyvalue
 * @example isTruthy([]);                  // => true
 * @example isTruthy(new Boolean(false));  // => true
 * @example isTruthy(0n);                  // => false
 */
function isTruthy(value) {
  return value ? true : false;
}

module.exports = isTruthy;
