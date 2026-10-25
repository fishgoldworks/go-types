'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

function fixture(check) {
  const temporaryRoot = path.resolve(os.tmpdir());
  const directory = fs.mkdtempSync(path.join(temporaryRoot, 'go-types benchmark-'));
  try {
    // A neighbouring manifest must not shadow the deliberately named directory.
    fs.writeFileSync(path.join(directory, 'package.json'), '{"name":"not-the-library"}');
    const library = path.join(directory, 'package');
    fs.mkdirSync(path.join(library, 'lib'), { recursive: true });
    fs.writeFileSync(path.join(library, 'package.json'), '{"main":"lib/api.cjs"}');
    fs.writeFileSync(path.join(library, 'index.js'), 'throw Error("The declared main must be used");');
    const entry = path.join(library, 'lib/api.cjs');
    fs.writeFileSync(entry, 'module.exports = require(' + JSON.stringify(path.join(root, 'index.js')) + ');');
    check(directory, library, entry);
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), temporaryRoot);
    assert.ok(path.basename(directory).startsWith('go-types benchmark-'));
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function run(script, args) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script), ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000
  });
  assert.ifError(result.error);
  return result;
}

for (const script of [
  'benchmark-compare.js',
  'benchmark-hot-paths.js',
  'benchmark-numeric-paths.js',
  'benchmark-matcher-scaling.js',
  'benchmark-native-exceptions.js'
]) {
  test(script + ' loads a package directory using its declared main, not the adjacent manifest', () =>
    fixture((directory, library) => {
      const args = script === 'benchmark-native-exceptions.js' ? [library] : ['--worker', library];
      if (script === 'benchmark-matcher-scaling.js') args.push('12');
      const result = run(script, args);
      assert.equal(result.status, 0, result.stderr);
      const report = JSON.parse(result.stdout);
      if (script === 'benchmark-matcher-scaling.js') assert.equal(report.result, false);
      else assert.ok((report.rows || report.observations).length > 0);
    })
  );
}

test('benchmark loading retains explicit-file and extensionless-file inputs', () =>
  fixture((directory, library, entry) => {
    for (const input of [entry, path.join(directory, 'explicit')]) {
      if (input !== entry) fs.copyFileSync(entry, input + '.js');
      const result = run('benchmark-hot-paths.js', ['--worker', input]);
      assert.equal(result.status, 0, result.stderr);
      assert.ok(JSON.parse(result.stdout).rows.length > 0);
    }
  }));

test('benchmark loading retains the directory index fallback', () =>
  fixture((directory, library, entry) => {
    fs.unlinkSync(path.join(library, 'package.json'));
    fs.copyFileSync(entry, path.join(library, 'index.js'));
    const result = run('benchmark-hot-paths.js', ['--worker', library]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(JSON.parse(result.stdout).rows.length > 0);
  }));

test('matcher scaling exits unsuccessfully for worker errors while retaining the report', () =>
  fixture((directory, library, entry) => {
    const broken = path.join(directory, 'broken.cjs');
    fs.writeFileSync(broken, 'throw Error("Intentional benchmark fixture failure");');
    const result = run('benchmark-matcher-scaling.js', [broken, entry]);
    const report = JSON.parse(result.stdout);
    assert.ok(report.results.some((row) => row.error && row.error.includes('Intentional benchmark fixture failure')));
    assert.ok(report.results.some((row) => row.label === 'updated' && row.result === false));
    assert.notEqual(result.status, 0, 'Unexpected worker failures must fail the parent command');
  }));

test('matcher scaling reports an intentional worker timeout without treating it as an error', () =>
  fixture((directory, library, entry) => {
    const slow = path.join(directory, 'slow.cjs');
    fs.writeFileSync(
      slow,
      'exports.isArrayOf = (values) => {' +
        'if (values.length === 12) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);' +
        'return false; };'
    );
    const result = run('benchmark-matcher-scaling.js', [slow, entry]);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const timedOut = report.results.filter((row) => row.timeoutMilliseconds);
    assert.equal(timedOut.length, 1);
    assert.equal(timedOut[0].label, 'baseline');
    assert.equal(timedOut[0].items, 12);
    assert.ok(!report.results.some((row) => row.error));
    assert.ok(report.results.some((row) => row.label === 'updated' && row.result === false));
  }));

for (const [rounds, durations] of [
  [3, [5, 1, 3]],
  [4, [7, 1, 5, 3]],
  [5, [3, 9, 1, 7, 5]],
  [6, [11, 1, 9, 3, 7, 5]]
]) {
  test('smoke benchmark reports the median of ' + rounds + ' rounds', () =>
    fixture((directory) => {
      // Control the clock only to test the report's arithmetic, not performance.
      const preload = path.join(directory, 'clock.cjs');
      fs.writeFileSync(
        preload,
        "const { performance } = require('node:perf_hooks');\n" +
          'const durations = ' +
          JSON.stringify(durations) +
          ';\n' +
          'let calls = 0, now = 0;\n' +
          "Object.defineProperty(performance, 'now', {value() {\n" +
          '  const call = calls++;\n' +
          '  if (call % 2) now += durations[Math.floor(call / 2) % durations.length];\n' +
          '  return now;\n' +
          '}});\n'
      );
      const result = spawnSync(process.execPath, ['--require', preload, path.join(root, 'scripts/benchmark.js')], {
        cwd: root,
        encoding: 'utf8',
        timeout: 30000,
        env: { ...process.env, BENCH_ITERATIONS: '100', BENCH_ROUNDS: String(rounds) }
      });
      assert.ifError(result.error);
      assert.equal(result.status, 0, result.stderr);
      const report = JSON.parse(result.stdout);
      const expectedSamples = durations.map((duration) => duration * 10000);
      // Odd numbers in any order: the centre is rounds (3, 4, 5, 6).
      const expectedMedian = rounds * 10000;
      for (const observation of report.observations) {
        assert.deepEqual(observation.samplesNanosecondsPerCall, expectedSamples);
        assert.equal(observation.medianNanosecondsPerCall, expectedMedian, observation.name);
      }
      assert.ok(Number.isFinite(report.sink));
    })
  );
}
