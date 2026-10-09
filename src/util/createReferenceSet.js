// Internal identity bookkeeping; these stores never escape a single traversal.
const NativeWeakSet =
  typeof WeakSet === 'function' &&
  typeof WeakSet.prototype.has === 'function' &&
  typeof WeakSet.prototype.add === 'function' &&
  typeof WeakSet.prototype.delete === 'function'
    ? WeakSet
    : undefined;
function createReferenceSet() {
  if (NativeWeakSet) return new NativeWeakSet();
  const values = [];
  return {
    has(value) {
      return values.indexOf(value) !== -1;
    },
    add(value) {
      if (values.indexOf(value) === -1) values.push(value);
    },
    delete(value) {
      const index = values.indexOf(value);
      if (index !== -1) values.splice(index, 1);
    }
  };
}
module.exports = createReferenceSet;
