/**
 * Checks for null or undefined.
 * Uses strict null/undefined comparisons. Browser document.all is an object, not a nullish value, despite its historical loose-equality behaviour.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isNullish(null);      // => true
 * @example isNullish(undefined); // => true
 * @example isNullish(0);         // => false
 */
function isNullish(value) {
    return (value === null || value === undefined);
}

module.exports = isNullish;