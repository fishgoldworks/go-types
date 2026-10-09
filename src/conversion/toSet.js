'use strict';

const NativeSet = typeof Set === 'function' ? Set : undefined;

/**
 * Converts an iterable of values to a new shallow Set.
 *
 * Consumes synchronous values and removes duplicates without coercion. Strings yield Unicode code
 * points. Nullish input creates an empty Set; non-iterable scalars and array-like objects throw.
 * Requires native `Set`; missing support does not prevent loading. Requested conversion throws
 * `TypeError` before inspecting the input when it is unavailable.
 *
 * @param {*} [value] The value to convert.
 * @returns {Set} A new Set of the input values in first-insertion order, or an empty Set for
 * omitted or nullish input.
 * @throws {*} TypeError for non-nullish non-iterable input or malformed iterators. Property-access
 * and iterator errors propagate according to native Set construction. Unavailable native `Set`
 * support throws `TypeError` before conversion.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosetvalue
 * @example Array.from(toSet([3, 1, 3]));  // => [3,1]
 * @example Array.from(toSet('A😀A'));     // => ["A","😀"]
 * @example toSet().size;                  // => 0
 * @example toSet(null).size;              // => 0
 */
function toSet(value) {
  if (!NativeSet) throw new TypeError('Native Set conversion is unavailable in this runtime.');
  return new NativeSet(value);
}

module.exports = toSet;
