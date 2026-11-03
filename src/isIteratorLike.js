const isCallable = require('./util/isCallable');
const isObject = require('./isObject');
/**
 * Checks whether a value is an object or function with a callable `next` method.
 *
 * Does not invoke `next` or validate iterator results. Property getters and proxy traps may run.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a non-null object or function with a callable `next`
 * method; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isiteratorlikevalue
 * @example isIteratorLike({next(){}});    // => true
 * @example isIteratorLike([]);            // => false
 * @example isIteratorLike({next:1});      // => false
 */
function isIteratorLike(value) {
  return isObject(value) && isCallable(value.next);
}
module.exports = isIteratorLike;
