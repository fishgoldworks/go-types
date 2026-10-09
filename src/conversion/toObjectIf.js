'use strict';

const toObject = require('./toObject');
const shouldConvert = require('../util/shouldConvert');

/**
 * Converts a value to an object when the condition evaluates to `true`. Otherwise, returns the
 * original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toObject`. Preserves existing object/function identity. Nullish input
 * creates a fresh empty object; conversion hooks are not invoked.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @returns {object|*} The original object or function, a boxed primitive, or a new object for
 * nullish input when conversion is requested; otherwise the original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toObject` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toobjectifvalue-condition
 * @example typeof toObjectIf(42, true);   // => "object"
 * @example toObjectIf(42, false);         // => 42
 */
function toObjectIf(value, condition) {
  return shouldConvert(value, condition) ? toObject(value) : value;
}

module.exports = toObjectIf;
