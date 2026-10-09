'use strict';
const path = require('node:path');
const { root } = require('./package-layout');
const { run } = require('./consumer-tools');
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && args[0] !== '--all')) throw Error('Usage: node scripts/verify.js [--all]');
  const tarball = require('./pack-package')();
  for (const command of ['test:docs', 'coverage', 'test:build']) run('npm', ['run', command], root, { inherit: true });
  run(
    process.execPath,
    [path.join(__dirname, 'test-package.js'), tarball, ...(args.includes('--all') ? ['--browser'] : [])],
    root,
    { inherit: true }
  );
  console.log('Verified tarball: ' + tarball);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
