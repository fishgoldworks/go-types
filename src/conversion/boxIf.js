'use strict';

const box = require('./box');
const shouldConvert = require('../util/shouldConvert');

/**
 * Wraps non-nullish primitives in their native wrapper objects when the condition evaluates to
 * `true`. Otherwise, returns the original input unchanged.
 *
 * Calls a predicate once. Omitted or `undefined` conditions skip conversion. Conditions and
 * predicate results must be primitive booleans.
 *
 * Requested conversion uses `box`. Does not call conversion hooks. Existing objects and functions,
 * `null` and `undefined` are returned unchanged.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {Object|null|undefined|*} The `box` result when requested; otherwise the exact original
 * input.
 * @throws {*} Invalid conditions and non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate; requested conversion follows `box` error behaviour.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#boxifvalue-condition
 * @example boxIf(3, false);               // => 3
 * @example boxIf(3) === 3;                // => true
 */
function boxIf(value, condition) {
  return shouldConvert(value, condition) ? box(value) : value;
}

module.exports = boxIf;
