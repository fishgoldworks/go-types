const isCallable = require('./util/isCallable');
var isObject = require('./isObject');

/**
 * Determines whether a value is an object or function with callable `then` and `catch` methods.
 *
 * Requires both `then` and `catch`, unlike TypeScript `PromiseLike`. Does not invoke them; getters
 * or proxy traps may run.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a non-null object or function with callable `then` and
 * `catch` methods; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ispromiselikevalue
 * @example isPromiseLike({then(){},catch(){}});   // => true
 * @example isPromiseLike({then(){}});             // => false
 */
function isPromiseLike(value) {
  // Use the shared object boundary; retain the documented then AND catch requirement.
  return isObject(value) && isCallable(value.then) && isCallable(value.catch);
}

module.exports = isPromiseLike;
