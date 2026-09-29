const isArray = require('./isArray');
const isString = require('./isString');
const isMap = require('./isMap');
const isSet = require('./isSet');
const getArrayLikeLength = require('./util/getArrayLikeLength');
const isPlainObject = require('./isPlainObject');
const assertSizedInput = require('./util/assertSizedInput');
const keys = Object.keys;
const stringValueOf = String.prototype.valueOf;
const mapSize = Object.getOwnPropertyDescriptor(Map.prototype, 'size').get;
const setSize = Object.getOwnPropertyDescriptor(Set.prototype, 'size').get;
/**
 * Non-consuming check for nullish values or empty strings, arrays/array-likes, Maps, Sets and plain dictionaries.
 * Checks strings, genuine Maps/Sets and validated array-like lengths before inspecting protocols. Unsized iterator/iterable capabilities take precedence over dictionary keys and throw TypeError without calling next or an iterator method. This also applies to plain objects that expose these capabilities. The consuming variants accept synchronous iterables only; next-only iterators need an adapter, and asynchronous iteration must be handled by the caller.
 *
 * Remaining plain dictionaries use own enumerable string keys. Other unsupported values, such as numbers or Dates, return false. Length/property getters can run; this is non-consuming, not universally side-effect-free.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isEmpty(null);                // => true
 * @example isEmpty([]);                  // => true
 * @example isEmpty(new Map());           // => true
 * @example isEmpty(Object.create(null)); // => true
 * @example isEmpty([null]);              // => false
 */
function isEmpty(value) {
    if (value === null || value === undefined) return true;
    // A real array cannot carry boxed-String or Map/Set internal slots.
    if (!isArray(value)) {
        if (isString(value)) return stringValueOf.call(value).length === 0;
        if (isMap(value)) return mapSize.call(value) === 0;
        if (isSet(value)) return setSize.call(value) === 0;
    }
    const length = getArrayLikeLength(value);
    if (length !== undefined) return length === 0;
    // A boolean must not disguise unknown iterator contents as known non-emptiness.
    assertSizedInput(value);
    return isPlainObject(value) && keys(value).length === 0;
}
module.exports = isEmpty;
