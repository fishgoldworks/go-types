/**
 * Checks for neither null nor undefined; useful with Array.filter.
 * The generic declaration narrows to NonNullable<T> without discarding 0, false, empty strings, NaN or 0n.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isNonNullish(0);     // => true
 * @example isNonNullish(false); // => true
 * @example isNonNullish(null);  // => false
 */
function isNonNullish(value) {
    return value !== null && value !== undefined;
}
module.exports = isNonNullish;
