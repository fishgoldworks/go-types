/**
 * Returns the complement of JavaScript boolean coercion.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isFalsy(NaN); // => true
 * @example isFalsy("");  // => true
 * @example isFalsy([]);  // => false
 */
function isFalsy(value) {
    return value ? false : true;
}

module.exports = isFalsy;