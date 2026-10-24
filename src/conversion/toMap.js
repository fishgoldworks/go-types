'use strict';

const NativeMap = typeof Map === 'function' ? Map : undefined;
const mapInput = require('../util/mapInput');

/**
 * Converts a plain record or synchronous iterable of strict key/value pairs to a new shallow Map.
 *
 * Plain records supply own enumerable string and symbol entries. Iterable pairs must be exact
 * two-element arrays with both own indices present. Duplicate keys keep their first position and
 * take the last value. Nullish input creates an empty Map. Requires native `Map`; missing support
 * throws before inspecting the input.
 *
 * @param {*} [value] The value to convert.
 * @returns {Map} A new Map containing own enumerable string and symbol record entries or strict
 * iterable pairs, or an empty Map for omitted or nullish input.
 * @throws {*} TypeError for unsupported input, malformed iterators or entry pairs that are not
 * exact two-element arrays with both own indices. Getter, proxy and iterator errors propagate.
 * Entry validation errors close the outer iterator. Missing native Map throws before conversion;
 * record copying requires symbol-enumeration support.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tomapvalue
 * @example Array.from(toMap({a: 1, b: 2}));                                               // => [["a",1],["b",2]]
 * @example Array.from(toMap([['a', 1], ['b', 2], ['a', 3]]));                             // => [["a",3],["b",2]]
 * @example (() => { const key = Symbol('key'); return toMap({[key]: 2}).get(key); })();   // => 2
 * @example toMap([[undefined, undefined]]).has(undefined);                                // => true
 * @example toMap().size;                                                                  // => 0
 * @example toMap(null).size;                                                              // => 0
 */
function toMap(value) {
  if (!NativeMap) throw new TypeError('Native Map conversion is unavailable in this runtime.');
  return new NativeMap(value === null || value === undefined ? value : mapInput(value));
}

module.exports = toMap;
