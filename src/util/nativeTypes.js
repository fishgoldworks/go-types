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
      const candidates = util && util.types;
      if (candidates) {
        nativeTypes = Object.create(null);
        // Snapshot supported capabilities once. An inaccessible member must not
        // prevent unrelated checks from loading or disable usable classifiers.
        for (const name of [
          'isBooleanObject',
          'isNumberObject',
          'isStringObject',
          'isDate',
          'isRegExp',
          'isMap',
          'isSet',
          'isWeakMap',
          'isWeakSet',
          'isArrayBuffer',
          'isSharedArrayBuffer',
          'isDataView'
        ]) {
          try {
            const check = candidates[name];
            if (typeof check === 'function') nativeTypes[name] = check;
          } catch (error) {
            // Only discovery is recoverable; selected functions run uncaught.
          }
        }
      }
    }
  }
} catch (error) {
  // Only optional host discovery is recoverable. Runtime check errors retain
  // their documented behaviour; application exceptions are never caught here.
}
module.exports = nativeTypes;
