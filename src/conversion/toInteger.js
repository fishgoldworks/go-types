'use strict';

const toNumber = require('./toNumber');
const floor = Math.floor;
const ceil = Math.ceil;
const trunc = typeof Math.trunc === 'function' ? Math.trunc : (value) => (value < 0 ? ceil(value) : floor(value));

/**
 * Converts a value to a number and truncates it towards zero.
 *
 * Does not guarantee a finite or safe integer. Symbols and failing conversion hooks can throw.
 *
 * @param {*} [value] The value to convert.
 * @returns {number} The numeric conversion truncated towards zero; it may be `NaN` or infinite.
 * @throws {*} Symbols and failed object conversions can throw. `NaN` and infinity are returned
 * rather than rejected.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tointegervalue
 * @example toInteger('12.9');               // => 12
 * @example toInteger(-12.9);                // => -12
 * @example isNaN(toInteger('12px'));        // => true
 * @example Object.is(toInteger(-0.5), -0);  // => true
 * @example toInteger('1e3');                // => 1000
 */
function toInteger(value) {
  // Convert the whole value before truncating: '12px' must not become 12.
  return trunc(toNumber(value));
}

module.exports = toInteger;
