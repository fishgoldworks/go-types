/**
 * Checks whether a value is a primitive symbol.
 *
 * Boxed symbols return `false`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive symbol; otherwise `false`.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#issymbolvalue
 * @example isSymbol(Symbol("x"));         // => true
 * @example isSymbol("x");                 // => false
 */
function isSymbol(value) {
  return typeof value === 'symbol';
}

module.exports = isSymbol;
