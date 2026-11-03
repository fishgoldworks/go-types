const isCallable = require('./util/isCallable');
var isObject = require('./isObject');

/**
 * Checks whether a value is an object or function with a callable `then` method.
 *
 * Reads `then` without invoking it or checking `catch` or `finally`. Does not verify promise
 * behaviour; getters and proxy traps may run.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a non-null object or function with a callable `then`
 * method; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ispromiselikevalue
 * @example isPromiseLike(Promise.resolve(1));   // => true
 * @example isPromiseLike({then(){}});           // => true
 * @example isPromiseLike({then:1});             // => false
 */
function isPromiseLike(value) {
  return isObject(value) && isCallable(value.then);
}

module.exports = isPromiseLike;
