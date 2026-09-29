var isObject = require("./isObject");

/**
 * Checks for null, undefined, boolean, number, bigint, string or symbol primitives.
 * The complement of isObject, including browser document.all as non-primitive. This differs from blindly treating every typeof-undefined value as the undefined primitive.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isPrimitive(null);          // => true
 * @example isPrimitive(1n);            // => true
 * @example isPrimitive(new Number(1)); // => false
 */
function isPrimitive(value) {
    // Share the object/primitive boundary, including foreign and null-prototype objects.
    return !isObject(value);
}

module.exports = isPrimitive;
