'use strict';

const unbox = require('./unbox');
const shouldConvert = require('../util/shouldConvert');

/**
 * Extracts the primitive value from a wrapper object when the condition evaluates to `true` and
 * native unboxing is available. Otherwise, returns the original input unchanged.
 *
 * Calls a predicate once. Omitted or `undefined` conditions skip conversion. Conditions and
 * predicate results must be primitive booleans.
 *
 * Requested conversion uses `unbox`. Uses captured native `valueOf` intrinsics without calling
 * custom conversion hooks. Missing `Symbol` or `BigInt` unboxing support leaves those wrappers
 * unchanged.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {*|*} The `unbox` result when requested; otherwise the exact original input.
 * @throws {*} Invalid conditions and non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate; requested conversion follows `unbox` error behaviour.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#unboxifvalue-condition
 * @example unboxIf(3, false);             // => 3
 * @example unboxIf(3) === 3;              // => true
 */
function unboxIf(value, condition) {
  return shouldConvert(value, condition) ? unbox(value) : value;
}

module.exports = unboxIf;
