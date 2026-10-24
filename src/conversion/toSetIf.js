'use strict';

const toSet = require('./toSet');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts supported iterable, record or array-like input to a new shallow Set when the condition
 * evaluates to `true`. Otherwise, returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toSet`. Copies iterable values, own enumerable string and symbol
 * record values, or supported array-like indices. Lengths must be numeric safe integers at least
 * zero. Nullish input creates an empty Set; unsupported inputs throw. Requires native `Set`,
 * independently of `Array.from`; missing support throws before inspecting the input.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {Set|*} A new Set when conversion is requested; otherwise the original input,
 * unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toSet` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosetifvalue-condition
 * @example Array.from(toSetIf('aba', true));  // => ["a","b"]
 * @example toSetIf('aba', false);             // => "aba"
 */
function toSetIf(value, condition) {
  return shouldConvert(value, condition) ? toSet(value) : value;
}

module.exports = toSetIf;
