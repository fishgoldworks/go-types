/**
 * Checks instanceof the available local Node constructor.
 * Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isNode(document);     // => true
 * @example isNode({nodeType:1}); // => false
 */
function isNode(value) {
    return typeof Node === "function" && value instanceof Node;
}

module.exports = isNode;