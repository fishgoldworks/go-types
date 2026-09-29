'use strict';

const NativeDate = Date;
const isDate = require('../isDate');

/**
 * Preserves genuine Date instances; otherwise constructs a Date from the input.
 * Genuine local, foreign, subclass and invalid Date instances are returned unchanged, not cloned. Other values use new Date(value): numbers are millisecond timestamps and strings use native date parsing. Invalid input can produce an invalid Date; symbols, bigint and coercion failures can throw. Omitted/undefined input produces an invalid Date rather than the current time.
 *
 * Prefer ISO date-time strings with an explicit timezone for portable results; validate with isValidDate when required. The TypeScript return type is Date, not the input subtype: structurally Date-compatible inputs can require construction of a new Date without extra input properties.
 * @param {*} value Value to convert.
 * @returns {Date}
 * @example toDate(0).toISOString();                                               // => "1970-01-01T00:00:00.000Z"
 * @example toDate('2024-01-01T00:00:00.000Z').getTime();                          // => 1704067200000
 * @example isInvalidDate(toDate('not a date'));                                   // => true
 * @example (() => { const date = new Date(0); return toDate(date) === date; })(); // => true
 */
function toDate(value) {
    // Preserve genuine Date identity, including invalid Dates and foreign instances.
    return isDate(value) ? value : new NativeDate(value);
}

module.exports = toDate;
