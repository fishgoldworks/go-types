var isObject = require('./isObject');

/**
 * Checks whether a value is a primitive rather than an object or function.
 *
 * Includes `null` and `undefined`; rejects wrappers and functions.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive, including `null` or `undefined`;
 * otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isprimitivevalue
 * @example isPrimitive(null);             // => true
 * @example isPrimitive(1n);               // => true
 * @example isPrimitive(new Number(1));    // => false
 */
function isPrimitive(value) {
  // Share the object/primitive boundary, including foreign and null-prototype objects.
  return !isObject(value);
}

module.exports = isPrimitive;
