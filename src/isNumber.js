var hasNativeBrand = require("./util/hasNativeBrand");
var valueOf = Number.prototype.valueOf;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = nativeTypes && typeof nativeTypes.isNumberObject === 'function'
    ? nativeTypes.isNumberObject
    : value => hasNativeBrand(value, valueOf);

/**
 * Checks for a primitive number or genuine boxed Number, including NaN and infinities.
 * Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isNumber(NaN);           // => true
 * @example isNumber(new Number(1)); // => true
 * @example isNumber("1");           // => false
 */
function isNumber(value) {
    // Preserve primitive + boxed support across realms, without trusting prototypes or tags.
    return typeof value === "number" || checkNativeBrand(value);
}

module.exports = isNumber;
