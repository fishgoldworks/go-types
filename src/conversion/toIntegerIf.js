'use strict';

const toInteger = require('./toInteger');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toInteger only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toInteger contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {number|*}
 * @example toIntegerIf('4.8', true);  // => 4
 * @example toIntegerIf('4.8', false); // => "4.8"
 */
function toIntegerIf(value, condition) {
    return shouldConvert(value, condition) ? toInteger(value) : value;
}

module.exports = toIntegerIf;
