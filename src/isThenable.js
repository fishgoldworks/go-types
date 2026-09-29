var isObject = require("./isObject");

/**
 * Checks for a non-null object/function with a callable then method.
 * Includes foreign/null-prototype objects. Does not invoke then. Shape detection is not proof of Promise/A+ behaviour.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isThenable({then(){}}); // => true
 * @example isThenable({then:1});   // => false
 */
function isThenable(value) {
    // Include foreign and null-prototype objects without invoking then.
    return isObject(value) && typeof value.then === "function";
}

module.exports = isThenable;
