/**
 * Accepts non-null objects but excludes functions.
 * This is not a plain-object or dictionary check. Includes browser document.all as an object. Returns boolean in declarations because TypeScript object also includes functions.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isObjectLike([]);       // => true
 * @example isObjectLike(() => {}); // => false
 * @example isObjectLike(null);     // => false
 */
function isObjectLike(value) {
    const type = typeof value;
    return type === "object" ? value !== null : type === "undefined" && value !== undefined;
}
module.exports = isObjectLike;
