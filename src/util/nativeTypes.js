'use strict';

// Optional acceleration, selected once. Capability discovery can fail in a
// restricted host or process shim; that must not make the portable API unloadable.
// No static Node import, no user values, and no application callbacks are involved.
let nativeTypes;
try {
    if (typeof process === 'object' && process !== null) {
        const getBuiltinModule = process.getBuiltinModule;
        if (typeof getBuiltinModule === 'function') {
            const util = getBuiltinModule.call(process, 'node:util');
            nativeTypes = util && util.types;
        }
    }
} catch (error) {
    // Only optional host discovery is recoverable. Runtime check errors retain
    // their documented behaviour; application exceptions are never caught here.
}
module.exports = nativeTypes;
