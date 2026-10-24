'use strict';

const toRegExp = require('./toRegExp');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a native pattern and optional `flags` to a genuine `RegExp` when the condition
 * evaluates to `true`. Otherwise, returns the original input unchanged.
 *
 * Calls a predicate once. Omitted or `undefined` conditions skip conversion. Conditions and
 * predicate results must be primitive booleans.
 *
 * Requested conversion uses `toRegExp`. Uses native `RegExp` syntax and `flags`. May reuse a
 * genuine local `RegExp` without explicit `flags`; copied expressions start with `lastIndex` zero.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @param {*} [flags] Native RegExp flags. Omitted or `undefined` preserves a RegExp input’s flags;
 * explicit flags replace them.
 * @returns {RegExp|*} The `toRegExp` result when requested; otherwise the exact original input.
 * @throws {*} Invalid conditions and non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate; requested conversion follows `toRegExp` error behaviour.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toregexpifvalue-condition-flags
 * @example toRegExpIf(3, false);          // => 3
 * @example toRegExpIf(3) === 3;           // => true
 */
function toRegExpIf(value, condition, flags) {
  return shouldConvert(value, condition) ? toRegExp(value, flags) : value;
}

module.exports = toRegExpIf;
