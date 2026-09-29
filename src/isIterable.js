/**
 * Checks for a callable Symbol.iterator method.
 * Does not invoke the iterator method. Method presence does not prove it returns a valid iterator. A property getter/proxy trap may run or throw.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isIterable([]);         // => true
 * @example isIterable("");         // => true
 * @example isIterable({next(){}}); // => false
 */
function isIterable(value) {
    // Arrays/strings can explicitly disable iteration. Inspect the actual
    // callable method without invoking it; method presence does not validate its output.
    return value !== null && value !== undefined && typeof Symbol === "function" &&
        Symbol.iterator !== undefined && typeof value[Symbol.iterator] === "function";
}

module.exports = isIterable;
