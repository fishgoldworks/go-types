'use strict';

const nativeBoolean = Boolean;

/**
 * Converts a value to a boolean using JavaScript truthiness.
 *
 * Uses truthiness rather than parsing boolean text. Does not invoke object conversion hooks.
 *
 * @param {*} [value] The value to convert.
 * @returns {boolean} `true` if the input is truthy under JavaScript boolean coercion; otherwise
 * `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobooleanvalue
 * @example toBoolean(0);                    // => false
 * @example toBoolean('false');              // => true
 * @example toBoolean(new Boolean(false));   // => true
 */
function toBoolean(value) {
  return nativeBoolean(value);
}

module.exports = toBoolean;
