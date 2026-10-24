'use strict';

const toPlainObject = require('./toPlainObject');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a supported value to a fresh plain object when the condition evaluates to `true`.
 * Otherwise, returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toPlainObject`. Returns a fresh ordinary object. Copies own
 * enumerable string and symbol properties, preserving nested references. Entry pairs must be
 * two-element arrays with string or symbol keys. Nullish input throws.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {object|*} A fresh plain object when conversion is requested; otherwise the exact
 * original input.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toPlainObject` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toplainobjectifvalue-condition
 * @example toPlainObjectIf('{"a":1}', true);  // => {"a":1}
 * @example toPlainObjectIf(null, false);      // => null
 */
function toPlainObjectIf(value, condition) {
  return shouldConvert(value, condition) ? toPlainObject(value) : value;
}

module.exports = toPlainObjectIf;
