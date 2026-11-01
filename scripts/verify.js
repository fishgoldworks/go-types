'use strict';
const path = require('node:path');
const { root } = require('./package-layout');
const { run } = require('./consumer-tools');
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && args[0] !== '--all')) throw Error('Usage: node scripts/verify.js [--all]');
  const includeBrowser = args.includes('--all');
  const tarball = require('./pack-package')();
  for (const command of ['test:docs', 'coverage', 'test:build']) run('npm', ['run', command], root, { inherit: true });
  run(
    process.execPath,
    [path.join(__dirname, 'test-package.js'), tarball, ...(includeBrowser ? ['--browser'] : [])],
    root,
    // The full browser matrix needs an aggregate budget beyond individual command limits.
    { inherit: true, ...(includeBrowser ? { timeout: 600000 } : {}) }
  );
  console.log('Verified tarball: ' + tarball);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
