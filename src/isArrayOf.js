const isArray = require('./isArray');
const isValidArrayLength = require('./util/isValidArrayLength');
const compileTypeMatcher = require('./util/compileTypeMatcher');
/**
 * Checks whether a value is an array whose items match a type-name string or predicate.
 *
 * Matchers are required and validated before inspecting the collection. Predicates receive one
 * value with no supplied receiver and must return a synchronous primitive boolean. Empty
 * collections pass without calling predicates.
 *
 * @param {*} value The value to check.
 * @param {*} matcher A required native `typeof` name or synchronous boolean predicate for
 * collection items.
 * @returns {boolean} `true` if the value is an array and every element matches the matcher,
 * including an empty array; otherwise `false`.
 * @throws {*} `TypeError` for invalid or missing matchers, or a non-boolean predicate result.
 * Callback, property-access and native iteration errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarrayofvalue-matcher
 * @example isArrayOf([1,2], "number");    // => true
 * @example isArrayOf([1,"x"], "number");  // => false
 * @example isArrayOf([], "number");       // => true
 */
function isArrayOf(value, matcher) {
  const check = compileTypeMatcher(matcher);
  if (!isArray(value)) return false;
  const length = value.length;
  if (!isValidArrayLength(length)) return false;
  for (let index = 0; index < length; index++) if (!check(value[index])) return false;
  return true;
}
module.exports = isArrayOf;
