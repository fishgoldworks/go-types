const getArrayLikeLength = require('./util/getArrayLikeLength');
const compileTypeMatcher = require('./util/compileTypeMatcher');
/**
 * Checks whether an array-like value contains only items matching a type-name string or predicate.
 *
 * Matchers are required and validated before inspecting the collection. Predicates receive one
 * value with no supplied receiver and must return a synchronous primitive boolean. Empty
 * collections pass without calling predicates.
 *
 * @param {*} value The value to check.
 * @param {*} matcher A required native `typeof` name or synchronous boolean predicate for
 * collection items.
 * @returns {boolean} `true` if the value is array-like and every indexed value matches the
 * matcher, including an empty input; otherwise `false`.
 * @throws {*} `TypeError` for invalid or missing matchers, or a non-boolean predicate result.
 * Callback, property-access and native iteration errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarraylikeofvalue-matcher
 * @example isArrayLikeOf({0:1,length:1}, "number");     // => true
 * @example isArrayLikeOf({0:"x",length:1}, "number");   // => false
 * @example isArrayLikeOf({length:0}, "number");         // => true
 */
function isArrayLikeOf(value, matcher) {
  const check = compileTypeMatcher(matcher);
  const length = getArrayLikeLength(value);
  if (length === undefined) return false;
  for (let index = 0; index < length; index++) if (!check(value[index])) return false;
  return true;
}
module.exports = isArrayLikeOf;
