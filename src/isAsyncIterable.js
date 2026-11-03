const isCallable = require('./util/isCallable');
/**
 * Checks whether a value exposes an asynchronous iterator method.
 *
 * Does not invoke the method. Returns `false` without inspecting the value when
 * `Symbol.asyncIterator` is unavailable. Returns `false` without inspecting the input when
 * `Symbol` itself or `Symbol.asyncIterator` is unavailable.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the async-iterator symbol is available and the value has a callable
 * `Symbol.asyncIterator` method; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isasynciterablevalue
 * @example isAsyncIterable((async function*(){})());  // => true
 * @example isAsyncIterable([]);                       // => false
 */
function isAsyncIterable(value) {
  return (
    typeof Symbol === 'function' &&
    typeof Symbol.asyncIterator === 'symbol' &&
    value !== null &&
    value !== undefined &&
    isCallable(value[Symbol.asyncIterator])
  );
}
module.exports = isAsyncIterable;
