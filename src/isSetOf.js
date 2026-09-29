const isSet = require('./isSet');
const createTypeChecker = require('./createTypeChecker');
const values = Set.prototype.values;
/**
 * Checks whether every element of the Set matches the supplied type specification.
 * Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Uses captured native Set iteration, ignoring overridden iterator methods. Predicates must not mutate the collection: iteration is live and mutation can affect termination.
 * @param {*} value Value to inspect.
 * @param {*} type Matcher specification.
 * @returns {boolean}
 * @example isSetOf(new Set([1,2]), "number");   // => true
 * @example isSetOf(new Set([1,"x"]), "number"); // => false
 * @example isSetOf(new Set(), "number");        // => true
 */
function isSetOf(value, type) {
    const check = createTypeChecker(type);
    if (!isSet(value)) return false;
    // Native Set iteration is live. Predicates must not mutate the collection.
    for (const item of values.call(value)) if (!check(item)) return false;
    return true;
}
module.exports = isSetOf;
