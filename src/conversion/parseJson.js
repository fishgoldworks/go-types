'use strict';

const nativeParse = JSON.parse;

/**
 * Parses JSON text into a JavaScript value using native `JSON.parse` behaviour.
 *
 * Uses captured native `JSON.parse`, including input coercion, reviver order and errors. Parsing
 * does not validate an application schema; reviver results are not awaited.
 *
 * @param {*} value The value to convert.
 * @param {*} [reviver] A native JSON reviver, called for children before parents and finally for
 * the root. Returning `undefined` deletes a property or replaces the root with `undefined`. Newer
 * hosts may supply optional source context.
 * @returns {*} The parsed value, or any root value returned by the reviver, including `undefined`.
 * TypeScript returns unknown until the caller validates it.
 * @throws {*} Invalid JSON, omitted input and `undefined` throw `SyntaxError`. Symbols throw
 * `TypeError`. Input coercion and reviver errors propagate unchanged.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#parsejsonvalue-reviver
 * @example parseJson('{"a":1}');                                                            // => {"a":1}
 * @example parseJson('[1,2]');                                                              // => [1,2]
 * @example parseJson('false');                                                              // => false
 * @example parseJson('null');                                                               // => null
 * @example parseJson('1', (key, value) => typeof value === 'number' ? value + 1 : value);   // => 2
 * @example parseJson('1', () => undefined) === undefined;                                   // => true
 */
function parseJson(value, reviver) {
  return nativeParse(value, reviver);
}

module.exports = parseJson;
