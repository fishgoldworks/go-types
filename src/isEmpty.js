const isArray = require('./isArray');
const isString = require('./isString');
const isMap = require('./isMap');
const isSet = require('./isSet');
const getArrayLikeLength = require('./util/getArrayLikeLength');
const isPlainObject = require('./isPlainObject');
const assertSizedInput = require('./util/assertSizedInput');
const keys = Object.keys;
const stringValueOf = String.prototype.valueOf;
const getNativeGetter = require('./util/getNativeGetter');
const mapSize = getNativeGetter(typeof Map === 'function' ? Map : undefined, 'size');
const setSize = getNativeGetter(typeof Set === 'function' ? Set : undefined, 'size');
/**
 * Checks whether a value is nullish, an empty string, or an empty supported collection.
 *
 * Uses lengths, collection sizes or dictionary keys. Unsized iterators and iterables throw
 * `TypeError`; getters and proxy traps may run. Unavailable native collection types do not prevent
 * loading or checks of other supported values. If a detected collection lacks the required native
 * size or iteration operation, the check throws `TypeError`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is nullish, an empty string, or an empty supported
 * collection; otherwise `false`.
 * @throws {*} `TypeError` for unsized iterators or iterables. Property getters and proxy traps may
 * throw. See Empty and blank values.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isemptyvalue
 * @example isEmpty(null);                 // => true
 * @example isEmpty([]);                   // => true
 * @example isEmpty(new Map());            // => true
 * @example isEmpty(Object.create(null));  // => true
 * @example isEmpty([null]);               // => false
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  // A real array cannot carry boxed-String or Map/Set internal slots.
  if (!isArray(value)) {
    if (isString(value)) return stringValueOf.call(value).length === 0;
    if (isMap(value)) {
      if (!mapSize) throw new TypeError('Native Map size is unavailable in this runtime.');
      return mapSize.call(value) === 0;
    }
    if (isSet(value)) {
      if (!setSize) throw new TypeError('Native Set size is unavailable in this runtime.');
      return setSize.call(value) === 0;
    }
  }
  const length = getArrayLikeLength(value);
  if (length !== undefined) return length === 0;
  // A boolean must not disguise unknown iterator contents as known non-emptiness.
  assertSizedInput(value);
  return isPlainObject(value) && keys(value).length === 0;
}
module.exports = isEmpty;
