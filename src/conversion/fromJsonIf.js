'use strict';

const fromJson = require('./fromJson');
const shouldConvert = require('../util/shouldConvert');

/**
 * Parses JSON when the condition evaluates to `true`; otherwise returns the original input
 * unchanged.
 *
 * Calls a predicate once. Omitted or `undefined` conditions skip conversion. Conditions and
 * predicate results must be primitive booleans.
 *
 * Requested conversion uses `fromJson`. Uses captured native `JSON.parse`, including input
 * coercion, reviver order and errors. Parsing does not validate an application schema; reviver
 * results are not awaited.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @param {*} [reviver] A native JSON reviver, called for children before parents and finally for
 * the root. Returning `undefined` deletes a property or replaces the root with `undefined`. Newer
 * hosts may supply optional source context.
 * @returns {*} The parsed or revived value when requested; otherwise the original input unchanged.
 * @throws {*} Invalid conditions and non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate; requested conversion follows `fromJson` error behaviour.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#fromjsonifvalue-condition-reviver
 * @example fromJsonIf('{"a":1}', true);                                                                                         // => {"a":1}
 * @example fromJsonIf('{"a":1}', false);                                                                                        // => "{\"a\":1}"
 * @example fromJsonIf('invalid');                                                                                               // => "invalid"
 * @example fromJsonIf('2', value => typeof value === 'string', (key, value) => typeof value === 'number' ? value * 2 : value);  // => 4
 */
function fromJsonIf(value, condition, reviver) {
  return shouldConvert(value, condition) ? fromJson(value, reviver) : value;
}

module.exports = fromJsonIf;
