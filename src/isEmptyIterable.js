/**
 * Explicitly consuming emptiness check for a synchronous iterable.
 * Advances until the first item or completion. Early false closes the iterator through native for-of semantics. May execute iterator return()/generator finally blocks. Rejects non-iterables. Do not reuse a one-shot iterator after the check.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isEmptyIterable([]);                        // => true
 * @example isEmptyIterable((function*(){yield 1;})()); // => false
 */
function isEmptyIterable(value) {
    // Native iteration reads the method once and performs IteratorClose on early return.
    for (const item of value) return false;
    return true;
}
module.exports = isEmptyIterable;
