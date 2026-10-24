/**
 * Checks whether a value is an instance of the local DOM `Element` constructor.
 *
 * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
 * DOM objects.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if a local `Element` constructor is available and the value passes its
 * instance check; otherwise `false`.
 * @throws {*} Native `instanceof` errors propagate, including errors from proxy prototype access
 * or a custom `Symbol.hasInstance` method.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#iselementvalue
 * @example isElement(document.createElement("div"));  // => true
 * @example isElement({nodeType:1});                   // => false
 */
function isElement(value) {
  return typeof Element === 'function' && value instanceof Element;
}

module.exports = isElement;
