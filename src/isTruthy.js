/**
 * Applies JavaScript boolean coercion.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isTruthy([]);                 // => true
 * @example isTruthy(new Boolean(false)); // => true
 * @example isTruthy(0n);                 // => false
 */
function isTruthy(value) {
    return value ? true : false;
}

module.exports = isTruthy;