'use strict';

const nativeSymbol = typeof Symbol === 'function' ? Symbol : undefined;
const symbolValueOf = nativeSymbol && nativeSymbol.prototype.valueOf;

/**
 * Converts a value to a primitive symbol, preserving existing symbols and unboxing `Symbol`
 * wrappers.
 *
 * Preserves primitive symbol identity and unboxes wrappers. Other inputs create a new symbol and
 * may invoke description-conversion hooks. Requires native `Symbol`; missing support does not
 * prevent loading. Requested conversion throws `TypeError` before inspecting the input when it is
 * unavailable.
 *
 * @param {*} [value] The value to convert.
 * @returns {symbol} The original or unboxed symbol, or a new symbol created from the description.
 * @throws {*} Native description-conversion errors propagate. Unavailable native `Symbol` support
 * throws `TypeError` before conversion.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosymbolvalue
 * @example toSymbol('key').toString();                                                                // => "Symbol(key)"
 * @example toSymbol('key') !== toSymbol('key');                                                       // => true
 * @example (() => { const symbol = Symbol('key'); return toSymbol(Object(symbol)) === symbol; })();   // => true
 */
function toSymbol(value) {
  if (!nativeSymbol) throw new TypeError('Native Symbol conversion is unavailable in this runtime.');
  if (typeof value === 'symbol') return value;
  if (value !== null && typeof value === 'object') {
    try {
      // Unbox genuine Symbol wrappers without running overridden coercion hooks.
      return symbolValueOf.call(value);
    } catch (_) {
      // Not a Symbol wrapper; the native constructor performs description conversion.
    }
  }
  return nativeSymbol(value);
}

module.exports = toSymbol;
