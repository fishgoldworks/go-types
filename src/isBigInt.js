/**
 * Determines whether a value is a primitive bigint.
 *
 * Boxed bigints return `false`; numeric strings are not converted.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive bigint; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isbigintvalue
 * @example isBigInt(1n);                  // => true
 * @example isBigInt("x");                 // => false
 */
function isBigInt(value) {
  return typeof value === 'bigint';
}

module.exports = isBigInt;
