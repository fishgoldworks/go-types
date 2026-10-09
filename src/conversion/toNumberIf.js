'use strict';

const toNumber = require('./toNumber');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to a primitive number when the condition evaluates to `true`. Otherwise,
 * returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toNumber`. May return `NaN` or infinity, lose bigint precision, or
 * invoke object conversion hooks. Symbols throw.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {number|*} The converted primitive number, possibly `NaN` or infinite, when conversion
 * is requested; otherwise the original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toNumber` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tonumberifvalue-condition
 * @example toNumberIf('12', value => typeof value === 'string');  // => 12
 * @example toNumberIf('12', false);                               // => "12"
 */
function toNumberIf(value, condition) {
  return shouldConvert(value, condition) ? toNumber(value) : value;
}

module.exports = toNumberIf;
