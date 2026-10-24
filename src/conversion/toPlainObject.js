'use strict';
const isPlainObject = require('../isPlainObject');
const { ownKeys, iteratorKey, isUnsupportedObject } = require('../util/conversionSupport');
const isCallable = require('../util/isCallable');
const isArray = Array.isArray;
const parse = JSON.parse;
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const call = Function.prototype.call;

function define(result, key, value) {
  defineProperty(result, key, { value, writable: true, enumerable: true, configurable: true });
}

function fromEntries(value) {
  const result = {};
  // Native for-of owns IteratorClose. Validation failures close the iterator;
  // protocol step failures propagate without an additional close attempt.
  for (const pair of value) {
    if (
      !isArray(pair) ||
      pair.length !== 2 ||
      !getOwnPropertyDescriptor(pair, '0') ||
      !getOwnPropertyDescriptor(pair, '1')
    ) {
      throw new TypeError('toPlainObject entries must be two-element arrays with both elements present.');
    }
    const key = pair[0];
    if (typeof key !== 'string' && typeof key !== 'symbol') {
      throw new TypeError('toPlainObject entry keys must be primitive strings or symbols.');
    }
    define(result, key, pair[1]);
  }
  return result;
}

/**
 * Converts JSON object text, a plain object, or entry pairs into a fresh plain object.
 *
 * Returns a fresh ordinary object. Copies own enumerable string and symbol properties, preserving
 * nested references. Entry pairs must be two-element arrays with string or symbol keys. Nullish
 * input throws.
 *
 * @param {*} value The value to convert.
 * @returns {object} A fresh ordinary object containing the parsed properties, copied enumerable
 * properties, or supplied entries.
 * @throws {*} Malformed JSON throws SyntaxError. Unsupported inputs, non-object JSON, malformed
 * entry pairs and unsupported keys throw TypeError. Getter, proxy and iterator errors propagate
 * without replacement.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toplainobjectvalue
 * @example toPlainObject('{"a":1}');                                                        // => {"a":1}
 * @example toPlainObject([['a', 1], ['a', 2]]);                                             // => {"a":2}
 * @example (() => { const object = {x: 1}; return toPlainObject(object) === object; })();   // => false
 */
function toPlainObject(value) {
  if (typeof value === 'string') {
    const result = parse(value);
    if (result === null || typeof result !== 'object' || isArray(result)) {
      throw new TypeError('toPlainObject JSON must contain an object at the top level.');
    }
    return result;
  }
  if (value === null || typeof value !== 'object') {
    throw new TypeError('toPlainObject requires JSON object text, a plain object, or an iterable of entries.');
  }
  if (isUnsupportedObject(value)) {
    throw new TypeError('toPlainObject does not accept boxed primitives, Dates or RegExps.');
  }
  let method;
  if (iteratorKey !== undefined) {
    method = value[iteratorKey];
    if (method !== null && method !== undefined) {
      if (!isCallable(method)) throw new TypeError('toPlainObject requires a callable synchronous iterator.');
      return fromEntries({
        [iteratorKey]() {
          return call.call(method, value);
        }
      });
    }
  } else if (isArray(value)) {
    // Language-level iteration still works without public symbol reflection.
    return fromEntries(value);
  }
  if (!isPlainObject(value)) {
    throw new TypeError('toPlainObject requires a plain object or an iterable of entries.');
  }
  const result = {};
  const keys = ownKeys(value);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const descriptor = getOwnPropertyDescriptor(value, key);
    if (descriptor && descriptor.enumerable) define(result, key, key === iteratorKey ? method : value[key]);
  }
  return result;
}
module.exports = toPlainObject;
