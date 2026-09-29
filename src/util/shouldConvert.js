'use strict';

// A skipped conversion must not inspect or coerce the input at all.
function shouldConvert(value, condition) {
    if (condition === undefined) return false;
    const result = typeof condition === 'function' ? condition(value) : condition;
    if (typeof result !== 'boolean') {
        throw new TypeError('Conversion condition must be a boolean or a synchronous boolean predicate.');
    }
    return result;
}

module.exports = shouldConvert;
