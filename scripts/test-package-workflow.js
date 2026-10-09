'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
test('an explicit missing tarball fails instead of silently repacking the checkout', () => {
  const missing = path.join(os.tmpdir(), 'go-types-missing-' + process.pid + '.tgz');
  const result = spawnSync(process.execPath, [path.join(__dirname, 'test-package.js'), missing], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    timeout: 120000
  });
  assert.notEqual(result.status, 0);
  assert.ok((result.stdout + result.stderr).includes(missing));
});

// Isolate the packing/cleanup phase with a small build fixture. Actual bundling
// and replacement are covered by test-build.js, not this fixture.
function packFixture(check) {
  const root = path.resolve(__dirname, '..');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'go-types-pack-lifecycle-'));
  try {
    fs.mkdirSync(path.join(directory, 'scripts'));
    for (const file of ['pack-package.js', 'package-layout.js', 'consumer-tools.js']) {
      fs.copyFileSync(path.join(__dirname, file), path.join(directory, 'scripts', file));
    }
    fs.copyFileSync(path.join(root, 'package.json'), path.join(directory, 'package.json'));
    fs.writeFileSync(
      path.join(directory, 'scripts/build.js'),
      `
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const metadata = require(path.join(root, 'package.json'));
if (process.env.PACK_FIXTURE_BUILD_FAIL === '1') {
  console.error('Fixture build failed');
  process.exit(23);
}
fs.mkdirSync(path.join(root, 'package'), { recursive: true });
fs.writeFileSync(path.join(root, 'package', 'package.json'),
  process.env.PACK_FIXTURE_INVALID === '1' ? '{invalid json' :
  JSON.stringify({ name: metadata.name, version: metadata.version, main: 'index.js', files: ['index.js'] }));
fs.writeFileSync(path.join(root, 'package', 'index.js'), 'module.exports = 42;\\n');
`
    );
    fs.writeFileSync(
      path.join(directory, 'cleanup.cjs'),
      `
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const remove = fs.rmSync;
fs.rmSync = function (target, options) {
  if (process.env.PACK_FIXTURE_CLEANUP_FAIL === '1' &&
      path.dirname(target) === path.join(__dirname, 'artifacts') &&
      path.basename(target).startsWith('.pack-')) {
    throw Object.assign(new Error('Fixture cleanup denied at ' + target), { code: 'EACCES' });
  }
  return remove(target, options);
};
`
    );
    const pack = (env = {}) =>
      spawnSync(
        process.execPath,
        ['--require', path.join(directory, 'cleanup.cjs'), path.join(directory, 'scripts/pack-package.js')],
        { cwd: directory, encoding: 'utf8', timeout: 30000, env: { ...process.env, ...env } }
      );
    check(directory, pack);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function preserveTarball(directory) {
  const target = require(path.join(directory, 'scripts/package-layout.js')).artifactPath();
  fs.mkdirSync(path.dirname(target));
  fs.writeFileSync(target, 'previous archive');
  return target;
}

test('packing replaces the prior tarball only after a successful real npm pack', () =>
  packFixture((directory, pack) => {
    const target = preserveTarball(directory);
    const result = pack();
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(JSON.parse(result.stdout).tarball, target);
    assert.equal(fs.readFileSync(target).subarray(0, 2).toString('hex'), '1f8b');
    assert.deepEqual(fs.readdirSync(path.dirname(target)), [path.basename(target)]);
  }));

test('packing propagates npm failure and cleans staging without overwriting the old tarball', () =>
  packFixture((directory, pack) => {
    const target = preserveTarball(directory);
    const result = pack({ PACK_FIXTURE_INVALID: '1' });
    assert.ifError(result.error);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /EJSONPARSE/);
    assert.equal(fs.readFileSync(target, 'utf8'), 'previous archive');
    assert.deepEqual(fs.readdirSync(path.dirname(target)), [path.basename(target)]);
  }));

test('packing reports both the original failure and a cleanup failure', () =>
  packFixture((directory, pack) => {
    const target = preserveTarball(directory);
    const result = pack({ PACK_FIXTURE_INVALID: '1', PACK_FIXTURE_CLEANUP_FAIL: '1' });
    assert.ifError(result.error);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /EJSONPARSE/, 'The npm failure must not be masked by cleanup');
    assert.match(result.stderr, /Fixture cleanup denied/);
    assert.match(result.stderr, /AggregateError/);
    const stage = fs.readdirSync(path.dirname(target)).find((name) => name.startsWith('.pack-'));
    assert.ok(stage);
    assert.ok(result.stderr.includes(path.join(path.dirname(target), stage)));
    assert.equal(fs.readFileSync(target, 'utf8'), 'previous archive');
  }));

test('packing fails visibly if only final staging cleanup fails', () =>
  packFixture((directory, pack) => {
    const result = pack({ PACK_FIXTURE_CLEANUP_FAIL: '1' });
    assert.ifError(result.error);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Fixture cleanup denied/);
    const target = require(path.join(directory, 'scripts/package-layout.js')).artifactPath();
    assert.equal(fs.readFileSync(target).subarray(0, 2).toString('hex'), '1f8b');
  }));

