// Share a single integer-length contract with the array-like consumers.
var getArrayLikeLength = require('./util/getArrayLikeLength');

/**
 * Checks whether a non-function value has a valid numeric length.
 *
 * Reads `length` once. Missing indices are allowed; boxed, negative, fractional or non-finite
 * lengths are rejected.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is not a function and has a numeric integer length from
 * `0` through `Number.MAX_SAFE_INTEGER`; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isarraylikevalue
 * @example isArrayLike("");               // => true
 * @example isArrayLike({length:0});       // => true
 * @example isArrayLike({length:0.5});     // => false
 * @example isArrayLike(() => {});         // => false
 */
function isArrayLike(value) {
  return getArrayLikeLength(value) !== undefined;
}

module.exports = isArrayLike;
