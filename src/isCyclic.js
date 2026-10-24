var hasCircularReference = require('./hasCircularReference');

/**
 * Checks whether following enumerable string-keyed properties leads back to an ancestor.
 *
 * Includes inherited enumerable string keys, but ignores symbols, non-enumerable properties and
 * Map/Set entries. Getters and proxy traps may run. Internal reference tracking falls back to
 * local arrays when weak collections are unavailable; no platform globals are changed.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if enumerable string-keyed property traversal reaches an active
 * ancestor; otherwise `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#iscyclicvalue
 * @example isCyclic({a:1,b:{c:1}});                             // => false
 * @example isCyclic((()=>{const x={};x.self=x;return x;})());   // => true
 */
function isCyclic(value) {
  // The helper owns root validation, including foreign/null-prototype objects.
  return hasCircularReference(value);
}

module.exports = isCyclic;
