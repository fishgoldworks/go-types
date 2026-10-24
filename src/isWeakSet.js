var hasNativeBrand = require('./util/hasNativeBrand');
var has = typeof WeakSet === 'function' ? WeakSet.prototype.has : undefined;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  has && nativeTypes && typeof nativeTypes.isWeakSet === 'function'
    ? nativeTypes.isWeakSet
    : (value) => hasNativeBrand(value, has);

/**
 * Checks whether a value is a genuine `WeakSet`.
 *
 * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
 * imitations. Returns `false` when the local native detection capability is unavailable.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a genuine `WeakSet`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isweaksetvalue
 * @example isWeakSet(new WeakSet());                      // => true
 * @example isWeakSet(Object.create(WeakSet.prototype));   // => false
 */
function isWeakSet(value) {
  // has checks the receiver's native brand without changing the collection.
  // It accepts foreign instances and rejects objects that merely inherit the prototype.
  return checkNativeBrand(value);
}

module.exports = isWeakSet;
