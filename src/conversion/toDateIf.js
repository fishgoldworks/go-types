'use strict';

const toDate = require('./toDate');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toDate only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toDate contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {Date|*}
 * @example toDateIf(0, true).getTime(); // => 0
 * @example toDateIf(0, false);          // => 0
 */
function toDateIf(value, condition) {
    return shouldConvert(value, condition) ? toDate(value) : value;
}

module.exports = toDateIf;
