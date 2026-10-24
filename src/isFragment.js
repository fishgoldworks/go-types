/**
 * Checks whether a value is an instance of the local DOM `DocumentFragment` constructor.
 *
 * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
 * DOM objects.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if a local `DocumentFragment` constructor is available and the value
 * passes its instance check; otherwise `false`.
 * @throws {*} Native `instanceof` errors propagate, including errors from proxy prototype access
 * or a custom `Symbol.hasInstance` method.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfragmentvalue
 * @example isFragment(document.createDocumentFragment());   // => true
 * @example isFragment({nodeType:1});                        // => false
 */
function isFragment(value) {
  return typeof DocumentFragment === 'function' && value instanceof DocumentFragment;
}

module.exports = isFragment;
