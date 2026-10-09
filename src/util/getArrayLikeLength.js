var MAX_SAFE_INTEGER = 9007199254740991;

// Validate and snapshot length once so every array-like consumer uses the
// same integer contract. Undefined means invalid; zero is a valid length.
function getArrayLikeLength(value) {
  if (value === null || value === undefined || typeof value === 'function') {
    return undefined;
  }
  var length = value.length;
  return typeof length === 'number' && length >= 0 && length <= MAX_SAFE_INTEGER && Math.floor(length) === length
    ? length
    : undefined;
}

module.exports = getArrayLikeLength;
