// Protocol capability checks must not invoke the candidate. HTMLAllCollection
// has [[Call]] despite reporting typeof "undefined"; actual undefined does not.
// This differs from the public isFunction(), which intentionally tests typeof.
function isCallable(value) {
  const type = typeof value;
  return type === 'function' || (type === 'undefined' && value !== undefined);
}
module.exports = isCallable;
