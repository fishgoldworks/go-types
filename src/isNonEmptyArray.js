const isArray = require('./isArray');
const isValidArrayLength = require('./util/isValidArrayLength');
/**
 * Checks actual array identity and length greater than zero.
 * A hole still contributes to array length. This is separate from element-type validation. An invalid exposed array length (for example from a Proxy) returns false.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isNonEmptyArray([null]);       // => true
 * @example isNonEmptyArray(new Array(1)); // => true
 * @example isNonEmptyArray([]);           // => false
 */
function isNonEmptyArray(value) {
    if (!isArray(value)) return false;
    const length = value.length;
    return isValidArrayLength(length) && length > 0;
}
module.exports = isNonEmptyArray;
