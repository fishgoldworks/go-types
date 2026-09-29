var hasNativeBrand = require("./util/hasNativeBrand");
var valueOf = String.prototype.valueOf;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = nativeTypes && typeof nativeTypes.isStringObject === 'function'
    ? nativeTypes.isStringObject
    : value => hasNativeBrand(value, valueOf);

/**
 * Checks for a primitive string or genuine boxed String.
 * Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isString("x");             // => true
 * @example isString(new String("x")); // => true
 * @example isString(1);               // => false
 */
function isString(value) {
    // Preserve primitive + boxed support across realms, without trusting prototypes or tags.
    return typeof value === "string" || checkNativeBrand(value);
}

module.exports = isString;
