/**
 * Checks for a callable Symbol.asyncIterator method.
 * Does not invoke the method. Checks only the explicit async protocol, not synchronous iterables that for-await-of can adapt. Method presence does not prove valid iteration.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isAsyncIterable((async function*(){})()); // => true
 * @example isAsyncIterable([]);                      // => false
 */
function isAsyncIterable(value) {
    return value !== null && value !== undefined && typeof value[Symbol.asyncIterator] === 'function';
}
module.exports = isAsyncIterable;
