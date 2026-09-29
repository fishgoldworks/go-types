var hasNativeBrand = require("./util/hasNativeBrand");
var has = typeof WeakMap === "function" ? WeakMap.prototype.has : undefined;

const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = nativeTypes && typeof nativeTypes.isWeakMap === 'function'
    ? nativeTypes.isWeakMap
    : value => hasNativeBrand(value, has);

/**
 * Checks genuine WeakMap identity using captured, non-mutating native checks.
 * Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isWeakMap(new WeakMap());                    // => true
 * @example isWeakMap(Object.create(WeakMap.prototype)); // => false
 */
function isWeakMap(value) {
    // has checks the receiver's native brand without changing the collection.
    // It accepts foreign instances and rejects objects that merely inherit the prototype.
    return checkNativeBrand(value);
}

module.exports = isWeakMap;
