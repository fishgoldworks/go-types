'use strict';

const nativeTypes = require('../util/nativeTypes');
const isObject = require('../isObject');
// Own descriptors avoid mistaking inherited Object.valueOf for a missing payload operation.
const symbolPayload = typeof Symbol === 'function' && Object.getOwnPropertyDescriptor(Symbol.prototype, 'valueOf');
const bigintPayload = typeof BigInt === 'function' && Object.getOwnPropertyDescriptor(BigInt.prototype, 'valueOf');
const operations = [
  [Boolean.prototype.valueOf, 'isBooleanObject'],
  [Number.prototype.valueOf, 'isNumberObject'],
  [String.prototype.valueOf, 'isStringObject'],
  [symbolPayload && symbolPayload.value, 'isSymbolObject'],
  [bigintPayload && bigintPayload.value, 'isBigIntObject']
];

/**
 * Extracts the primitive value from a wrapper object, leaving other values unchanged.
 *
 * Uses captured native `valueOf` intrinsics without calling custom conversion hooks. Missing
 * `Symbol` or `BigInt` unboxing support leaves those wrappers unchanged.
 *
 * @param {*} [value] The value to convert.
 * @returns {*} The wrapper’s primitive value when its native unboxing operation is available;
 * otherwise the original input.
 * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#unboxvalue
 * @example unbox(new Number(3));                                                                  // => 3
 * @example unbox(new Boolean(false));                                                             // => false
 * @example unbox(new String("text"));                                                             // => "text"
 * @example unbox(null) === null;                                                                  // => true
 * @example (() => { const value = {valueOf() {return 1;}}; return unbox(value) === value; })();   // => true
 */
function unbox(value) {
  if (!isObject(value)) return value;
  for (const operation of operations) {
    const method = operation[0];
    if (typeof method !== 'function') continue;
    const check = nativeTypes && nativeTypes[operation[1]];
    if (check) {
      if (check(value)) return method.call(value);
    } else {
      try {
        return method.call(value);
      } catch (error) {
        // Only intrinsic incompatible-receiver errors are recoverable here.
        // No user conversion method or property is read.
      }
    }
  }
  return value;
}

module.exports = unbox;
