// Share Date identity and ignore overridden instance methods.
var isDate = require('./isDate');
var getTime = Date.prototype.getTime;

/**
 * Checks whether a value is a `Date` with a `NaN` timestamp.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value is a `Date` with a `NaN` timestamp; otherwise `false`.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isinvaliddatevalue
 * @example isInvalidDate(new Date(NaN));  // => true
 * @example isInvalidDate(new Date(0));    // => false
 * @example isInvalidDate(0);              // => false
 */
function isInvalidDate(value) {
  if (!isDate(value)) {
    return false;
  }
  var time = getTime.call(value);
  return time !== time;
}

module.exports = isInvalidDate;
