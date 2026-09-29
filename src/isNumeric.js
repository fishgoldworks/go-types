var nonSpace = /\S/;
var stringValueOf = String.prototype.valueOf;
var isFinite = require("./isFinite");
var isString = require("./isString");
var isBigInt = require("./isBigInt");

/**
 * Accepts finite primitive/boxed numbers, primitive bigint values and non-whitespace strings that convert to finite numbers.
 * Uses standard numeric conversion syntax, not a decimal-only grammar. It rejects NaN, Infinity, empty/whitespace-only strings, boolean values, boxed BigInt values and arbitrary coercible objects.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isNumeric(" 1e3 ");  // => true
 * @example isNumeric("0x10");   // => true
 * @example isNumeric(1n);       // => true
 * @example isNumeric("   ");    // => false
 * @example isNumeric(Infinity); // => false
 */
function isNumeric(value) {
    if (isFinite(value) || isBigInt(value)) {
        return true;
    }
    if (!isString(value)) {
        return false;
    }
    // Read the real string payload instead of invoking user-defined coercion.
    // Whitespace alone does not represent a number.
    var text = stringValueOf.call(value);
    return nonSpace.test(text) && isFinite(text * 1);
}

module.exports = isNumeric;
