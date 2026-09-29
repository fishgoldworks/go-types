var hasNativeBrand = require("./util/hasNativeBrand");
var regExpPrototype = RegExp.prototype;
var getSource = Object.getOwnPropertyDescriptor(regExpPrototype, "source").get;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = nativeTypes && typeof nativeTypes.isRegExp === 'function'
    ? nativeTypes.isRegExp
    : value => hasNativeBrand(value, getSource);

/**
 * Checks RegExp identity without executing the expression or changing lastIndex.
 * The browser fallback uses the intrinsic source getter; supports foreign instances, rejects RegExp.prototype and prototype/tag imitations.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isRegExp(/x/g);             // => true
 * @example isRegExp(RegExp.prototype); // => false
 * @example isRegExp("/x/");            // => false
 */
function isRegExp(value) {
    // The intrinsic source getter checks the brand without running a regex,
    // changing lastIndex, reading user flags, or trusting Symbol.toStringTag.
    // The local RegExp.prototype is a specified special case of that getter, not a RegExp instance.
    return value !== regExpPrototype && checkNativeBrand(value);
}

module.exports = isRegExp;
