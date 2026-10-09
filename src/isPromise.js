/**
 * Determines whether a value passes the local native `Promise` instance check.
 *
 * Uses local `instanceof` semantics; it is not proof of native Promise identity. Does not call
 * `then`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value passes the local native `Promise` instance check;
 * otherwise `false`.
 * @throws {*} Native `instanceof` errors propagate, including errors from proxy prototype access
 * or a custom `Symbol.hasInstance` method.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ispromisevalue
 * @example isPromise(Promise.resolve(1));     // => true
 * @example isPromise({then(){},catch(){}});   // => false
 */
function isPromise(value) {
  return typeof Promise === 'function' && value instanceof Promise;
}

module.exports = isPromise;
