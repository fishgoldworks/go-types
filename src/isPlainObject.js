var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var functionToString = Function.prototype.toString;
var objectConstructorSource = functionToString.call(Object);

/**
 * Checks for a null prototype or an ordinary Object prototype, including across realms.
 * Prototype-based classification, not proof of allocation history. An own constructor field is ordinary data and is not read. Deliberately assigning null/Object.prototype to another value can change this classification. It is not a schema or security check.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isPlainObject({constructor:null});  // => true
 * @example isPlainObject(Object.create(null)); // => true
 * @example isPlainObject(new (class A {})());  // => false
 */
function isPlainObject(value) {
    // Inspect the actual prototype, not value.constructor (ordinary user data).
    // Null-prototype dictionaries and ordinary object prototypes from other realms are supported.
    if (value === null || typeof value !== "object") {
        return false;
    }
    var prototype = getPrototypeOf(value);
    if (prototype === null) {
        return true;
    }
    if (getPrototypeOf(prototype) !== null) {
        return false;
    }
    var descriptor = getOwnPropertyDescriptor(prototype, "constructor");
    return !!descriptor && typeof descriptor.value === "function" &&
        descriptor.value.prototype === prototype &&
        functionToString.call(descriptor.value) === objectConstructorSource;
}

module.exports = isPlainObject;
