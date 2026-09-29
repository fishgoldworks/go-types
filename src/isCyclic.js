var hasCircularReference = require("./hasCircularReference");

/**
 * Detects a cycle through enumerable string-keyed properties, including inherited properties.
 * An active-ancestor edge is a cycle; repeated primitives or shared acyclic children are not. Traversal is iterative and completed shared nodes are visited once. Ignores symbols, non-enumerables and Map/Set entries. Assumes a stable graph; getters and proxy traps can run, mutate the graph or throw.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isCyclic({a:1,b:{c:1}});                           // => false
 * @example isCyclic((()=>{const x={};x.self=x;return x;})()); // => true
 */
function isCyclic(value) {
    // The helper owns root validation, including foreign/null-prototype objects.
    return hasCircularReference(value);
}

module.exports = isCyclic;
