var nativeIsError = Error.isError;
var objectToString = Object.prototype.toString;
var toStringTag = typeof Symbol === 'function' ? Symbol.toStringTag : undefined;

/**
 * Checks whether a value is recognised as an error by the available native check or fallback.
 *
 * The fallback rejects custom tags without reading their getters. Without native branding or a
 * usable tag key, returns `false`. Proxy traps may run; this is not a security check.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the captured native error check, or its conservative fallback,
 * recognises the value as an error; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#iserrorvalue
 * @example isError(new Error("x"));                   // => true
 * @example isError(Object.create(Error.prototype));   // => false
 * @example isError({name:"Error",message:"x"});       // => false
 */
function isError(value) {
  // Prefer the standardized native brand check when the runtime provides it.
  if (typeof nativeIsError === 'function') {
    return nativeIsError(value);
  }
  if (value === null || typeof value !== 'object') {
    return false;
  }
  // Conservative legacy fallback: refuse customisable tags rather than
  // accepting a spoofed "Error" tag or running its getter. Genuine tagged Errors
  // (including some DOMException implementations) may be false without Error.isError.
  // Proxy traps can still execute; this fallback is not a security boundary.
  // Without the key, foreign or previously created tags cannot be ruled out safely.
  if (typeof toStringTag !== 'symbol' || toStringTag in value) {
    return false;
  }
  return objectToString.call(value) === '[object Error]';
}

module.exports = isError;
