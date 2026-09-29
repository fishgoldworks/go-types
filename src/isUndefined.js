/**
 * Checks for undefined.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isUndefined(undefined); // => true
 * @example isUndefined("x");       // => false
 */
function isUndefined(value) {
    return value === undefined;
}

module.exports = isUndefined;