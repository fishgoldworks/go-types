const hasNativeBrand = require('./util/hasNativeBrand');
const getNativeGetter = require('./util/getNativeGetter');
const getter = getNativeGetter(typeof DataView === 'function' ? DataView : undefined, 'buffer');
const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand =
  getter && nativeTypes && typeof nativeTypes.isDataView === 'function'
    ? nativeTypes.isDataView
    : (value) => hasNativeBrand(value, getter);

/**
 * Determines whether a value is a genuine `DataView`.
 *
 * Checks identity rather than memory usability; supports foreign instances and rejects proxies.
 * Returns `false` when the local native detection capability is unavailable.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a genuine `DataView`; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isdataviewvalue
 * @example isDataView(new DataView(new ArrayBuffer(8)));  // => true
 * @example isDataView(new Uint8Array(8));                 // => false
 */
function isDataView(value) {
  return checkNativeBrand(value);
}
module.exports = isDataView;
