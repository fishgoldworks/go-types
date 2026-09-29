const isObject = require('./isObject');
/**
 * Checks for a non-null object/function with a callable next method.
 * Does not call next and cannot distinguish synchronous from asynchronous iteration. Does not assert a correct IteratorResult return shape.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isIteratorLike({next(){}}); // => true
 * @example isIteratorLike([]);         // => false
 * @example isIteratorLike({next:1});   // => false
 */
function isIteratorLike(value) {
    return isObject(value) && typeof value.next === 'function';
}
module.exports = isIteratorLike;
