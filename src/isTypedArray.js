const hasNativeBrand = require('./util/hasNativeBrand');
const isView = typeof ArrayBuffer === 'function' ? ArrayBuffer.isView : undefined;
const typedArrayPrototype = typeof Uint8Array === 'function' ? Object.getPrototypeOf(Uint8Array.prototype) : undefined;
const tagDescriptor =
  typedArrayPrototype && typeof Symbol === 'function' && Symbol.toStringTag !== undefined
    ? Object.getOwnPropertyDescriptor(typedArrayPrototype, Symbol.toStringTag)
    : undefined;
const lengthDescriptor = typedArrayPrototype && Object.getOwnPropertyDescriptor(typedArrayPrototype, 'length');
const getTypedArrayTag = tagDescriptor && tagDescriptor.get;
const getLength = lengthDescriptor && lengthDescriptor.get;
/**
 * Determines whether a value is a native typed array, including a Node.js `Buffer`.
 *
 * Excludes `DataView` and ordinary arrays; detached views still pass. Does not identify a
 * particular element type. Uses captured native tag or length getters; returns `false` if no
 * usable native detection getter is available. Missing `Symbol`, `Reflect` or `ArrayBuffer.isView`
 * does not prevent loading.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a native typed array, including a Node.js `Buffer`;
 * otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypedarrayvalue
 * @example isTypedArray(new Uint8Array(2));                 // => true
 * @example isTypedArray(new BigInt64Array(2));              // => true
 * @example isTypedArray(new DataView(new ArrayBuffer(8)));  // => false
 */
function isTypedArray(value) {
  // Both intrinsic getters inspect native slots, including detached/out-of-bounds views.
  // The length getter keeps detection usable without Symbol or ArrayBuffer.isView.
  if (typeof isView === 'function' && typeof getTypedArrayTag === 'function')
    return isView(value) && typeof getTypedArrayTag.call(value) === 'string';
  return hasNativeBrand(value, getLength);
}
module.exports = isTypedArray;
