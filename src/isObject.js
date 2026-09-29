/**
 * Accepts all non-null objects and functions.
 * Uses the object/function boundary rather than realm-specific instanceof Object. Includes the browser document.all object despite its legacy typeof-undefined behaviour.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isObject(Object.create(null)); // => true
 * @example isObject(() => {});            // => true
 * @example isObject(null);                // => false
 */
function isObject(value) {
    // Prototype identity is realm-specific and excludes null-prototype
    // dictionaries. Functions remain objects under this library's contract.
    const type = typeof value;
    // HTML document.all is an object despite its legacy typeof-undefined behaviour.
    return type === "object" ? value !== null :
        type === "function" || (type === "undefined" && value !== undefined);
}

module.exports = isObject;
