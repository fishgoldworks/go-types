var nativeIsError = Error.isError;
var objectToString = Object.prototype.toString;

/**
 * Uses captured Error.isError when available; otherwise checks ordinary untagged Error objects conservatively.
 * Fallback refuses custom/inherited Symbol.toStringTag without reading its getter, so genuine tagged errors/DOMExceptions may return false on older runtimes. Native branch follows the runtime. Not a security boundary; proxy traps may run.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isError(new Error("x"));                 // => true
 * @example isError(Object.create(Error.prototype)); // => false
 * @example isError({name:"Error",message:"x"});     // => false
 */
function isError(value) {
    // Prefer the standardized native brand check when the runtime provides it.
    if (typeof nativeIsError === "function") {
        return nativeIsError(value);
    }
    if (value === null || typeof value !== "object") {
        return false;
    }
    // Conservative legacy fallback: refuse customisable tags rather than
    // accepting a spoofed "Error" tag or running its getter. Genuine tagged Errors
    // (including some DOMException implementations) may be false without Error.isError.
    // Proxy traps can still execute; this fallback is not a security boundary.
    if (typeof Symbol === "function" && Symbol.toStringTag && Symbol.toStringTag in value) {
        return false;
    }
    return objectToString.call(value) === "[object Error]";
}

module.exports = isError;
