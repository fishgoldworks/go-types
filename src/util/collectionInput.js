'use strict';
const isPlainObject = require('../isPlainObject');
const isObjectLike = require('../isObjectLike');
const isCallable = require('./isCallable');
const getArrayLikeLength = require('./getArrayLikeLength');
const { ownKeys, iteratorKey, isUnsupportedObject } = require('./conversionSupport');
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const call = Function.prototype.call;

// Delay inspection until the native consumer has checked its capabilities/adder.
// for-of preserves original iterator errors and performs closing on consumer errors.
function* collectionInput(value, entries, maxLength) {
  if (typeof value !== 'string' && (!isObjectLike(value) || isUnsupportedObject(value))) {
    throw new TypeError('Collection conversion requires a supported iterable, record or array-like object.');
  }
  if (iteratorKey === undefined) {
    // Intrinsic language iteration remains available even if Symbol and reflection are removed.
    for (const item of value) yield item;
    return;
  }
  const method = value[iteratorKey];
  if (method !== null && method !== undefined) {
    if (!isCallable(method)) throw new TypeError('Collection conversion requires a callable synchronous iterator.');
    const iterable = {
      [iteratorKey]() {
        return call.call(method, value);
      }
    };
    for (const item of iterable) yield item;
    return;
  }
  if (isPlainObject(value)) {
    const keys = ownKeys(value);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const descriptor = getOwnPropertyDescriptor(value, key);
      if (descriptor && descriptor.enumerable) {
        const item = key === iteratorKey ? method : value[key];
        yield entries ? [key, item] : item;
      }
    }
    return;
  }
  if (!entries) {
    const length = getArrayLikeLength(value);
    if (length !== undefined) {
      if (maxLength !== undefined && length > maxLength)
        throw new RangeError('Array length exceeds the supported range.');
      for (let i = 0; i < length; i++) yield value[i];
      return;
    }
  }
  throw new TypeError('Collection conversion requires a supported iterable, record or array-like object.');
}
module.exports = collectionInput;
