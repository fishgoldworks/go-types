var hasNativeBrand = require('./util/hasNativeBrand');
var valueOf = Boolean.prototype.valueOf;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  nativeTypes && typeof nativeTypes.isBooleanObject === 'function'
    ? nativeTypes.isBooleanObject
    : (value) => hasNativeBrand(value, valueOf);

/**
 * Determines whether a value is a primitive boolean or a genuine boxed `Boolean`.
 *
 * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
 * wrappers. Does not invoke overridden conversion methods.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a primitive boolean or genuine boxed `Boolean`;
 * otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isbooleanvalue
 * @example isBoolean(false);                // => true
 * @example isBoolean(new Boolean(false));   // => true
 * @example isBoolean(0);                    // => false
 */
function isBoolean(value) {
  // Preserve primitive + boxed support across realms, without trusting prototypes or tags.
  return typeof value === 'boolean' || checkNativeBrand(value);
}

module.exports = isBoolean;
