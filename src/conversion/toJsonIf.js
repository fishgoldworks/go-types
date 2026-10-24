'use strict';

const toJson = require('./toJson');
const shouldConvert = require('../util/shouldConvert');

/**
 * Serialises a value to JSON text when the condition evaluates to `true`. Otherwise, returns the
 * original value unchanged.
 *
 * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
 * conditions or non-boolean predicate results throw `TypeError`.
 *
 * Requested conversion uses `toJson`. May return `undefined`. Does not transform Maps, Sets or
 * bigints automatically. Cycles and unhandled bigints throw; getters, `toJSON` methods and
 * replacer callbacks can run.
 *
 * @param {*} value The value to convert.
 * @param {*} [condition] A boolean or synchronous predicate called once with the original value.
 * Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.
 * @param {*} [replacer] A native JSON replacer callback or property-name list. Callbacks receive
 * the containing object as `this`; omitted or `null` uses ordinary serialisation.
 * @param {*} [space] Native JSON indentation, capped at ten spaces or ten string code units.
 * @returns {string|undefined|*} JSON text or `undefined` when conversion is requested; otherwise
 * the original input, unchanged.
 * @throws {*} Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate
 * errors propagate. A requested conversion also follows `toJson` error behaviour; a skipped
 * conversion does not inspect or coerce the value.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tojsonifvalue-condition-replacer-space
 * @example toJsonIf({a: 1}, true);                                  // => "{\"a\":1}"
 * @example toJsonIf({a: 1}, false);                                 // => {"a":1}
 * @example toJsonIf({a: 1, b: 2}, value => value.a === 1, ['a']);   // => "{\"a\":1}"
 */
function toJsonIf(value, condition, replacer, space) {
  return shouldConvert(value, condition) ? toJson(value, replacer, space) : value;
}

module.exports = toJsonIf;
