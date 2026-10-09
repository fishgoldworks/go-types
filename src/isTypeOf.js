const createTypeChecker = require('./createTypeChecker');
/**
 * Determines whether a value matches a type name, instance target, predicate or union of matchers.
 *
 * Validates the entire specification before matching. An omitted type matches `undefined`.
 * Predicates must return a synchronous primitive boolean.
 *
 * @param {*} value The value to check.
 * @param {*} [type] The matcher for the value or collection items. An omitted matcher matches
 * `undefined`.
 * @returns {boolean} `true` if the value matches the type specification (omission matches
 * `undefined`); otherwise `false`.
 * @throws {*} Invalid matcher configuration throws `TypeError`. Callback, property-access and
 * native instance-matching errors propagate; see Type specifications.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
 * @example isTypeOf(1,"number");                      // => true
 * @example isTypeOf(null,"object");                   // => true
 * @example isTypeOf("12",Number);                     // => false
 * @example isTypeOf([], {predicate:Array.isArray});   // => true
 */
function isTypeOf(value, type) {
  return createTypeChecker(type)(value);
}
module.exports = isTypeOf;
