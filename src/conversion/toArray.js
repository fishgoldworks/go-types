'use strict';
const collectionInput = require('../util/collectionInput');

const arrayFrom = typeof Array.from === 'function' ? Array.from : undefined;

/**
 * Converts a synchronous iterable, plain object or supported array-like input to a new shallow
 * array.
 *
 * Consumes iterable input, copies values from own enumerable string and symbol properties, or
 * reads supported array-like indices. Array-like lengths must already be numeric safe integers at
 * least zero. Nullish and unsupported inputs throw. Requires native `Array.from`; missing support
 * throws `TypeError` before inspecting the input.
 *
 * @param {*} value The value to convert.
 * @returns {Array} A new shallow array containing iterable items, plain object property values or
 * indexed array-like values.
 * @throws {*} TypeError for nullish or unsupported input, malformed iterators or invalid
 * array-like lengths. Oversized array results can throw RangeError. Getter, proxy and iterator
 * errors propagate. Missing native Array.from throws before conversion; object copying requires
 * symbol-enumeration support.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toarrayvalue
 * @example toArray(new Set([1, 2]));                                                    // => [1,2]
 * @example toArray('A😀B');                                                             // => ["A","😀","B"]
 * @example toArray({0: 'x', length: 1});                                                // => ["x",1]
 * @example toArray({a: 1, b: 2});                                                       // => [1,2]
 * @example (() => { const key = Symbol('key'); return toArray({a: 1, [key]: 2}); })();  // => [1,2]
 */
function toArray(value) {
  if (!arrayFrom) throw new TypeError('Native array conversion is unavailable in this runtime.');
  return arrayFrom(collectionInput(value, false, 4294967295));
}

module.exports = toArray;
