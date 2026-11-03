'use strict';
const collectionInput = require('../util/collectionInput');

const NativeSet = typeof Set === 'function' ? Set : undefined;

/**
 * Converts a synchronous iterable, plain object or supported array-like input to a new shallow
 * Set.
 *
 * Copies iterable values, values from own enumerable string and symbol properties, or supported
 * array-like indices. Lengths must be numeric safe integers at least zero. Nullish input creates
 * an empty Set; unsupported inputs throw. Requires native `Set`, independently of `Array.from`;
 * missing support throws before inspecting the input.
 *
 * @param {*} [value] The value to convert.
 * @returns {Set} A new Set of iterable items, plain object property values or indexed array-like
 * values, or an empty Set for omitted or nullish input.
 * @throws {*} TypeError for unsupported input, malformed iterators or invalid array-like lengths.
 * Getter, proxy and iterator errors propagate. Missing native Set throws before conversion; object
 * copying requires symbol-enumeration support.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tosetvalue
 * @example toArray(toSet([3, 1, 3]));             // => [3,1]
 * @example toArray(toSet('A😀A'));                // => ["A","😀"]
 * @example toArray(toSet({a: 1, b: 2, c: 1}));    // => [1,2]
 * @example toArray(toSet({0: 'x', length: 1}));   // => ["x",1]
 * @example toSet().size;                          // => 0
 * @example toSet(null).size;                      // => 0
 */
function toSet(value) {
  if (!NativeSet) throw new TypeError('Native Set conversion is unavailable in this runtime.');
  return new NativeSet(value === null || value === undefined ? value : collectionInput(value, false));
}

module.exports = toSet;
