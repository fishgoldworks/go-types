// Internal identity cache used when WeakMap is unavailable. Values remain local to compilation.
const NativeWeakMap =
  typeof WeakMap === 'function' &&
  typeof WeakMap.prototype.get === 'function' &&
  typeof WeakMap.prototype.set === 'function'
    ? WeakMap
    : undefined;
function createReferenceMap() {
  if (NativeWeakMap) return new NativeWeakMap();
  const keys = [],
    values = [];
  return {
    get(key) {
      const index = keys.indexOf(key);
      return index === -1 ? undefined : values[index];
    },
    set(key, value) {
      const index = keys.indexOf(key);
      if (index === -1) {
        keys.push(key);
        values.push(value);
      } else values[index] = value;
    }
  };
}
module.exports = createReferenceMap;
