// Share Date identity and ignore overridden instance methods.
var isDate = require("./isDate");
var getTime = Date.prototype.getTime;

/**
 * Checks Date identity and finite timestamp validity.
 * Foreign dates are supported; overridden instance getTime methods are ignored. Non-Dates return false.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isValidDate(new Date(0));   // => true
 * @example isValidDate(new Date(NaN)); // => false
 * @example isValidDate(0);             // => false
 */
function isValidDate(value) {
    if (!isDate(value)) {
        return false;
    }
    var time = getTime.call(value);
    return time === time;
}

module.exports = isValidDate;
