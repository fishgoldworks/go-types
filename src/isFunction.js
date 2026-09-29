/**
 * Checks typeof value === "function".
 * Includes classes, generators and callable proxies. It does not guarantee that calling the value will succeed; a class cannot be invoked without new.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isFunction(() => {});   // => true
 * @example isFunction(class A {}); // => true
 * @example isFunction({call(){}}); // => false
 */
function isFunction(value) {
    return typeof value === "function";
}

module.exports = isFunction;