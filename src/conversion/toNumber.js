'use strict';

const nativeNumber = Number;

/**
 * Converts a value to a primitive number using JavaScript’s `Number` conversion.
 *
 * May return `NaN` or infinity, lose bigint precision, round numeric text, underflow to zero, or
 * invoke object conversion hooks. Symbols throw.
 *
 * @param {*} [value] The value to convert.
 * @returns {number} The converted primitive number; it may be `NaN` or infinite.
 * @throws {*} Symbols throw `TypeError`. Object-coercion errors propagate; invalid numeric text
 * returns `NaN`.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tonumbervalue
 * @example toNumber('12.5');              // => 12.5
 * @example toNumber('0x10');              // => 16
 * @example toNumber(null);                // => 0
 * @example isNaN(toNumber('12px'));       // => true
 */
function toNumber(value) {
  return nativeNumber(value);
}

module.exports = toNumber;
