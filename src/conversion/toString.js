'use strict';

const nativeString = String;

/**
 * Converts a value to a primitive string using String.
 * Null becomes 'null' and undefined becomes 'undefined', not an empty string. Primitive symbols use their descriptive string. Arrays use native string conversion; objects may invoke coercion hooks. This is not JSON serialisation. Native exceptions propagate, including conversion of boxed symbols and objects that cannot produce a primitive.
 * @param {*} value Value to convert.
 * @returns {string}
 * @example toString(42);            // => "42"
 * @example toString(null);          // => "null"
 * @example toString(Symbol('key')); // => "Symbol(key)"
 * @example toString([1, 2]);        // => "1,2"
 */
function toString(value) {
    return nativeString(value);
}

module.exports = toString;
