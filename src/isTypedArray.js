const isView = ArrayBuffer.isView;
const typedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);
const getTypedArrayTag = Object.getOwnPropertyDescriptor(typedArrayPrototype, Symbol.toStringTag).get;
const apply = Reflect.apply;
const noArguments = [];
/**
 * Checks any native typed-array identity, excluding DataView and ordinary arrays.
 * Includes subclasses, foreign instances, detached/out-of-bounds views and Node Buffers. Uses native view identity plus an intrinsic typed-array tag getter, never an exposed custom tag. The declaration exposes a common structural surface rather than a particular element type.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isTypedArray(new Uint8Array(2));                // => true
 * @example isTypedArray(new BigInt64Array(2));             // => true
 * @example isTypedArray(new DataView(new ArrayBuffer(8))); // => false
 */
function isTypedArray(value) {
    // This intrinsic reads internal typed-array identity, not value[Symbol.toStringTag].
    // Unlike byte-length checks, it also identifies detached and out-of-bounds views.
    return isView(value) && typeof apply(getTypedArrayTag, value, noArguments) === 'string';
}
module.exports = isTypedArray;
