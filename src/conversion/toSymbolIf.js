'use strict';

const toSymbol = require('./toSymbol');
const shouldConvert = require('../util/shouldConvert');

/**
 * Applies toSymbol only when a boolean condition or synchronous predicate returns true.
 * Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toSymbol contract.
 * @param {*} value Value to convert.
 * @param {*} condition Boolean or synchronous boolean predicate.
 * @returns {symbol|*}
 * @example typeof toSymbolIf('key', true); // => "symbol"
 * @example toSymbolIf('key', false);       // => "key"
 */
function toSymbolIf(value, condition) {
    return shouldConvert(value, condition) ? toSymbol(value) : value;
}

module.exports = toSymbolIf;
