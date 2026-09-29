const createTypeChecker = require('./createTypeChecker');
/**
 * Validates a type specification and checks a value against it.
 * See Type specifications for the matcher contract. No constructor coercion. Invalid type names, descriptors, union arrays and non-callable instance hooks are rejected before value matching. Callable instance targets are evaluated with native instanceof: prototype errors can occur at evaluation time. Omitted type means strict undefined, unlike the native typeof name "undefined", which also matches browser document.all.
 * @param {*} value Value to inspect.
 * @param {*} type Matcher specification.
 * @returns {boolean}
 * @example isTypeOf(1,"number");                    // => true
 * @example isTypeOf(null,"object");                 // => true
 * @example isTypeOf("12",Number);                   // => false
 * @example isTypeOf([], {predicate:Array.isArray}); // => true
 */
function isTypeOf(value, type) {
    return createTypeChecker(type)(value);
}
module.exports = isTypeOf;
