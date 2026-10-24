const isArray = require('./isArray');
const isString = require('./isString');
const isMap = require('./isMap');
const isSet = require('./isSet');
const getArrayLikeLength = require('./util/getArrayLikeLength');
const isPlainObject = require('./isPlainObject');
const assertSizedInput = require('./util/assertSizedInput');
const keys = Object.keys;
const stringValueOf = String.prototype.valueOf;
const mapValues = typeof Map === 'function' ? Map.prototype.values : undefined;
const setValues = typeof Set === 'function' ? Set.prototype.values : undefined;
const nonSpace = /\S/;
/**
 * Checks whether a value is nullish, an empty or whitespace-only string, or a supported container
 * containing only nullish values.
 *
 * Shallow and non-consuming. Map checks inspect values. Unsized iterators and iterables throw
 * `TypeError`; getters and proxy traps may run. Unavailable native collection types do not prevent
 * loading or checks of other supported values. If a detected collection lacks the required native
 * size or iteration operation, the check throws `TypeError`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is nullish, a whitespace-only string, or a supported
 * container containing only nullish values; otherwise `false`.
 * @throws {*} `TypeError` for unsized iterators or iterables. Property getters and proxy traps may
 * throw. See Empty and blank values.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isblankvalue
 * @example isBlank(" \t\n");                  // => true
 * @example isBlank([null,undefined]);         // => true
 * @example isBlank(new Map([["key",null]]));  // => true
 * @example isBlank([""]);                     // => false
 * @example isBlank(0);                        // => false
 */
function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (!isArray(value)) {
    if (isString(value)) return !nonSpace.test(stringValueOf.call(value));
    const map = isMap(value);
    if (map || isSet(value)) {
      // Use one brand check per collection and private native iterators.
      const getValues = map ? mapValues : setValues;
      if (typeof getValues !== 'function')
        throw new TypeError('Native ' + (map ? 'Map' : 'Set') + ' iteration is unavailable in this runtime.');
      const values = getValues.call(value);
      for (const item of values) if (item !== null && item !== undefined) return false;
      return true;
    }
  }
  const length = getArrayLikeLength(value);
  if (length !== undefined) {
    for (let index = 0; index < length; index++) {
      const item = value[index];
      if (item !== null && item !== undefined) return false;
    }
    return true;
  }
  assertSizedInput(value);
  if (!isPlainObject(value)) return false;
  const names = keys(value);
  for (let index = 0; index < names.length; index++) {
    const item = value[names[index]];
    if (item !== null && item !== undefined) return false;
  }
  return true;
}
module.exports = isBlank;
