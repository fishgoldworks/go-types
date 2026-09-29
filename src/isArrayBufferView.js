const nativeIsView = ArrayBuffer.isView;
/**
 * Uses captured ArrayBuffer.isView: typed arrays and DataView are views.
 * Supports foreign and detached views, rejects proxies and prototype imitations.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isArrayBufferView(new Uint8Array(2));                // => true
 * @example isArrayBufferView(new DataView(new ArrayBuffer(8))); // => true
 * @example isArrayBufferView(new ArrayBuffer(8));               // => false
 */
function isArrayBufferView(value) {
    return nativeIsView(value);
}
module.exports = isArrayBufferView;
