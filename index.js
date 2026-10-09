'use strict';
// Development entry: load canonical source without generated package aliases.
const sourcePath = require('./scripts/source-path');
for (const name of require('./scripts/exports.json')) exports[name] = require('./' + sourcePath(name));
