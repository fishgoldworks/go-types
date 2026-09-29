'use strict';

const nativeBoolean = Boolean;

/**
 * Converts a value to a primitive boolean using JavaScript truthiness.
 * This is not a boolean-text parser. Nonempty strings such as 'false' and '0', arrays, and boxed false values are truthy. Object conversion hooks are not invoked. Browser document.all retains its platform-defined falsy behaviour.
 * @param {*} value Value to convert.
 * @returns {boolean}
 * @example toBoolean(0);                  // => false
 * @example toBoolean('false');            // => true
 * @example toBoolean(new Boolean(false)); // => true
 */
function toBoolean(value) {
    return nativeBoolean(value);
}

module.exports = toBoolean;
