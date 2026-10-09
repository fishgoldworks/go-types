'use strict';

const arrayFrom = typeof Array.from === 'function' ? Array.from : undefined;

/**
 * Converts iterable or array-like input to a new shallow array.
 *
 * Consumes iterable input and may invoke getters or iterator methods. Infinite iterables do not
 * finish; nullish input throws. Requires native `Array.from`; missing support does not prevent
 * loading. Requested conversion throws `TypeError` before inspecting the input when it is
 * unavailable.
 *
 * @param {*} value The value to convert.
 * @returns {Array} A new shallow array containing the input items.
 * @throws {*} `TypeError` for `null`, `undefined`, malformed iterators or incompatible length
 * conversion. Oversized lengths can throw `RangeError`. Property-access and iteration errors
 * propagate. Unavailable native `Array.from` support throws `TypeError` before conversion.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toarrayvalue
 * @example toArray(new Set([1, 2]));      // => [1,2]
 * @example toArray('A😀B');               // => ["A","😀","B"]
 * @example toArray({0: 'x', length: 1});  // => ["x"]
 * @example toArray(42);                   // => []
 */
function toArray(value) {
  if (!arrayFrom) throw new TypeError('Native array conversion is unavailable in this runtime.');
  return arrayFrom(value);
}

module.exports = toArray;
