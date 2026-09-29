'use strict';

const nativeSymbol = Symbol;
const symbolValueOf = Symbol.prototype.valueOf;

/**
 * Preserves primitive symbols, unboxes genuine Symbol wrappers, or creates a new symbol from a description.
 * Genuine boxed symbols are unboxed intrinsically, including across realms; their overridden conversion hooks are not called. Other values follow native Symbol(description) conversion and may throw. Identical descriptions create distinct symbols; Symbol.for is not used. Omitted/undefined input creates a symbol without a description.
 * @param {*} value Value to convert.
 * @returns {symbol}
 * @example toSymbol('key').description;                                                             // => "key"
 * @example toSymbol('key') !== toSymbol('key');                                                     // => true
 * @example (() => { const symbol = Symbol('key'); return toSymbol(Object(symbol)) === symbol; })(); // => true
 */
function toSymbol(value) {
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
