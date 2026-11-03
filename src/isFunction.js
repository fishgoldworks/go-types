/**
 * Checks whether JavaScript reports a value as a function.
 *
 * Includes classes and callable proxies; does not guarantee a successful call.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if `typeof value` is `"function"`; otherwise `false`.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isfunctionvalue
 * @example isFunction(() => {});          // => true
 * @example isFunction(class A {});        // => true
 * @example isFunction({call(){}});        // => false
 */
function isFunction(value) {
  return typeof value === 'function';
}

module.exports = isFunction;
