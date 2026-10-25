const isSet = require('./isSet');
const compileTypeMatcher = require('./util/compileTypeMatcher');
const values = typeof Set === 'function' ? Set.prototype.values : undefined;
/**
 * Checks whether a value is a native Set whose items match a type-name string or predicate.
 *
 * Matchers are required and validated before inspecting the collection. Predicates receive one
 * value with no supplied receiver and must return a synchronous primitive boolean. Empty
 * collections pass without calling predicates. Unavailable native constructors return `false`; a
 * detected collection without the required native iteration operation throws `TypeError`.
 *
 * @param {*} value The value to check.
 * @param {*} matcher A required native `typeof` name or synchronous boolean predicate for
 * collection items.
 * @returns {boolean} `true` if the value is a `Set` whose items all match the matcher, including
 * an empty `Set`; otherwise `false`.
 * @throws {*} `TypeError` for invalid or missing matchers, or a non-boolean predicate result.
 * Callback, property-access and native iteration errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issetofvalue-matcher
 * @example isSetOf(new Set([1,2]), "number");     // => true
 * @example isSetOf(new Set([1,"x"]), "number");   // => false
 * @example isSetOf(new Set(), "number");          // => true
 */
function isSetOf(value, matcher) {
  const check = compileTypeMatcher(matcher);
  if (!isSet(value)) return false;
  if (typeof values !== 'function') throw new TypeError('Native Set iteration is unavailable in this runtime.');
  // Native Set iteration is live. Predicates must not mutate the collection.
  for (const item of values.call(value)) if (!check(item)) return false;
  return true;
}
module.exports = isSetOf;
