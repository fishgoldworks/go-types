'use strict';

const toMap = require('./toMap');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts an iterable of key/value entries to a new shallow Map when the condition evaluates to
 * `true`. Otherwise, returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toMap`. Consumes synchronous entries; duplicate keys keep their first
 * position and take the last value. Nullish input creates an empty Map. Non-iterable objects are
 * not converted into entries. Requires native `Map`; missing support does not prevent loading.
 * Requested conversion throws `TypeError` before inspecting the input when it is unavailable.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {Map|*} A new Map when conversion is requested; otherwise the original input,
 * unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toMap` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tomapifvalue-condition
 * @example Array.from(toMapIf([['key', 1]], true));   // => [["key",1]]
 * @example toMapIf(42, false);                        // => 42
 */
function toMapIf(value, condition) {
  return shouldConvert(value, condition) ? toMap(value) : value;
}

module.exports = toMapIf;
