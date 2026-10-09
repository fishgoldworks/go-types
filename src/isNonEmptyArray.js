const isArray = require('./isArray');
const isValidArrayLength = require('./util/isValidArrayLength');
/**
 * Determines whether a value is an array with a valid length greater than zero.
 *
 * Sparse arrays count as non-empty when their length is positive. Does not validate elements.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is an array with a valid length greater than zero;
 * otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate. Native
 * `Array.isArray` also throws `TypeError` for a revoked proxy.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnonemptyarrayvalue
 * @example isNonEmptyArray([null]);         // => true
 * @example isNonEmptyArray(new Array(1));   // => true
 * @example isNonEmptyArray([]);             // => false
 */
function isNonEmptyArray(value) {
  if (!isArray(value)) return false;
  const length = value.length;
  return isValidArrayLength(length) && length > 0;
}
module.exports = isNonEmptyArray;
