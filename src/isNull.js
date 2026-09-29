/**
 * Checks for null.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isNull(null); // => true
 * @example isNull("x");  // => false
 */
function isNull(value) {
    return value === null;
}

module.exports = isNull;
