const isMap = require('./isMap');
const compileTypeMatcher = require('./util/compileTypeMatcher');
const entries = typeof Map === 'function' ? Map.prototype.entries : undefined;
/**
 * Checks whether a value is a native Map whose keys and values match their type-name strings or
 * predicates.
 *
 * Matchers are required and validated before inspecting the collection. Predicates receive one
 * value with no supplied receiver and must return a synchronous primitive boolean. Empty
 * collections pass without calling predicates. Unavailable native constructors return `false`; a
 * detected collection without the required native iteration operation throws `TypeError`.
 *
 * @param {*} value The value to check.
 * @param {*} keyMatcher A required native `typeof` name or synchronous boolean predicate for Map
 * keys.
 * @param {*} valueMatcher A required native `typeof` name or synchronous boolean predicate for Map
 * values.
 * @returns {boolean} `true` if the value is a `Map` whose keys and values match their respective
 * matchers, including an empty `Map`; otherwise `false`.
 * @throws {*} `TypeError` for invalid or missing matchers, or a non-boolean predicate result.
 * Callback, property-access and native iteration errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ismapofvalue-keymatcher-valuematcher
 * @example isMapOf(new Map([["x",1]]), "string", "number");   // => true
 * @example isMapOf(new Map(), "string", "number");            // => true
 * @example isMapOf(new Map([[1,1]]), "string", "number");     // => false
 */
function isMapOf(value, keyMatcher, valueMatcher) {
  const checkKey = compileTypeMatcher(keyMatcher);
  const checkValue = compileTypeMatcher(valueMatcher);
  if (!isMap(value)) return false;
  if (typeof entries !== 'function') throw new TypeError('Native Map iteration is unavailable in this runtime.');
  // Native Map iteration is live. Predicates must not mutate the collection.
  for (const entry of entries.call(value)) {
    if (!checkKey(entry[0]) || !checkValue(entry[1])) return false;
  }
  return true;
}
module.exports = isMapOf;
