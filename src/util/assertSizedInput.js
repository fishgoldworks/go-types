const isIterable = require('../isIterable');
const isAsyncIterable = require('../isAsyncIterable');
const isIteratorLike = require('../isIteratorLike');
function assertSizedInput(value) {
  if (isIterable(value) || isAsyncIterable(value) || isIteratorLike(value)) {
    throw new TypeError(
      'Cannot inspect unsized protocol input without consuming it. Handle iteration explicitly when consumption is intended.'
    );
  }
}
module.exports = assertSizedInput;
