/**
 * Determines whether a value is a non-null object or function.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a non-null object or function; otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isobjectvalue
 * @example isObject(Object.create(null));   // => true
 * @example isObject(() => {});              // => true
 * @example isObject(null);                  // => false
 */
function isObject(value) {
  // Prototype identity is realm-specific and excludes null-prototype
  // dictionaries. Functions remain objects under this library's contract.
  const type = typeof value;
  // HTML document.all is an object despite its legacy typeof-undefined behaviour.
  return type === 'object' ? value !== null : type === 'function' || (type === 'undefined' && value !== undefined);
}

module.exports = isObject;
