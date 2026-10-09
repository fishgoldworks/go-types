var isString = require('./isString');
var stringValueOf = String.prototype.valueOf;
var parse = JSON.parse;

/**
 * Determines whether primitive or boxed string text is valid JSON.
 *
 * Accepts JSON scalar text as well as objects and arrays. Does not validate a schema or
 * arbitrary-object serialisability.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is primitive or boxed string text that parses as JSON;
 * otherwise `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isjsonvalue
 * @example isJson("null");                // => true
 * @example isJson("[1,null]");            // => true
 * @example isJson("{bad}");               // => false
 * @example isJson({});                    // => false
 */
function isJson(value) {
  if (!isString(value)) {
    return false;
  }
  try {
    // Unbox the string without invoking a user-defined toString method.
    parse(stringValueOf.call(value));
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = isJson;
