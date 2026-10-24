// Share Date identity and ignore overridden instance methods.
var isDate = require('./isDate');
var getTime = Date.prototype.getTime;

/**
 * Checks whether a genuine `Date` contains a finite timestamp.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a genuine `Date` with a finite timestamp; otherwise
 * `false`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isvaliddatevalue
 * @example isValidDate(new Date(0));      // => true
 * @example isValidDate(new Date(NaN));    // => false
 * @example isValidDate(0);                // => false
 */
function isValidDate(value) {
  if (!isDate(value)) {
    return false;
  }
  var time = getTime.call(value);
  return time === time;
}

module.exports = isValidDate;
