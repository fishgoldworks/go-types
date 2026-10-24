'use strict';

const NativeRegExp = RegExp;
const isRegExp = require('../isRegExp');

/**
 * Converts a native pattern and optional `flags` to a genuine `RegExp`.
 *
 * Uses native `RegExp` syntax and `flags`. May reuse a genuine local `RegExp` without explicit
 * `flags`; copied expressions start with `lastIndex` zero.
 *
 * @param {*} [value] The value to convert.
 * @param {*} [flags] Native RegExp flags. Omitted or `undefined` preserves a RegExp input’s flags;
 * explicit flags replace them.
 * @returns {RegExp} A genuine `RegExp`, which may retain input identity under native rules.
 * @throws {*} Invalid patterns or `flags` throw `SyntaxError`. Native coercion, getters and proxy
 * errors propagate unchanged.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toregexpvalue-flags
 * @example toRegExp('a.b', 'i').test('AxB');                                      // => true
 * @example toRegExp().source;                                                     // => "(?:)"
 * @example toRegExp('/a/i').test('a');                                            // => false
 * @example (() => { const value = /a/g; return toRegExp(value) === value; })();   // => true
 */
function toRegExp(value, flags) {
  // The native function-call identity shortcut also accepts Symbol.match impostors.
  // Use that shortcut only for genuine RegExps; construction always returns a RegExp.
  return isRegExp(value) ? NativeRegExp(value, flags) : new NativeRegExp(value, flags);
}

module.exports = toRegExp;
