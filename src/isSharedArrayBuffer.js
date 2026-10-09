const hasNativeBrand = require('./util/hasNativeBrand');
const getNativeGetter = require('./util/getNativeGetter');
const getter = getNativeGetter(typeof SharedArrayBuffer === 'function' ? SharedArrayBuffer : undefined, 'byteLength');
const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  getter && nativeTypes && typeof nativeTypes.isSharedArrayBuffer === 'function'
    ? nativeTypes.isSharedArrayBuffer
    : (value) => hasNativeBrand(value, getter);

/**
 * Determines whether a value is a genuine `SharedArrayBuffer`.
 *
 * Supports foreign instances and rejects proxies or prototype imitations. Returns `false` when
 * native shared buffers are unavailable. Returns `false` when the local native detection
 * capability is unavailable.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if native shared buffers are available and the value is a genuine
 * `SharedArrayBuffer`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issharedarraybuffervalue
 * @example isSharedArrayBuffer(new SharedArrayBuffer(8));   // => true
 * @example isSharedArrayBuffer(new Uint8Array(8));          // => false
 */
function isSharedArrayBuffer(value) {
  return checkNativeBrand(value);
}
module.exports = isSharedArrayBuffer;
