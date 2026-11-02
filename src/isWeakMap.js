var hasNativeBrand = require('./util/hasNativeBrand');
var has = typeof WeakMap === 'function' ? WeakMap.prototype.has : undefined;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  has && nativeTypes && typeof nativeTypes.isWeakMap === 'function'
    ? nativeTypes.isWeakMap
    : (value) => hasNativeBrand(value, has);

/**
 * Checks whether a value is a `WeakMap`.
 *
 * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
 * imitations. Returns `false` when the local native detection capability is unavailable.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a `WeakMap`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isweakmapvalue
 * @example isWeakMap(new WeakMap());                      // => true
 * @example isWeakMap(Object.create(WeakMap.prototype));   // => false
 */
function isWeakMap(value) {
  // has checks the receiver's native brand without changing the collection.
  // It accepts foreign instances and rejects objects that merely inherit the prototype.
  return checkNativeBrand(value);
}

module.exports = isWeakMap;
