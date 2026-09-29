var hasNativeBrand = require("./util/hasNativeBrand");
var valueOf = Boolean.prototype.valueOf;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = nativeTypes && typeof nativeTypes.isBooleanObject === 'function'
    ? nativeTypes.isBooleanObject
    : value => hasNativeBrand(value, valueOf);

/**
 * Checks for a primitive boolean or genuine boxed Boolean.
 * Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isBoolean(false);              // => true
 * @example isBoolean(new Boolean(false)); // => true
 * @example isBoolean(0);                  // => false
 */
function isBoolean(value) {
    // Preserve primitive + boxed support across realms, without trusting prototypes or tags.
    return typeof value === "boolean" || checkNativeBrand(value);
}

module.exports = isBoolean;
