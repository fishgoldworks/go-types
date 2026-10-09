// Optional constructors and incomplete native prototypes must not break imports.
function getNativeGetter(constructor, key) {
  if (typeof constructor !== 'function') return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);
  return descriptor && typeof descriptor.get === 'function' ? descriptor.get : undefined;
}
module.exports = getNativeGetter;
