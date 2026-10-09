/**
 * Determines whether JavaScript treats a value as `false` in a condition.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is falsy under JavaScript boolean coercion; otherwise
 * `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfalsyvalue
 * @example isFalsy(NaN);                  // => true
 * @example isFalsy("");                   // => true
 * @example isFalsy([]);                   // => false
 */
function isFalsy(value) {
  return value ? false : true;
}

module.exports = isFalsy;
