'use strict';

const NativeObject = Object;

/**
 * Wraps non-nullish primitives in their native wrapper objects, preserving objects and nullish
 * values.
 *
 * Does not call conversion hooks. Existing objects and functions, `null` and `undefined` are
 * returned unchanged.
 *
 * @param {*} [value] The value to convert.
 * @returns {Object|null|undefined} A native wrapper for a non-nullish primitive; otherwise the
 * original object, function or nullish input.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#boxvalue
 * @example box(3).valueOf();                                              // => 3
 * @example box(false).valueOf();                                          // => false
 * @example box(null) === null;                                            // => true
 * @example box() === undefined;                                           // => true
 * @example (() => { const value = {}; return box(value) === value; })();  // => true
 */
function box(value) {
  return value === null || value === undefined ? value : NativeObject(value);
}

module.exports = box;
