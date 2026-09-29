const isMap = require('./isMap');
const createTypeChecker = require('./createTypeChecker');
const entries = Map.prototype.entries;
/**
 * Checks all Map keys and values using separate matchers.
 * Validates both matcher configurations before inspecting the input. Checks each key before its associated value. Uses native live entry iteration, ignores overridden iterator methods, and supports foreign Maps. Predicates must not mutate the collection.
 * @param {*} value Value to inspect.
 * @param {*} keyType Matcher specification.
 * @param {*} valueType Matcher specification.
 * @returns {boolean}
 * @example isMapOf(new Map([["x",1]]), "string", "number"); // => true
 * @example isMapOf(new Map(), "string", "number");          // => true
 * @example isMapOf(new Map([[1,1]]), "string", "number");   // => false
 */
function isMapOf(value, keyType, valueType) {
    const checkKey = createTypeChecker(keyType);
    const checkValue = createTypeChecker(valueType);
    if (!isMap(value)) return false;
    // Native Map iteration is live. Predicates must not mutate the collection.
    for (const entry of entries.call(value)) {
        if (!checkKey(entry[0]) || !checkValue(entry[1])) return false;
    }
    return true;
}
module.exports = isMapOf;
