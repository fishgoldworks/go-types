'use strict';

const toInteger = require('./toInteger');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to a number and truncates it towards zero when the condition evaluates to
 * `true`. Otherwise, returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toInteger`. Does not guarantee a finite or safe integer. Symbols and
 * failing conversion hooks can throw.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {number|*} The numeric conversion truncated towards zero, possibly `NaN` or infinite,
 * when conversion is requested; otherwise the original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toInteger` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tointegerifvalue-condition
 * @example toIntegerIf('4.8', true);      // => 4
 * @example toIntegerIf('4.8', false);     // => "4.8"
 */
function toIntegerIf(value, condition) {
  return shouldConvert(value, condition) ? toInteger(value) : value;
}

module.exports = toIntegerIf;
