/**
 * Checks for a primitive symbol.
 * Symbol and BigInt checks reject boxed values.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isSymbol(Symbol("x")); // => true
 * @example isSymbol("x");         // => false
 */
function isSymbol(value) {
    return typeof value === "symbol";
}

module.exports = isSymbol;