'use strict';
const isArray = require('./isArray');

/**
 * Returns an existing array unchanged or wraps a supplied value as one item. Without arguments,
 * returns an empty array.
 *
 * Without arguments, creates a fresh empty array; explicit `null` and `undefined` remain items.
 * Preserves array identity and sparse slots without iteration or coercion. TypeScript retains
 * element and readonly tuple types; broad `object` and `unknown` inputs remain conservative. A
 * preserved array is not a copy.
 *
 * @param {*} [value] The value to normalise. Omit to create an empty array; explicit undefined or
 * null remains one item.
 * @returns {Array} A new empty array when no value is supplied; otherwise the original array or a
 * new array containing the supplied value.
 * @throws {*} Native `Array.isArray` errors propagate, including `TypeError` for revoked proxies.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ensurearrayvalue
 * @example ensureArray();                                                               // => []
 * @example ensureArray(1);                                                              // => [1]
 * @example ensureArray("hello");                                                        // => ["hello"]
 * @example ensureArray({id: 1});                                                        // => [{"id":1}]
 * @example ensureArray(null);                                                           // => [null]
 * @example ensureArray(undefined)[0] === undefined;                                     // => true
 * @example (()=>{const items=[1,2];return ensureArray(items)===items;})();              // => true
 * @example (()=>{const value=new Set([1,2]);return ensureArray(value)[0]===value;})();  // => true
 */
function ensureArray(value) {
  if (arguments.length === 0) return [];
  return isArray(value) ? value : [value];
}

module.exports = ensureArray;
