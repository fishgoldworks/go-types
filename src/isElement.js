/**
 * Checks instanceof the available local Element constructor.
 * Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.
 * @param {*} value Value to inspect.
 * @returns {boolean}
 * @example isElement(document.createElement("div")); // => true
 * @example isElement({nodeType:1});                  // => false
 */
function isElement(value) {
    return typeof Element === "function" && value instanceof Element;
}

module.exports = isElement;