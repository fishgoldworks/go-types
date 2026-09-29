'use strict';

const arrayFrom = Array.from;

/**
 * Creates a new shallow array from iterable or array-like input using Array.from.
 * Iterable input takes precedence over length. Strings are read as Unicode code points; sparse arrays become dense. Null and undefined throw TypeError. Values with neither an iterator nor a usable length produce an empty array. Native length coercion applies, unlike the stricter isArrayLike validator.
 *
 * Conversion reads properties and consumes finite iterables; infinite iterables do not finish and large inputs can exhaust memory. No clone of nested values, object-entry conversion or scalar wrapping is performed.
 * @param {*} value Value to convert.
 * @returns {Array}
 * @example toArray(new Set([1, 2]));     // => [1,2]
 * @example toArray('A😀B');              // => ["A","😀","B"]
 * @example toArray({0: 'x', length: 1}); // => ["x"]
 * @example toArray(42);                  // => []
 */
function toArray(value) {
    return arrayFrom(value);
}

module.exports = toArray;
