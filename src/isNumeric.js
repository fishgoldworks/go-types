var nonSpace = /\S/;
var stringValueOf = String.prototype.valueOf;
var isFinite = require('./isFinite');
var isString = require('./isString');
var isBigInt = require('./isBigInt');

/**
 * Checks whether a value is a finite number, a bigint, or non-blank numeric text.
 *
 * Accepts numeric text as well as finite numbers and primitive bigints. Rejects booleans, blank
 * text, `NaN`, infinities and boxed bigints.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a finite primitive or boxed number, a primitive
 * bigint, or non-blank string text converting to a finite number; otherwise `false`.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnumericvalue
 * @example isNumeric(" 1e3 ");            // => true
 * @example isNumeric("0x10");             // => true
 * @example isNumeric(1n);                 // => true
 * @example isNumeric("   ");              // => false
 * @example isNumeric(Infinity);           // => false
 */
function isNumeric(value) {
  if (isFinite(value) || isBigInt(value)) {
    return true;
  }
  if (!isString(value)) {
    return false;
  }
  // Read the real string payload instead of invoking user-defined coercion.
  // Whitespace alone does not represent a number.
  var text = stringValueOf.call(value);
  return nonSpace.test(text) && isFinite(text * 1);
}

module.exports = isNumeric;
