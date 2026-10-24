const isSet = require('./isSet');
const compileTypeMatcher = require('./util/compileTypeMatcher');
const values = typeof Set === 'function' ? Set.prototype.values : undefined;
/**
 * Checks whether a Set contains only values matching a type specification.
 *
 * Validates the matcher before inspecting the input. Empty containers pass; evaluation stops at
 * the first mismatch. Predicates must not mutate the Set. Unavailable native collection types do
 * not prevent loading or checks of other supported values. If a detected collection lacks the
 * required native size or iteration operation, the check throws `TypeError`.
 *
 * @param {*} value The value to check.
 * @param {*} [type] The matcher for the value or collection items. An omitted matcher matches
 * `undefined`.
 * @returns {boolean} `true` if the value is a `Set` whose items all match the specification,
 * including an empty `Set`; otherwise `false`.
 * @throws {*} Invalid matcher configuration throws `TypeError`. Callback, property-access and
 * native instance-matching errors propagate; see Type specifications.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issetofvalue-type
 * @example isSetOf(new Set([1,2]), "number");     // => true
 * @example isSetOf(new Set([1,"x"]), "number");   // => false
 * @example isSetOf(new Set(), "number");          // => true
 */
function isSetOf(value, type) {
  const check = compileTypeMatcher(type);
  if (!isSet(value)) return false;
  if (typeof values !== 'function') throw new TypeError('Native Set iteration is unavailable in this runtime.');
  // Native Set iteration is live. Predicates must not mutate the collection.
  for (const item of values.call(value)) if (!check(item)) return false;
  return true;
}
module.exports = isSetOf;
