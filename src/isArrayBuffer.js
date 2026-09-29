const hasNativeBrand = require('./util/hasNativeBrand');
const getter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get;
const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = nativeTypes && typeof nativeTypes.isArrayBuffer === 'function'
    ? nativeTypes.isArrayBuffer
    : value => hasNativeBrand(value, getter);

/**
 * Checks genuine ArrayBuffer identity.
 * Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isArrayBuffer(new ArrayBuffer(8)); // => true
 * @example isArrayBuffer(new Uint8Array(8));  // => false
 */
function isArrayBuffer(value) {
    return checkNativeBrand(value);
}
module.exports = isArrayBuffer;
