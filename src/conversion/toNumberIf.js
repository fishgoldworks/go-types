'use strict';

const toNumber = require('./toNumber');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toNumber only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toNumber contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {number|*}
 * @example toNumberIf('12', value => typeof value === 'string'); // => 12
 * @example toNumberIf('12', false);                              // => "12"
 */
function toNumberIf(value, condition) {
    return shouldConvert(value, condition) ? toNumber(value) : value;
}

module.exports = toNumberIf;
