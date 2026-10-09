const getArrayLikeLength = require('./util/getArrayLikeLength');
const createTypeChecker = require('./createTypeChecker');
/**
 * Determines whether an array-like value contains only values matching a type specification.
 *
 * Validates the matcher before inspecting the input. Empty containers pass; evaluation stops at
 * the first mismatch. Missing array positions read as `undefined` unless inherited numeric
 * properties supply values.
 *
 * @param {*} value The value to check.
 * @param {*} [type] The matcher for the value or collection items. An omitted matcher matches
 * `undefined`.
 * @returns {boolean} `true` if the value is array-like and every indexed value matches the
 * specification, including an empty input; otherwise `false`.
 * @throws {*} Invalid matcher configuration throws `TypeError`. Callback, property-access and
 * native instance-matching errors propagate; see Type specifications.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarraylikeofvalue-type
 * @example isArrayLikeOf({0:1,length:1}, "number");     // => true
 * @example isArrayLikeOf({0:"x",length:1}, "number");   // => false
 * @example isArrayLikeOf({length:0}, "number");         // => true
 */
function isArrayLikeOf(value, type) {
  const check = createTypeChecker(type);
  const length = getArrayLikeLength(value);
  if (length === undefined) return false;
  for (let index = 0; index < length; index++) if (!check(value[index])) return false;
  return true;
}
module.exports = isArrayLikeOf;
