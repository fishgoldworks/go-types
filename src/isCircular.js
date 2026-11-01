var hasCircularReference = require('./hasCircularReference');

/**
 * Checks whether a value contains a circular reference through enumerable string-keyed properties,
 * Map keys and values, or Set members.
 *
 * Includes inherited enumerable string properties and genuine Map/Set contents. Symbols,
 * non-enumerable properties and WeakMap/WeakSet entries are excluded. Getters and proxy traps may
 * run and throw; keep the graph stable. Missing native detection limits inspection to ordinary
 * properties; a recognised collection without native traversal support throws `TypeError`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if following the supported references leads back to an object already
 * on the current path; otherwise `false`.
 * @throws {*} Property getters and proxy traps may throw; their errors propagate. Requested
 * Map/Set content inspection throws `TypeError` when native traversal support is unavailable.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#iscircularvalue
 * @example isCircular({a:1,b:{c:1}});                             // => false
 * @example isCircular((()=>{const x={};x.self=x;return x;})());   // => true
 * @example isCircular(new Map([["item", {}]]));                   // => false
 * @example isCircular(new Set([{}]));                             // => false
 */
function isCircular(value) {
  // The helper owns root validation, including foreign/null-prototype objects.
  return hasCircularReference(value);
}

module.exports = isCircular;
