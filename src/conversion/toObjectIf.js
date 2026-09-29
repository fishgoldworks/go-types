'use strict';

const toObject = require('./toObject');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toObject only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toObject contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {object|*}
 * @example typeof toObjectIf(42, true); // => "object"
 * @example toObjectIf(42, false);       // => 42
 */
function toObjectIf(value, condition) {
    return shouldConvert(value, condition) ? toObject(value) : value;
}

module.exports = toObjectIf;
