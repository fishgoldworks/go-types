const isArray = require('./isArray');
const isValidArrayLength = require('./util/isValidArrayLength');
const createTypeChecker = require('./createTypeChecker');
/**
 * Checks whether every element of the array matches the supplied type specification.
 * Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Snapshots length once; reads values live through ordinary numeric property access. Missing indices read undefined unless inherited numeric properties provide values. Appends beyond the original length are ignored. An invalid exposed array length (for example from a Proxy) returns false.
 * @param {*} value Value to inspect.
 * @param {*} type Matcher specification.
 * @returns {boolean}
 * @example isArrayOf([1,2], "number");   // => true
 * @example isArrayOf([1,"x"], "number"); // => false
 * @example isArrayOf([], "number");      // => true
 */
function isArrayOf(value, type) {
    const check = createTypeChecker(type);
    if (!isArray(value)) return false;
    const length = value.length;
    if (!isValidArrayLength(length)) return false;
    for (let index = 0; index < length; index++) if (!check(value[index])) return false;
    return true;
}
module.exports = isArrayOf;
