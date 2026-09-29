const getNumberValue = require('./util/getNumberValue');


/**
 * Checks for positive or negative infinity.
 * Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isInfinite(-Infinity);             // => true
 * @example isInfinite(new Number(-Infinity)); // => true
 * @example isInfinite(NaN);                   // => false
 */
function isInfinite(value) {
    const number = typeof value === 'number' ? value : getNumberValue(value);
    return number === Infinity || number === -Infinity;
}
module.exports = isInfinite;
