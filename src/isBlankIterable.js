/**
 * Explicitly consuming shallow blankness check for a synchronous iterable.
 * Checks raw yielded items, so a non-empty Map yields non-nullish entry arrays and is not blank, unlike isBlank(map), which checks values. Early false closes the iterator. A nullish-only infinite iterable never completes. Iteration/closing exceptions propagate.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isBlankIterable((function*(){yield null;yield undefined;})()); // => true
 * @example isBlankIterable([0]);                                          // => false
 */
function isBlankIterable(value) {
    // Consumes items until one is non-nullish or iteration completes. Not recursive.
    for (const item of value) if (item !== null && item !== undefined) return false;
    return true;
}
module.exports = isBlankIterable;
