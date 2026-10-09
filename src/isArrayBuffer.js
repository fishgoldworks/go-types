const hasNativeBrand = require('./util/hasNativeBrand');
const getNativeGetter = require('./util/getNativeGetter');
const getter = getNativeGetter(typeof ArrayBuffer === 'function' ? ArrayBuffer : undefined, 'byteLength');
const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  getter && nativeTypes && typeof nativeTypes.isArrayBuffer === 'function'
    ? nativeTypes.isArrayBuffer
    : (value) => hasNativeBrand(value, getter);

/**
 * Determines whether a value is a genuine `ArrayBuffer`.
 *
 * Checks identity rather than memory usability; supports foreign instances and rejects proxies.
 * Returns `false` when the local native detection capability is unavailable.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a genuine `ArrayBuffer`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarraybuffervalue
 * @example isArrayBuffer(new ArrayBuffer(8));   // => true
 * @example isArrayBuffer(new Uint8Array(8));    // => false
 */
function isArrayBuffer(value) {
  return checkNativeBrand(value);
}
module.exports = isArrayBuffer;
