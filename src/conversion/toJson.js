'use strict';

const nativeStringify = JSON.stringify;

/**
 * Serialises a value to JSON text using native `JSON.stringify` behaviour.
 *
 * May return `undefined`. Does not transform Maps, Sets or bigints automatically. Cycles and
 * unhandled bigints throw; getters, `toJSON` methods and replacer callbacks can run.
 *
 * @param {*} [value] The value to convert.
 * @param {*} [replacer] A native JSON replacer callback or property-name list. Callbacks receive
 * the containing object as `this`; omitted or `null` uses ordinary serialisation.
 * @param {*} [space] Native JSON indentation, capped at ten spaces or ten string code units.
 * @returns {string|undefined} JSON text, or `undefined` when native serialisation produces no
 * text, including omitted input without a replacer.
 * @throws {*} Cycles and unhandled bigints throw `TypeError`. Getter, proxy, `toJSON` and replacer
 * exceptions propagate unchanged.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tojsonvalue-replacer-space
 * @example toJson({a: 1});                                                                    // => "{\"a\":1}"
 * @example toJson([1, 2]);                                                                    // => "[1,2]"
 * @example toJson('hello');                                                                   // => "\"hello\""
 * @example toJson(undefined) === undefined;                                                   // => true
 * @example toJson({a: 1, b: 2}, ['a'], 2);                                                    // => "{\n  \"a\": 1\n}"
 * @example toJson({a: 1, secret: 2}, (key, value) => key === 'secret' ? undefined : value);   // => "{\"a\":1}"
 */
function toJson(value, replacer, space) {
  return nativeStringify(value, replacer, space);
}

module.exports = toJson;
