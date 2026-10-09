const isIterable = require('../isIterable');
const isAsyncIterable = require('../isAsyncIterable');
const isIteratorLike = require('../isIteratorLike');
function assertSizedInput(value) {
  if (isIterable(value) || isAsyncIterable(value) || isIteratorLike(value)) {
    throw new TypeError(
      'Cannot inspect unsized protocol input without consuming it. For a synchronous iterable, use isEmptyIterable or isBlankIterable. Next-only iterators need an iterable adapter; asynchronous iteration is not supported by these helpers.'
    );
  }
}
module.exports = assertSizedInput;
