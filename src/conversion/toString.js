'use strict';

const nativeString = String;

/**
 * Converts a value to a primitive string using JavaScript’s `String` conversion.
 *
 * May invoke conversion hooks and throw, including for boxed symbols. Does not perform JSON
 * serialisation.
 *
 * @param {*} [value] The value to convert.
 * @returns {string} The converted primitive string; nullish inputs become their literal text.
 * @throws {*} Native conversion errors propagate, including boxed symbols and objects that cannot
 * produce a primitive.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tostringvalue
 * @example toString(42);                  // => "42"
 * @example toString(null);                // => "null"
 * @example toString(Symbol('key'));       // => "Symbol(key)"
 * @example toString([1, 2]);              // => "1,2"
 */
function toString(value) {
  return nativeString(value);
}

module.exports = toString;
