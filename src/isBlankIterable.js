/**
 * Determines whether every item yielded by a synchronous iterable is nullish by advancing its
 * iterator.
 *
 * Consumes input and may close it early. A nullish-only infinite iterable never completes. Map
 * entries are arrays, so a non-empty Map is not blank.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the synchronous iterable yields no items or only nullish items;
 * otherwise `false`.
 * @throws {*} `TypeError` for non-iterable input. Iterator and iterator-closing errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isblankiterablevalue
 * @example isBlankIterable((function*(){yield null;yield undefined;})());   // => true
 * @example isBlankIterable([0]);                                            // => false
 */
function isBlankIterable(value) {
  // Consumes items until one is non-nullish or iteration completes. Not recursive.
  for (const item of value) if (item !== null && item !== undefined) return false;
  return true;
}
module.exports = isBlankIterable;
