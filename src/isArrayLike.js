// Share a single integer-length contract with the array-like consumers.
var getArrayLikeLength = require("./util/getArrayLikeLength");

/**
 * Checks for a non-function value whose numeric length is an integer from zero through Number.MAX_SAFE_INTEGER.
 * Reads length once and does not require every index to exist. Boxed length numbers, negative lengths, fractions, NaN and infinities are invalid. Accessors/proxy traps can run and throw.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isArrayLike("");           // => true
 * @example isArrayLike({length:0});   // => true
 * @example isArrayLike({length:0.5}); // => false
 * @example isArrayLike(() => {});     // => false
 */
function isArrayLike(value) {
    return getArrayLikeLength(value) !== undefined;
}

module.exports = isArrayLike;
