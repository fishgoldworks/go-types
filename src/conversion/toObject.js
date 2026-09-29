'use strict';

const nativeObject = Object;

/**
 * Preserves objects and functions, boxes primitives, and creates an empty object for nullish input.
 * Uses native Object conversion; this is neither JSON parsing nor cloning. Non-nullish primitives become wrapper objects. Objects, arrays, functions and even revoked proxies are returned with their existing identity. Each null/undefined conversion creates a fresh ordinary object. Object-conversion hooks are not invoked.
 * @param {*} value Value to convert.
 * @returns {object}
 * @example toObject(42).valueOf();                                                   // => 42
 * @example typeof toObject(42);                                                      // => "object"
 * @example toObject(null);                                                           // => {}
 * @example (() => { const object = {x: 1}; return toObject(object) === object; })(); // => true
 */
function toObject(value) {
    return nativeObject(value);
}

module.exports = toObject;
