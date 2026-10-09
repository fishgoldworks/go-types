var hasNativeBrand = require('./util/hasNativeBrand');
var getTime = Date.prototype.getTime;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  nativeTypes && typeof nativeTypes.isDate === 'function'
    ? nativeTypes.isDate
    : (value) => hasNativeBrand(value, getTime);

/**
 * Determines whether a value is a genuine `Date`, valid or invalid.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a genuine `Date`, valid or invalid; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isdatevalue
 * @example isDate(new Date(NaN));         // => true
 * @example isDate("2026-01-01");          // => false
 */
function isDate(value) {
  // getTime validates the native Date receiver without calling value.getTime.
  // Invalid Dates still have the Date brand and are intentionally accepted here.
  return checkNativeBrand(value);
}

module.exports = isDate;
