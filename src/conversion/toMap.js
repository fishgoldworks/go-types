'use strict';

const NativeMap = typeof Map === 'function' ? Map : undefined;

/**
 * Converts an iterable of key/value entries to a new shallow Map.
 *
 * Consumes synchronous entries; duplicate keys keep their first position and take the last value.
 * Nullish input creates an empty Map. Non-iterable objects are not converted into entries.
 * Requires native `Map`; missing support does not prevent loading. Requested conversion throws
 * `TypeError` before inspecting the input when it is unavailable.
 *
 * @param {*} [value] The value to convert.
 * @returns {Map} A new Map containing the input entries, or an empty Map for omitted or nullish
 * input.
 * @throws {*} TypeError for non-nullish non-iterable input, malformed iterators or primitive
 * entries. Iterator and entry-property errors propagate according to native Map construction,
 * including iterator closing when an entry cannot be processed. Unavailable native `Map` support
 * throws `TypeError` before conversion.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tomapvalue
 * @example Array.from(toMap([['a', 1], ['b', 2], ['a', 3]]));   // => [["a",3],["b",2]]
 * @example toMap().size;                                        // => 0
 * @example toMap(null).size;                                    // => 0
 */
function toMap(value) {
  if (!NativeMap) throw new TypeError('Native Map conversion is unavailable in this runtime.');
  return new NativeMap(value);
}

module.exports = toMap;
