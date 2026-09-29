'use strict';

const toArray = require('./toArray');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toArray only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toArray contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {Array|*}
 * @example toArrayIf('ab', true);  // => ["a","b"]
 * @example toArrayIf('ab', false); // => "ab"
 */
function toArrayIf(value, condition) {
    return shouldConvert(value, condition) ? toArray(value) : value;
}

module.exports = toArrayIf;
