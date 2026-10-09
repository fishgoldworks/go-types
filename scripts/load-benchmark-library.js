'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

module.exports = function loadBenchmarkLibrary(input) {
  const resolved = path.resolve(input);
  // Resolve from inside directories so an adjacent package.json cannot shadow
  // package/. Node still honours main and its normal directory index fallback.
  if (fs.statSync(resolved, { throwIfNoEntry: false })?.isDirectory()) {
    return createRequire(path.join(resolved, 'package.json'))('./');
  }
  return require(resolved);
};
