const isObject = require('../isObject');
const numberValueOf = Number.prototype.valueOf;
const nativeTypes = require('./nativeTypes');
const isNumberObject =
  nativeTypes && typeof nativeTypes.isNumberObject === 'function' ? nativeTypes.isNumberObject : undefined;

// Undefined is a rejection sentinel, not NaN: a real Number payload can be NaN.
// Resolve the backend once. Native classification avoids exception-driven object
// rejection on Node; the intrinsic fallback keeps identical portable semantics.
function nativeNumberValue(value) {
  if (typeof value === 'number') return value;
  return isNumberObject(value) ? numberValueOf.call(value) : undefined;
}

function intrinsicNumberValue(value) {
  if (typeof value === 'number') return value;
  if (!isObject(value)) return undefined;
  try {
    return numberValueOf.call(value);
  } catch (error) {
    return undefined;
  }
}
module.exports = isNumberObject ? nativeNumberValue : intrinsicNumberValue;
