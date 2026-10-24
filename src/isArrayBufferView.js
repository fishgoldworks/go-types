const nativeIsView = typeof ArrayBuffer === 'function' ? ArrayBuffer.isView : undefined;
const isDataView = require('./isDataView');
const isTypedArray = require('./isTypedArray');
/**
 * Checks whether a value is a native typed array or `DataView`.
 *
 * Detached views retain their identity; passing does not guarantee usable memory. Falls back to
 * native DataView and typed-array identity checks when `ArrayBuffer.isView` is unavailable;
 * returns `false` if none of those checks is available.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a native typed array or `DataView`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarraybufferviewvalue
 * @example isArrayBufferView(new Uint8Array(2));                  // => true
 * @example isArrayBufferView(new DataView(new ArrayBuffer(8)));   // => true
 * @example isArrayBufferView(new ArrayBuffer(8));                 // => false
 */
function isArrayBufferView(value) {
  return typeof nativeIsView === 'function' ? nativeIsView(value) : isDataView(value) || isTypedArray(value);
}
module.exports = isArrayBufferView;
