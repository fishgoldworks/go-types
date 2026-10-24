var isArray = require('./isArray');

/**
 * Checks whether a value is an array of length two.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is an array of length `2`; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate. Native
 * `Array.isArray` also throws `TypeError` for a revoked proxy.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ispairvalue
 * @example isPair([1,2]);                 // => true
 * @example isPair(new Array(2));          // => true
 * @example isPair([1]);                   // => false
 */
function isPair(value) {
  return isArray(value) && value.length === 2;
}

module.exports = isPair;
