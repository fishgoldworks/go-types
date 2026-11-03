'use strict';
const isArray = require('./isArray');
const hasNativeBrand = require('./util/hasNativeBrand');
const getNativeGetter = require('./util/getNativeGetter');

const NativeSet = typeof Set === 'function' ? Set : undefined;
const prototype = NativeSet && NativeSet.prototype;
let setBrand = getNativeGetter(NativeSet, 'size');
if (!setBrand && prototype) {
  // These native receiver checks create no observable iteration of the members.
  for (const name of ['has', 'values', 'entries', 'keys']) {
    if (typeof prototype[name] === 'function') {
      setBrand = prototype[name];
      break;
    }
  }
}

/**
 * Returns an existing Set unchanged, creates a Set from array items, or treats another supplied
 * value as one member.
 *
 * Without arguments, creates a fresh empty Set; explicit `null` and `undefined` remain members.
 * Preserves Sets without consuming their members. Array input follows native Set iteration and
 * equality; other values remain single members. A preserved Set is not a copy.
 *
 * @param {*} [value] The value to normalise. Omit to create an empty Set; explicit undefined or
 * null remains one member.
 * @returns {Set} The original Set, or a new Set containing array items or one supplied member.
 * With no arguments, a new empty Set.
 * @throws {*} Missing native Set support throws TypeError before input inspection. Opaque object
 * inputs throw when all captured native identity checks are unavailable. Native construction,
 * revoked-proxy and array-iterator errors propagate; native iteration closes when adding a member
 * fails.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ensuresetvalue
 * @example ensureSet().size;                                                          // => 0
 * @example ensureSet("read").has("read");                                             // => true
 * @example toArray(ensureSet([1, 2, 1]));                                             // => [1,2]
 * @example ensureSet(null).has(null);                                                 // => true
 * @example ensureSet(undefined).has(undefined);                                       // => true
 * @example (()=>{const values=new Set([1,2]);return ensureSet(values)===values;})();  // => true
 * @example (()=>{const value={id:1};return ensureSet(value).has(value);})();          // => true
 */
function ensureSet(value) {
  if (!NativeSet) throw new TypeError('Native Set normalisation is unavailable in this runtime.');
  if (arguments.length === 0) return new NativeSet();
  if (isArray(value)) return new NativeSet(value);
  if (!setBrand && value !== null && typeof value === 'object')
    throw new TypeError('Native Set identity checks are unavailable in this runtime.');
  return hasNativeBrand(value, setBrand) ? value : new NativeSet([value]);
}

module.exports = ensureSet;
