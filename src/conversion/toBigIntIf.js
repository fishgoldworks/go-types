'use strict';

const toBigInt = require('./toBigInt');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise,
 * returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`. Only a requested conversion
 * requires native BigInt.
 *
 * Requested conversion uses `toBigInt`. Requires native BigInt. Fractional numbers and invalid
 * integer text throw; input conversion hooks may run.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {bigint|*} The converted primitive bigint when conversion is requested; otherwise the
 * original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toBigInt` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobigintifvalue-condition
 * @example toBigIntIf('42', true) === 42n;  // => true
 * @example toBigIntIf('42', false);         // => "42"
 */
function toBigIntIf(value, condition) {
  return shouldConvert(value, condition) ? toBigInt(value) : value;
}

module.exports = toBigIntIf;
