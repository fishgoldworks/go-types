/**
 * Checks for a primitive bigint.
 * Symbol and BigInt checks reject boxed values.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isBigInt(1n);  // => true
 * @example isBigInt("x"); // => false
 */
function isBigInt(value) {
    return typeof value === "bigint";
}

module.exports = isBigInt;