/**
 * Checks whether a synchronous iterable is empty by advancing its iterator.
 *
 * Consumes input and may close it early, running iterator cleanup. Requires a synchronous
 * iterable; do not reuse one-shot input.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the synchronous iterable yields no items; otherwise `false`.
 * @throws {*} `TypeError` for non-iterable input. Iterator and iterator-closing errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isemptyiterablevalue
 * @example isEmptyIterable([]);                         // => true
 * @example isEmptyIterable((function*(){yield 1;})());  // => false
 */
function isEmptyIterable(value) {
  // Native iteration reads the method once and performs IteratorClose on early return.
  for (const item of value) return false;
  return true;
}
module.exports = isEmptyIterable;
