const getNumberValue = require('./util/getNumberValue');


/**
 * Checks for NaN.
 * Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isNaN(NaN);             // => true
 * @example isNaN(new Number(NaN)); // => true
 * @example isNaN("NaN");           // => false
 */
function isNaN(value) {
    const number = typeof value === 'number' ? value : getNumberValue(value);
    return number !== number;
}
module.exports = isNaN;
