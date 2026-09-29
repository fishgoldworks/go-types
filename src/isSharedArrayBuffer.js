const hasNativeBrand = require('./util/hasNativeBrand');
const getter = typeof SharedArrayBuffer === 'function' ? Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'byteLength').get : undefined;
const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = getter && nativeTypes && typeof nativeTypes.isSharedArrayBuffer === 'function'
    ? nativeTypes.isSharedArrayBuffer
    : value => hasNativeBrand(value, getter);

/**
 * Checks genuine SharedArrayBuffer identity.
 * Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory. Returns false if SharedArrayBuffer is unavailable.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isSharedArrayBuffer(new SharedArrayBuffer(8)); // => true
 * @example isSharedArrayBuffer(new Uint8Array(8));        // => false
 */
function isSharedArrayBuffer(value) {
    return checkNativeBrand(value);
}
module.exports = isSharedArrayBuffer;
