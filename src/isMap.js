var hasNativeBrand = require('./util/hasNativeBrand');
var has = typeof Map === 'function' ? Map.prototype.has : undefined;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  has && nativeTypes && typeof nativeTypes.isMap === 'function'
    ? nativeTypes.isMap
    : (value) => hasNativeBrand(value, has);

/**
 * Checks whether a value is a `Map`.
 *
 * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
 * imitations. Returns `false` when the local native detection capability is unavailable.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a `Map`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ismapvalue
 * @example isMap(new Map());                      // => true
 * @example isMap(Object.create(Map.prototype));   // => false
 */
function isMap(value) {
  // has checks the receiver's native brand without changing the collection.
  // It accepts foreign instances and rejects objects that merely inherit the prototype.
  return checkNativeBrand(value);
}

module.exports = isMap;
