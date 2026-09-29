'use strict';

const toString = require('./toString');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toString only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toString contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {string|*}
 * @example toStringIf(42, true);  // => "42"
 * @example toStringIf(42, false); // => 42
 */
function toStringIf(value, condition) {
    return shouldConvert(value, condition) ? toString(value) : value;
}

module.exports = toStringIf;
