'use strict';

const toDate = require('./toDate');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the
 * original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toDate`. Preserves existing Date objects. May return an invalid Date;
 * omitted input does not mean the current time. Symbols, bigints and conversion hooks can throw.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {Date|*} The original `Date` or a new `Date`, possibly invalid, when conversion is
 * requested; otherwise the original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toDate` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#todateifvalue-condition
 * @example toDateIf(0, true).getTime();   // => 0
 * @example toDateIf(0, false);            // => 0
 */
function toDateIf(value, condition) {
  return shouldConvert(value, condition) ? toDate(value) : value;
}

module.exports = toDateIf;
