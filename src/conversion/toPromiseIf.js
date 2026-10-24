'use strict';

const toPromise = require('./toPromise');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to a native `Promise` when the condition evaluates to `true`. Otherwise,
 * returns the original input unchanged.
 *
 * Calls a predicate once. Omitted or `undefined` conditions skip conversion. Conditions and
 * predicate results must be primitive booleans.
 *
 * Requested conversion uses `toPromise`. Preserves ordinary local `Promise` identity, assimilates
 * thenables and wraps other values. Requires native `Promise.resolve`; functions are values, not
 * callbacks.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {Promise|*} The `toPromise` result when requested; otherwise the exact original input.
 * @throws {*} Invalid conditions and non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate; requested conversion follows `toPromise` error behaviour.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#topromiseifvalue-condition
 * @example toPromiseIf(3, false);         // => 3
 * @example toPromiseIf(3) === 3;          // => true
 */
function toPromiseIf(value, condition) {
  return shouldConvert(value, condition) ? toPromise(value) : value;
}

module.exports = toPromiseIf;
