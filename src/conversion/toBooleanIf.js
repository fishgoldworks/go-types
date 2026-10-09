'use strict';

const toBoolean = require('./toBoolean');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`.
 * Otherwise, returns the original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toBoolean`. Uses truthiness rather than parsing boolean text. Does
 * not invoke object conversion hooks.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {boolean|*} The input’s boolean truthiness when conversion is requested; otherwise the
 * original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toBoolean` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobooleanifvalue-condition
 * @example toBooleanIf(0, true);          // => false
 * @example toBooleanIf('false', false);   // => "false"
 */
function toBooleanIf(value, condition) {
  return shouldConvert(value, condition) ? toBoolean(value) : value;
}

module.exports = toBooleanIf;
