'use strict';

const toBoolean = require('./toBoolean');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toBoolean only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toBoolean contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {boolean|*}
 * @example toBooleanIf(0, true);        // => false
 * @example toBooleanIf('false', false); // => "false"
 */
function toBooleanIf(value, condition) {
    return shouldConvert(value, condition) ? toBoolean(value) : value;
}

module.exports = toBooleanIf;
