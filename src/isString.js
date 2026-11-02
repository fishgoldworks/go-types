var hasNativeBrand = require('./util/hasNativeBrand');
var valueOf = String.prototype.valueOf;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  nativeTypes && typeof nativeTypes.isStringObject === 'function'
    ? nativeTypes.isStringObject
    : (value) => hasNativeBrand(value, valueOf);

/**
 * Checks whether a value is a primitive string or a boxed `String`.
 *
 * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
 * wrappers. Does not invoke overridden conversion methods.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive string or boxed `String`; otherwise
 * `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isstringvalue
 * @example isString("x");                 // => true
 * @example isString(new String("x"));     // => true
 * @example isString(1);                   // => false
 */
function isString(value) {
  // Preserve primitive + boxed support across realms, without trusting prototypes or tags.
  return typeof value === 'string' || checkNativeBrand(value);
}

module.exports = isString;
