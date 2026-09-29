var isObject = require("../isObject");

// A captured, non-mutating native method validates its receiver's internal
// brand across realms. Only use receiver-checking intrinsics here, never user
// callbacks: rejecting their incompatible receiver must not hide application bugs.
function hasNativeBrand(value, method) {
    if (!isObject(value) || typeof method !== "function") {
        return false;
    }
    try {
        method.call(value);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = hasNativeBrand;
