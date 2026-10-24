'use strict';

const NativePromise = typeof Promise === 'function' ? Promise : undefined;
const nativeResolve = NativePromise && NativePromise.resolve;

/**
 * Converts a value to a native `Promise`, adopting thenables and preserving ordinary local
 * promises.
 *
 * Preserves ordinary local `Promise` identity, assimilates thenables and wraps other values.
 * Requires native `Promise.resolve`; functions are values, not callbacks.
 *
 * @param {*} [value] The value to convert.
 * @returns {Promise} A native `Promise` that adopts the input; ordinary local promises retain
 * identity.
 * @throws {*} Missing `Promise.resolve` support throws `TypeError` before input inspection. Native
 * synchronous errors propagate; native resolution failures produce rejected promises.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#topromisevalue
 * @example isPromise(toPromise(3));                                                             // => true
 * @example (() => { const value = Promise.resolve(3); return toPromise(value) === value; })();  // => true
 */
function toPromise(value) {
  if (typeof nativeResolve !== 'function') {
    throw new TypeError('toPromise requires native Promise.resolve support.');
  }
  return nativeResolve.call(NativePromise, value);
}

module.exports = toPromise;
