var hasNativeBrand = require('./util/hasNativeBrand');
var regExpPrototype = RegExp.prototype;
var getSource = Object.getOwnPropertyDescriptor(regExpPrototype, 'source').get;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  nativeTypes && typeof nativeTypes.isRegExp === 'function'
    ? nativeTypes.isRegExp
    : (value) => hasNativeBrand(value, getSource);

/**
 * Checks whether a value is a genuine regular-expression object.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a genuine `RegExp` instance; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isregexpvalue
 * @example isRegExp(/x/g);                // => true
 * @example isRegExp(RegExp.prototype);    // => false
 * @example isRegExp("/x/");               // => false
 */
function isRegExp(value) {
  // The intrinsic source getter checks the brand without running a regex,
  // changing lastIndex, reading user flags, or trusting Symbol.toStringTag.
  // The local RegExp.prototype is a specified special case of that getter, not a RegExp instance.
  return value !== regExpPrototype && checkNativeBrand(value);
}

module.exports = isRegExp;
