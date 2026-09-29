var isString = require("./isString");
var stringValueOf = String.prototype.valueOf;
var parse = JSON.parse;

/**
 * Checks whether primitive/boxed string text parses as JSON.
 * Accepts JSON scalars as well as objects/arrays. Does not validate a schema or serialisability of arbitrary JS values. Calls captured JSON.parse and ignores boxed-string coercion overrides. Parse once directly when the parsed value is needed.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isJson("null");     // => true
 * @example isJson("[1,null]"); // => true
 * @example isJson("{bad}");    // => false
 * @example isJson({});         // => false
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
