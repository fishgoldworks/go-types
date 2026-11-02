'use strict';

const toSymbol = require('./toSymbol');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to a primitive symbol when the condition evaluates to `true`. Otherwise,
 * returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toSymbol`. Preserves primitive symbol identity and unboxes wrappers.
 * Other inputs create a new symbol and may invoke description-conversion hooks. Requires native
 * `Symbol`; missing support does not prevent loading. Requested conversion throws `TypeError`
 * before inspecting the input when it is unavailable.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {symbol|*} The original or unboxed symbol, or a new symbol from the description, when
 * conversion is requested; otherwise the original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toSymbol` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosymbolifvalue-condition
 * @example typeof toSymbolIf('key', true);  // => "symbol"
 * @example toSymbolIf('key', false);        // => "key"
 */
function toSymbolIf(value, condition) {
  return shouldConvert(value, condition) ? toSymbol(value) : value;
}

module.exports = toSymbolIf;
