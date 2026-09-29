var isObject = require("./isObject");

// Preserve for-in scope: enumerable string properties, including inherited
// ones. Symbols, non-enumerable properties and collection entries remain excluded.
function enumerableKeys(value) {
    var keys = [];
    for (var key in value) {
        keys.push(key);
    }
    return keys;
}

function hasCircularReference(value) {
    if (!isObject(value)) {
        return false;
    }
    // Only an edge to an active ancestor is a cycle. A completed shared
    // descendant is safe to reuse. Do not store primitives as graph vertices.
    var active = new WeakSet();
    var completed = new WeakSet();
    var stack = [{value: value, keys: enumerableKeys(value), index: 0}];
    active.add(value);

    // Explicit frames avoid recursive stack overflow and path-array copying.
    // Traversal assumes a stable graph; getters/proxy traps can execute and throw.
    while (stack.length > 0) {
        var frame = stack[stack.length - 1];
        if (frame.index === frame.keys.length) {
            active.delete(frame.value);
            completed.add(frame.value);
            stack.pop();
            continue;
        }
        var child = frame.value[frame.keys[frame.index++]];
        if (!isObject(child)) {
            continue;
        }
        if (active.has(child)) {
            return true;
        }
        if (!completed.has(child)) {
            active.add(child);
            stack.push({value: child, keys: enumerableKeys(child), index: 0});
        }
    }
    return false;
}

module.exports = hasCircularReference;
