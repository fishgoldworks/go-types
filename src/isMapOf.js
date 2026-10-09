const isMap = require('./isMap');
const createTypeChecker = require('./createTypeChecker');
const entries = typeof Map === 'function' ? Map.prototype.entries : undefined;
/**
 * Determines whether every Map key and value matches its respective specification.
 *
 * Validates both matchers first; empty Maps pass. Checks each key before its value. Predicates
 * must not mutate the Map. Unavailable native collection types do not prevent loading or checks of
 * other supported values. If a detected collection lacks the required native size or iteration
 * operation, the check throws `TypeError`.
 *
 * @param {*} value The value to check.
 * @param {*} [keyType] The matcher for Map keys. An omitted matcher matches `undefined`.
 * @param {*} [valueType] The matcher for Map values. An omitted matcher matches `undefined`.
 * @returns {boolean} `true` if the value is a `Map` whose keys and values match their respective
 * specifications, including an empty `Map`; otherwise `false`.
 * @throws {*} Invalid matcher configuration throws `TypeError`. Callback, property-access and
 * native instance-matching errors propagate; see Type specifications.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ismapofvalue-keytype-valuetype
 * @example isMapOf(new Map([["x",1]]), "string", "number");   // => true
 * @example isMapOf(new Map(), "string", "number");            // => true
 * @example isMapOf(new Map([[1,1]]), "string", "number");     // => false
 */
function isMapOf(value, keyType, valueType) {
  const checkKey = createTypeChecker(keyType);
  const checkValue = createTypeChecker(valueType);
  if (!isMap(value)) return false;
  if (typeof entries !== 'function') throw new TypeError('Native Map iteration is unavailable in this runtime.');
  // Native Map iteration is live. Predicates must not mutate the collection.
  for (const entry of entries.call(value)) {
    if (!checkKey(entry[0]) || !checkValue(entry[1])) return false;
  }
  return true;
}
module.exports = isMapOf;
