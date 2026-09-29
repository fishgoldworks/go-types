const getNumberValue = require('./util/getNumberValue');
const floor = Math.floor;

/**
 * Checks for a finite non-integer number.
 * Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isFloat(0.5);             // => true
 * @example isFloat(new Number(0.5)); // => true
 * @example isFloat(1);               // => false
 */
function isFloat(value) {
    const number = typeof value === 'number' ? value : getNumberValue(value);
    // NaN is rejected explicitly; infinities equal their own floors.
    return number !== undefined && number === number && floor(number) !== number;
}
module.exports = isFloat;
