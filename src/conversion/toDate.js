'use strict';

const NativeDate = Date;
const isDate = require('../isDate');

/**
 * Converts a value to a `Date`, returning existing `Date` objects unchanged. The result can be
 * invalid.
 *
 * Preserves existing Date objects. May return an invalid Date; omitted input does not mean the
 * current time. Symbols, bigints and conversion hooks can throw.
 *
 * @param {*} [value] The value to convert.
 * @returns {Date} The original `Date`, or a new `Date` constructed from the input; it may be
 * invalid.
 * @throws {*} Symbols, bigints and failed object coercion can throw. Invalid date text can instead
 * produce an invalid `Date`; check with `isValidDate`.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#todatevalue
 * @example toDate(0).toISOString();                                                 // => "1970-01-01T00:00:00.000Z"
 * @example toDate('2024-01-01T00:00:00.000Z').getTime();                            // => 1704067200000
 * @example isInvalidDate(toDate('not a date'));                                     // => true
 * @example (() => { const date = new Date(0); return toDate(date) === date; })();   // => true
 */
function toDate(value) {
  // Preserve genuine Date identity, including invalid Dates and foreign instances.
  return isDate(value) ? value : new NativeDate(value);
}

module.exports = toDate;
