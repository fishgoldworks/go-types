const hasNativeBrand = require('./util/hasNativeBrand');
const getter = Object.getOwnPropertyDescriptor(DataView.prototype, 'buffer').get;
const nativeTypes = require('./util/nativeTypes');
// Resolve the platform implementation once; never inspect user prototypes or tags.
const checkNativeBrand = nativeTypes && typeof nativeTypes.isDataView === 'function'
    ? nativeTypes.isDataView
    : value => hasNativeBrand(value, getter);

/**
 * Checks genuine DataView identity.
 * Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isDataView(new DataView(new ArrayBuffer(8))); // => true
 * @example isDataView(new Uint8Array(8));                // => false
 */
function isDataView(value) {
    return checkNativeBrand(value);
}
module.exports = isDataView;
