'use strict';

const toArray = require('./toArray');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts iterable or array-like input to a new shallow array when the condition evaluates to
 * `true`. Otherwise, returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toArray`. Consumes iterable input and may invoke getters or iterator
 * methods. Infinite iterables do not finish; nullish input throws. Requires native `Array.from`;
 * missing support does not prevent loading. Requested conversion throws `TypeError` before
 * inspecting the input when it is unavailable.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {Array|*} A new shallow array when conversion is requested; otherwise the original
 * input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toArray` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toarrayifvalue-condition
 * @example toArrayIf('ab', true);         // => ["a","b"]
 * @example toArrayIf('ab', false);        // => "ab"
 */
function toArrayIf(value, condition) {
  return shouldConvert(value, condition) ? toArray(value) : value;
}

module.exports = toArrayIf;
