var hasNativeBrand = require('./util/hasNativeBrand');
var valueOf = Number.prototype.valueOf;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  nativeTypes && typeof nativeTypes.isNumberObject === 'function'
    ? nativeTypes.isNumberObject
    : (value) => hasNativeBrand(value, valueOf);

/**
 * Checks whether a value is a primitive number or a boxed `Number`.
 *
 * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
 * wrappers. Does not invoke overridden conversion methods. Includes `NaN` and infinities.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive number or boxed `Number`, including `NaN`
 * and infinities; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnumbervalue
 * @example isNumber(NaN);                 // => true
 * @example isNumber(new Number(1));       // => true
 * @example isNumber("1");                 // => false
 */
function isNumber(value) {
  // Preserve primitive + boxed support across realms, without trusting prototypes or tags.
  return typeof value === 'number' || checkNativeBrand(value);
}

module.exports = isNumber;
