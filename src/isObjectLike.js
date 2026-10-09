/**
 * Determines whether a value is a non-null object, excluding functions.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a non-null object other than a function; otherwise
 * `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isobjectlikevalue
 * @example isObjectLike([]);              // => true
 * @example isObjectLike(() => {});        // => false
 * @example isObjectLike(null);            // => false
 */
function isObjectLike(value) {
  const type = typeof value;
  return type === 'object' ? value !== null : type === 'undefined' && value !== undefined;
}
module.exports = isObjectLike;
