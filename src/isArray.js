const nativeIsArray = Array.isArray;
/**
 * Determines whether a value is an array, including from another realm.
 *
 * Preserves native `Array.isArray` behaviour, including `TypeError` for a revoked proxy.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value passes native `Array.isArray`; otherwise `false`.
 * @throws {*} `TypeError` for a revoked proxy, following native `Array.isArray` behaviour.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarrayvalue
 * @example isArray([]);                               // => true
 * @example isArray(new Uint8Array(2));                // => false
 * @example isArray(Object.create(Array.prototype));   // => false
 */
function isArray(value) {
  return nativeIsArray(value);
}
module.exports = isArray;
