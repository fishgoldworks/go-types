'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

// Discover files explicitly: Node can succeed when a glob matches no tests.
// Keep compile-only TypeScript and installed-consumer fixtures out of this suite.
function discover(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return ['temp', '.tmp'].includes(entry.name) ? [] : discover(filename);
    return entry.isFile() && entry.name.endsWith('.test.js') ? [filename] : [];
  });
}
const tests = discover(path.join(root, 'test')).sort();
if (tests.length === 0) throw Error('No runtime test files found under test/ (expected *.test.js).');

// Node options must precede test paths; otherwise coverage/filter flags can be ignored.
const result = spawnSync(process.execPath, ['--test', ...process.argv.slice(2), ...tests], {
  cwd: root,
  stdio: 'inherit'
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
