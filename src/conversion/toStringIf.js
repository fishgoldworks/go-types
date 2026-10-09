'use strict';

const toString = require('./toString');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to a primitive string when the condition evaluates to `true`. Otherwise,
 * returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toString`. May invoke conversion hooks and throw, including for boxed
 * symbols. Does not perform JSON serialisation.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {string|*} The converted primitive string when conversion is requested; otherwise the
 * original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toString` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tostringifvalue-condition
 * @example toStringIf(42, true);          // => "42"
 * @example toStringIf(42, false);         // => 42
 */
function toStringIf(value, condition) {
  return shouldConvert(value, condition) ? toString(value) : value;
}

module.exports = toStringIf;
