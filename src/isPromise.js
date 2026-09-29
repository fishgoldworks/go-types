/**
 * Performs a local-realm native Promise instanceof check.
 * This is not an unforgeable native-brand check. Foreign promises can return false and objects inheriting Promise.prototype can return true. Does not subscribe, call then, or create a derived promise. Returns boolean in declarations.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isPromise(Promise.resolve(1));   // => true
 * @example isPromise({then(){},catch(){}}); // => false
 */
function isPromise(value) {
    return typeof Promise === "function" && value instanceof Promise;
}

module.exports = isPromise;

