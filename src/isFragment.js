/**
 * Checks instanceof the available local DocumentFragment constructor.
 * Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isFragment(document.createDocumentFragment()); // => true
 * @example isFragment({nodeType:1});                      // => false
 */
function isFragment(value) {
    return typeof DocumentFragment === "function" && value instanceof DocumentFragment;
}

module.exports = isFragment;