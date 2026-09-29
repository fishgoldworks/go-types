const isArray = require('./isArray');
const isString = require('./isString');
const isMap = require('./isMap');
const isSet = require('./isSet');
const getArrayLikeLength = require('./util/getArrayLikeLength');
const isPlainObject = require('./isPlainObject');
const assertSizedInput = require('./util/assertSizedInput');
const keys = Object.keys;
const stringValueOf = String.prototype.valueOf;
const mapValues = Map.prototype.values;
const setValues = Set.prototype.values;
const nonSpace = /\S/;
/**
 * Non-consuming shallow blankness check: nullish, whitespace-only string, or supported container holding only nullish values.
 * Uses the same dispatch order and unsized-input errors as isEmpty. Map blankness concerns values, Set blankness concerns items, and dictionary blankness concerns own enumerable string-keyed values. Unsized protocol capabilities take precedence over plain-dictionary handling. Not recursive: an empty string or object inside a container is not nullish.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isBlank(" \t\n");                 // => true
 * @example isBlank([null,undefined]);        // => true
 * @example isBlank(new Map([["key",null]])); // => true
 * @example isBlank([""]);                    // => false
 * @example isBlank(0);                       // => false
 */
function isBlank(value) {
    if (value === null || value === undefined) return true;
    if (!isArray(value)) {
        if (isString(value)) return !nonSpace.test(stringValueOf.call(value));
        const map = isMap(value);
        if (map || isSet(value)) {
            // Use one brand check per collection and private native iterators.
            const values = map ? mapValues.call(value) : setValues.call(value);
            for (const item of values) if (item !== null && item !== undefined) return false;
            return true;
        }
    }
    const length = getArrayLikeLength(value);
    if (length !== undefined) {
        for (let index = 0; index < length; index++) {
            const item = value[index];
            if (item !== null && item !== undefined) return false;
        }
        return true;
    }
    assertSizedInput(value);
    if (!isPlainObject(value)) return false;
    const names = keys(value);
    for (let index = 0; index < names.length; index++) {
        const item = value[names[index]];
        if (item !== null && item !== undefined) return false;
    }
    return true;
}
module.exports = isBlank;
