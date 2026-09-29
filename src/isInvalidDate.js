// Share Date identity and ignore overridden instance methods.
var isDate = require("./isDate");
var getTime = Date.prototype.getTime;

/**
 * Checks Date identity and NaN timestamp invalidity.
 * Foreign dates are supported; overridden instance getTime methods are ignored. Non-Dates return false.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isInvalidDate(new Date(NaN)); // => true
 * @example isInvalidDate(new Date(0));   // => false
 * @example isInvalidDate(0);             // => false
 */
function isInvalidDate(value) {
    if (!isDate(value)) {
        return false;
    }
    var time = getTime.call(value);
    return time !== time;
}

module.exports = isInvalidDate;
