const isCallable = require('./util/isCallable');
var isObject = require('./isObject');

/**
 * Determines whether a value is an object or function with a callable `then` method.
 *
 * Does not invoke `then` or prove Promise behaviour. Getters and proxy traps may run.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a non-null object or function with a callable `then`
 * method; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isthenablevalue
 * @example isThenable({then(){}});        // => true
 * @example isThenable({then:1});          // => false
 */
function isThenable(value) {
  // Include foreign and null-prototype objects without invoking then.
  return isObject(value) && isCallable(value.then);
}

module.exports = isThenable;
