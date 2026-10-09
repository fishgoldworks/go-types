const isCallable = require('./util/isCallable');
/**
 * Determines whether a value exposes a synchronous iterator method.
 *
 * Reads `Symbol.iterator` without calling it. Getters and proxy traps may run; method presence
 * does not guarantee a valid iterator.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value has a callable `Symbol.iterator` method; otherwise
 * `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isiterablevalue
 * @example isIterable([]);                // => true
 * @example isIterable("");                // => true
 * @example isIterable({next(){}});        // => false
 */
function isIterable(value) {
  // Arrays/strings can explicitly disable iteration. Inspect the actual
  // callable method without invoking it; method presence does not validate its output.
  return (
    value !== null &&
    value !== undefined &&
    typeof Symbol === 'function' &&
    Symbol.iterator !== undefined &&
    isCallable(value[Symbol.iterator])
  );
}

module.exports = isIterable;
