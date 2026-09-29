var isObject = require("./isObject");

/**
 * Checks for callable then and catch methods on a non-null object/function.
 * Retains the library-specific then-and-catch contract, which is stricter than JavaScript thenable detection and differs from TypeScript PromiseLike. Does not invoke either method.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isPromiseLike({then(){},catch(){}}); // => true
 * @example isPromiseLike({then(){}});           // => false
 */
function isPromiseLike(value) {
    // Use the shared object boundary; retain the documented then AND catch requirement.
    return isObject(value) && typeof value.then === "function" && typeof value.catch === "function";
}

module.exports = isPromiseLike;
