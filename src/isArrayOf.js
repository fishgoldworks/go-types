const isArray = require('./isArray');
const isValidArrayLength = require('./util/isValidArrayLength');
const createTypeChecker = require('./createTypeChecker');
/**
 * Determines whether an array contains only values matching a type specification.
 *
 * Validates the matcher before inspecting the input. Empty containers pass; evaluation stops at
 * the first mismatch. Missing array positions read as `undefined` unless inherited numeric
 * properties supply values.
 *
 * @param {*} value The value to check.
 * @param {*} [type] The matcher for the value or collection items. An omitted matcher matches
 * `undefined`.
 * @returns {boolean} `true` if the value is an array and every element matches the specification,
 * including an empty array; otherwise `false`.
 * @throws {*} Invalid matcher configuration throws `TypeError`. Callback, property-access and
 * native instance-matching errors propagate; see Type specifications.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarrayofvalue-type
 * @example isArrayOf([1,2], "number");    // => true
 * @example isArrayOf([1,"x"], "number");  // => false
 * @example isArrayOf([], "number");       // => true
 */
function isArrayOf(value, type) {
  const check = createTypeChecker(type);
  if (!isArray(value)) return false;
  const length = value.length;
  if (!isValidArrayLength(length)) return false;
  for (let index = 0; index < length; index++) if (!check(value[index])) return false;
  return true;
}
module.exports = isArrayOf;
