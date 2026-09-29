var hasNativeBrand = require("./util/hasNativeBrand");
var getTime = Date.prototype.getTime;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = nativeTypes && typeof nativeTypes.isDate === 'function'
    ? nativeTypes.isDate
    : value => hasNativeBrand(value, getTime);

/**
 * Checks genuine Date identity, regardless of timestamp validity.
 * Uses native identity checks across realms, not local instanceof. Ignores overridden getTime methods.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isDate(new Date(NaN)); // => true
 * @example isDate("2026-01-01");  // => false
 */
function isDate(value) {
    // getTime validates the native Date receiver without calling value.getTime.
    // Invalid Dates still have the Date brand and are intentionally accepted here.
    return checkNativeBrand(value);
}

module.exports = isDate;