test('packing does not reach npm or cleanup after its build fails', () =>
  packFixture((directory, pack) => {
    const target = preserveTarball(directory);
    const result = pack({ PACK_FIXTURE_BUILD_FAIL: '1', PACK_FIXTURE_CLEANUP_FAIL: '1' });
    assert.ifError(result.error);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Fixture build failed/);
    assert.doesNotMatch(result.stderr, /Fixture cleanup denied/);
    assert.equal(fs.readFileSync(target, 'utf8'), 'previous archive');
    assert.deepEqual(fs.readdirSync(path.dirname(target)), [path.basename(target)]);
  }));

test('stale packaged documentation fails with a bounded file-specific diagnostic', () => {
  const root = path.resolve(__dirname, '..');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'go-types-stale-docs-'));
  try {
    for (const file of [
      'scripts',
      'src',
      'docs',
      'package.json',
      'package-lock.json',
      'index.d.ts',
      'LICENSE.md',
      'CHANGELOG.md'
    ]) {
      fs.cpSync(path.join(root, file), path.join(directory, file), { recursive: true });
    }
    // Keep the original heading/fragment set, but a small payload so the negative
    // regression does not recreate the large Buffer diff's resource exhaustion.
    const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
    const headings = readme
      .replace(/```[^\n]*\n[\s\S]*?```/g, '')
      .split('\n')
      .filter((line) => /^#{1,6} /.test(line))
      .join('\n');
    fs.writeFileSync(path.join(directory, 'README.md'), headings + '\n\n' + 'a'.repeat(256) + '\n');
    const stage = fs.mkdtempSync(path.join(directory, '.go-types-build-docs-'));
    fs.cpSync(path.join(directory, 'src'), path.join(stage, 'src'), { recursive: true });
    const { consumerFiles } = require('./package-layout');
    for (const file of consumerFiles) {
      fs.mkdirSync(path.dirname(path.join(stage, file)), { recursive: true });
      fs.copyFileSync(path.join(directory, file), path.join(stage, file));
    }
    const { run } = require('./consumer-tools');
    run(process.execPath, ['-e', 'require("./scripts/generate-entries.js")(' + JSON.stringify(stage) + ')'], directory);
    const packed = JSON.parse(
      run('npm', ['pack', stage, '--offline', '--ignore-scripts', '--json', '--pack-destination', directory], directory)
    )[0];
    fs.appendFileSync(path.join(directory, 'README.md'), 'Canonical content changed.\n');
    const result = spawnSync(
      process.execPath,
      [path.join(directory, 'scripts/test-package.js'), path.join(directory, packed.filename), '--source-only'],
      { cwd: directory, encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024, env: process.env }
    );
    assert.ifError(result.error);
    assert.equal(result.signal, null);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Packaged documentation bytes: README\.md/);
    assert.doesNotMatch(result.stderr, /Buffer\(\d+\)/, 'The verifier must not render a per-byte Buffer diff');
    assert.ok(result.stderr.length < 4000, 'The diagnostic should name the file without dumping its contents');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('source-only package verification succeeds without generated bundles', () => {
  const root = path.resolve(__dirname, '..');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'go-types-source-only-'));
  try {
    fs.mkdirSync(path.join(directory, 'scripts'));
    for (const file of ['generate-entries.js', 'package-layout.js', 'source-path.js', 'exports.json']) {
      fs.copyFileSync(path.join(__dirname, file), path.join(directory, 'scripts', file));
    }
    fs.copyFileSync(path.join(root, 'package.json'), path.join(directory, 'package.json'));
    const stage = fs.mkdtempSync(path.join(directory, '.go-types-build-source-'));
    fs.cpSync(path.join(root, 'src'), path.join(stage, 'src'), { recursive: true });
    for (const file of require('./package-layout').consumerFiles) {
      fs.mkdirSync(path.dirname(path.join(stage, file)), { recursive: true });
      fs.copyFileSync(path.join(root, file), path.join(stage, file));
    }
    const { run } = require('./consumer-tools');
    run(process.execPath, ['-e', 'require("./scripts/generate-entries.js")(' + JSON.stringify(stage) + ')'], directory);
    assert.equal(fs.existsSync(path.join(stage, 'dist')), false);
    const packed = JSON.parse(
      run('npm', ['pack', stage, '--offline', '--ignore-scripts', '--json', '--pack-destination', directory], directory)
    )[0];
    const result = JSON.parse(
      run(
        process.execPath,
        [path.join(__dirname, 'test-package.js'), path.join(directory, packed.filename), '--source-only'],
        root,
        // The verifier starts its own node:test runner; do not inherit this worker's internal context.
        { env: { NODE_TEST_CONTEXT: undefined, NODE_TEST_WORKER_ID: undefined } }
      )
    );
    assert.equal(result.mode, 'source-only');
    assert.equal(result.bundleBytes, undefined);
    assert.ok(result.declarationChecks.bundleImports > 0, 'Source-only checks still compile bundle declarations');
    for (const runtime of result.runtimeChecks) {
      assert.deepEqual(runtime.commonjs.formats, ['commonjs']);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
