// Array length is a primitive unsigned 32-bit integer, excluding 2**32.
// Validate exposed lengths too: a live Proxy can override the ordinary property read.
function isValidArrayLength(value) {
  return typeof value === 'number' && value >= 0 && value <= 0xffffffff && value % 1 === 0;
}
module.exports = isValidArrayLength;
