'use strict';

const nativeObject = Object;

/**
 * Converts a value to an object, preserving existing objects and functions.
 *
 * Preserves existing object/function identity. Nullish input creates a fresh empty object;
 * conversion hooks are not invoked.
 *
 * @param {*} [value] The value to convert.
 * @returns {object} The original object or function, a boxed primitive, or a fresh empty object
 * for nullish input.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toobjectvalue
 * @example toObject(42).valueOf();                                                    // => 42
 * @example typeof toObject(42);                                                       // => "object"
 * @example toObject(null);                                                            // => {}
 * @example (() => { const object = {x: 1}; return toObject(object) === object; })();  // => true
 */
function toObject(value) {
  return nativeObject(value);
}

module.exports = toObject;
