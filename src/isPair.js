var isArray = require("./isArray");

/**
 * Checks actual array identity and length exactly two.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isPair([1,2]);        // => true
 * @example isPair(new Array(2)); // => true
 * @example isPair([1]);          // => false
 */
function isPair(value) {
    return isArray(value) && value.length === 2;
}

module.exports = isPair;