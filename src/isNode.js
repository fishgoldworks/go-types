/**
 * Determines whether a value is an instance of the local DOM `Node` constructor.
 *
 * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
 * DOM objects.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if a local `Node` constructor is available and the value passes its
 * instance check; otherwise `false`.
 * @throws {*} Native `instanceof` errors propagate, including errors from proxy prototype access
 * or a custom `Symbol.hasInstance` method.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnodevalue
 * @example isNode(document);              // => true
 * @example isNode({nodeType:1});          // => false
 */
function isNode(value) {
  return typeof Node === 'function' && value instanceof Node;
}

module.exports = isNode;
