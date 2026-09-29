const nativeIsArray = Array.isArray;
/**
 * Checks native array identity.
 * Uses a captured Array.isArray reference. Supports foreign arrays and non-revoked proxies around arrays. A revoked proxy throws TypeError, preserving native behaviour.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isArray([]);                             // => true
 * @example isArray(new Uint8Array(2));              // => false
 * @example isArray(Object.create(Array.prototype)); // => false
 */
function isArray(value) {
    return nativeIsArray(value);
}
module.exports = isArray;
