'use strict';

const toBigInt = require('./toBigInt');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toBigInt only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toBigInt contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {bigint|*}
 * @example toBigIntIf('42', true) === 42n; // => true
 * @example toBigIntIf('42', false);        // => "42"
 */
function toBigIntIf(value, condition) {
    return shouldConvert(value, condition) ? toBigInt(value) : value;
}

module.exports = toBigIntIf;
