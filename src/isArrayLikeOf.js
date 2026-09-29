const getArrayLikeLength = require('./util/getArrayLikeLength');
const createTypeChecker = require('./createTypeChecker');
/**
 * Checks whether every element of the array-like value matches the supplied type specification.
 * Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Snapshots length once; reads values live through ordinary numeric property access. Missing indices read undefined unless inherited numeric properties provide values. Appends beyond the original length are ignored.
 * @param {*} value Value to inspect.
 * @param {*} type Matcher specification.
 * @returns {boolean}
 * @example isArrayLikeOf({0:1,length:1}, "number");   // => true
 * @example isArrayLikeOf({0:"x",length:1}, "number"); // => false
 * @example isArrayLikeOf({length:0}, "number");       // => true
 */
function isArrayLikeOf(value, type) {
    const check = createTypeChecker(type);
    const length = getArrayLikeLength(value);
    if (length === undefined) return false;
    for (let index = 0; index < length; index++) if (!check(value[index])) return false;
    return true;
}
module.exports = isArrayLikeOf;
