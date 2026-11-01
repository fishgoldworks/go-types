'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

function fixture(t, scripts) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'go-types verification-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  function write(name, contents) {
    const file = path.join(directory, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
    return file;
  }
  write('package.json', '{"private":true,"type":"commonjs"}');
  for (const name of scripts) write('scripts/' + name, fs.readFileSync(path.join(root, 'scripts', name)));
  return { directory, write };
}

function runScript(file, args = [], options = {}) {
  // These are real nested CLI tests, not child tests in the outer Node runner.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, [file, ...args], {
    encoding: 'utf8',
    timeout: 15000,
    ...options,
    env
  });
  assert.ifError(result.error);
  return result;
}

function passingTest(name) {
  return "require('node:test')('" + name + "', () => require('node:assert/strict').equal(2 + 2, 4));";
}

function testFixture(t) {
  const result = fixture(t, ['test.js']);
  result.run = (...args) => runScript(path.join(result.directory, 'scripts/test.js'), args, { cwd: os.tmpdir() });
  return result;
}

test('test runner discovers root and nested tests, excluding compile-only and consumer fixtures', (t) => {
  const f = testFixture(t);
  f.write('test/direct.test.js', passingTest('direct fixture'));
  f.write('test/compatibility/deeper/nested.test.js', passingTest('nested fixture'));
  f.write('test/types/consumer.cts', 'const compileOnly: string = "not JavaScript";');
  f.write('test/runtime/consumer.cjs', 'throw Error("consumer fixture must not be discovered");');
  f.write('test/package/entrypoints.cjs', 'throw Error("package fixture must not be discovered");');
  f.write('test/helper.js', 'throw Error("helper must not be discovered");');
  for (const folder of ['temp', '.tmp', 'nested/temp', 'nested/.tmp']) {
    f.write('test/' + folder + '/playground.test.js', 'throw Error("playground must not be discovered");');
  }
  const result = f.run('--test-reporter=tap');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /ok \d+ - direct fixture/);
  assert.match(result.stdout, /ok \d+ - nested fixture/);
  assert.match(result.stdout, /# tests 2\b/);
});

test('test runner forwards split filter and reporter options before the selected files', (t) => {
  const f = testFixture(t);
  f.write(
    'test/options.test.js',
    passingTest('selected fixture') +
      '\nrequire("node:test")("excluded fixture", () => { throw Error("must remain filtered"); });'
  );
  const result = f.run('--test-name-pattern', '^selected fixture$', '--test-reporter', 'tap');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /ok \d+ - selected fixture/);
  assert.doesNotMatch(result.stdout + result.stderr, /Error: must remain filtered/);
});

test('test runner retains explicit skip reporting rather than counting skipped callbacks as passes', (t) => {
  const f = testFixture(t);
  f.write(
    'test/skips.test.js',
    passingTest('executed fixture') +
      '\nrequire("node:test")("optional fixture", {skip: "fixture capability unavailable"},' +
      ' () => { throw Error("skipped callback ran"); });'
  );
  const result = f.run('--test-reporter=tap');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /# SKIP fixture capability unavailable/);
  assert.match(result.stdout, /# pass 1\b/);
  assert.match(result.stdout, /# skipped 1\b/);
});

for (const [name, source, diagnostic] of [
  [
    'assertion failure',
    'require("node:test")("broken assertion", () => require("node:assert/strict").fail("fixture failure"));',
    /fixture failure/
  ],
  ['module initialisation failure', 'throw Error("fixture failed to load");', /fixture failed to load/],
  ['abrupt process exit', 'process.exit(17);', /exitCode: 17/]
]) {
  test('test runner fails for ' + name, (t) => {
    const f = testFixture(t);
    f.write('test/failure.test.js', source);
    const result = f.run('--test-reporter=tap');
    assert.notEqual(result.status, 0, 'A failed child must not produce a successful command');
    assert.match(result.stdout + result.stderr, diagnostic);
  });
}

test('test runner rejects an unknown Node option', (t) => {
  const f = testFixture(t);
  f.write('test/control.test.js', passingTest('control fixture'));
  const result = f.run('--go-types-unknown-test-option');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /go-types-unknown-test-option/);
});

test('test runner fails when discovery finds no test files', (t) => {
  const f = testFixture(t);
  f.write('test/helper.js', 'module.exports = {};');
  const result = f.run('--test-reporter=tap');
  assert.notEqual(result.status, 0, 'An empty suite must not masquerade as a passing baseline');
  assert.match(result.stdout + result.stderr, /No runtime test files found/);
});

test('test runner permits a deliberate name filter that selects no cases', (t) => {
  const f = testFixture(t);
  f.write('test/control.test.js', passingTest('control fixture'));
  const result = f.run('--test-name-pattern=^intentionally absent$', '--test-reporter=tap');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.doesNotMatch(result.stdout, /ok \d+ - control fixture/);
});

test('test runner forwards coverage scope and enforces the requested line threshold', (t) => {
  const f = testFixture(t);
  f.write('src/covered.js', 'module.exports = true;\n');
  f.write('src/uncovered.js', 'module.exports = function () {\n  return false;\n};\n');
  f.write(
    'test/coverage.test.js',
    passingTest('coverage fixture') + '\nrequire("../src/covered"); require("../src/uncovered");'
  );
  const result = f.run(
    '--experimental-test-coverage',
    '--test-coverage-include=src/**',
    '--test-coverage-lines=100',
    '--test-reporter=tap'
  );
  assert.notEqual(result.status, 0, 'An uncalled function in loaded source must fail the requested coverage threshold');
  assert.match(result.stdout + result.stderr, /coverage.*(?:threshold|100)|(?:threshold|100).*coverage/i);
});

function consumerFixture(t) {
  const f = fixture(t, ['consumer-tools.js']);
  f.write('scripts/package-layout.js', "exports.packageRoot = require('node:path').join(__dirname, '../package');");
  f.write('package/package.json', '{"name":"go-types","main":"index.js"}');
  f.write('package/index.js', 'module.exports = { fixture: true };');
  return { ...f, tools: require(path.join(f.directory, 'scripts/consumer-tools.js')) };
}

test('consumer process runner preserves output, working directory and explicit environment', (t) => {
  const f = consumerFixture(t);
  const output = f.tools.run(
    process.execPath,
    ['-e', 'console.log(JSON.stringify({cwd: process.cwd(), marker: process.env.GO_TYPES_PROCESS_MARKER}));'],
    f.directory,
    { env: { GO_TYPES_PROCESS_MARKER: 'forwarded' } }
  );
  assert.deepEqual(JSON.parse(output), { cwd: fs.realpathSync(f.directory), marker: 'forwarded' });
});

test('consumer process runner rejects failed commands and preserves both output channels', (t) => {
  const f = consumerFixture(t);
  assert.throws(
    () =>
      f.tools.run(
        process.execPath,
        ['-e', 'console.log("fixture stdout"); console.error("fixture stderr"); process.exit(7);'],
        f.directory
      ),
    (error) =>
      /failed \(7\)/.test(error.message) && /fixture stdout/.test(error.message) && /fixture stderr/.test(error.message)
  );
});

test('consumer process runner rejects an executable that cannot be started', (t) => {
  const f = consumerFixture(t);
  assert.throws(() => f.tools.run(path.join(f.directory, 'missing-executable'), [], f.directory), { code: 'ENOENT' });
});

test('staged consumers remain alive until asynchronous work finishes and are then removed', async (t) => {
  const f = consumerFixture(t);
  let directory;
  const value = {};
  const result = await f.tools.withStagedConsumer(async (temporary) => {
    directory = temporary;
    await Promise.resolve();
    assert.deepEqual(require(path.join(temporary, 'node_modules/go-types')), { fixture: true });
    fs.writeFileSync(path.join(temporary, 'node_modules/go-types/index.js'), 'consumer-only change');
    return value;
  });
  assert.equal(result, value);
  assert.equal(fs.existsSync(directory), false);
  assert.equal(
    fs.readFileSync(path.join(f.directory, 'package/index.js'), 'utf8'),
    'module.exports = { fixture: true };'
  );
});

for (const asyncFailure of [false, true]) {
  test('staged consumers clean up after ' + (asyncFailure ? 'rejection' : 'a synchronous throw'), async (t) => {
    const f = consumerFixture(t);
    const failure = { message: 'original reason' };
    let directory;
    const check = (temporary) => {
      directory = temporary;
      if (asyncFailure) return Promise.reject(failure);
      throw failure;
    };
    await assert.rejects(f.tools.withStagedConsumer(check), (error) => error === failure);
    assert.equal(fs.existsSync(directory), false);
  });
}

test('staged consumer preparation rejects missing package output instead of using the source checkout', async (t) => {
  const f = consumerFixture(t);
  fs.rmSync(path.join(f.directory, 'package'), { recursive: true });
  let invoked = false;
  await assert.rejects(
    f.tools.withStagedConsumer(() => {
      invoked = true;
    }),
    /Run npm run build/
  );
  assert.equal(invoked, false);
});

test('source-only loader resolves relative dependencies once per isolated context', (t) => {
  const f = fixture(t, ['source-test-loader.js']);
  f.write('scripts/exports.json', '["first","second"]');
  f.write('scripts/source-path.js', 'module.exports = name => "src/" + name + ".js";');
  f.write('src/first.js', 'module.exports = require("./shared/value");');
  f.write('src/second.js', 'module.exports = require("./shared/value.js");');
  f.write(
    'src/shared/value.js',
    '"use strict"; globalThis.loads = (globalThis.loads || 0) + 1; module.exports = () => 42;'
  );
  for (const folder of ['src/temp', 'src/.tmp', 'src/shared/temp', 'src/shared/.tmp']) {
    f.write(folder + '/draft.js', 'invalid JavaScript playground');
  }
  const source = require(path.join(f.directory, 'scripts/source-test-loader.js'))();
  for (let i = 0; i < 2; i++) {
    const context = {};
    vm.runInNewContext(source, context);
    assert.equal(context.Types.first(), 42);
    assert.equal(context.Types.first, context.Types.second);
    assert.equal(context.loads, 1);
  }
});

test('consumer process runner enforces an explicit shorter timeout', (t) => {
  const f = consumerFixture(t);
  assert.throws(
    () => f.tools.run(process.execPath, ['-e', 'setTimeout(() => {}, 500)'], f.directory, { timeout: 75 }),
    { code: 'ETIMEDOUT' }
  );
});

test('consumer process runner rejects disabled and invalid timeout values', (t) => {
  const f = consumerFixture(t);
  for (const timeout of [0, -1, 1.5, Infinity, NaN, null, '10']) {
    assert.throws(() => f.tools.run(process.execPath, ['-e', ''], f.directory, { timeout }), {
      name: 'TypeError',
      message: 'Process timeout must be a positive integer in milliseconds.'
    });
  }
});

function deadlineFixture(t, { browserFailure = false } = {}) {
  const f = fixture(t, ['consumer-tools.js', 'verify.js']);
  const steps = path.join(f.directory, 'steps.jsonl');
  const archive = f.write('candidate.tgz', 'controlled archive');
  const record = (event) => fs.appendFileSync(steps, JSON.stringify(event) + '\n');
  const npm = f.write(
    'npm.cjs',
    "const fs=require('node:fs');fs.appendFileSync(" +
      JSON.stringify(steps) +
      ",JSON.stringify({stage:process.argv[3]})+'\\n');"
  );
  f.write(
    'scripts/test-package.js',
    [
      "const fs=require('node:fs');",
      'const steps=' + JSON.stringify(steps) + ';',
      "const record=event=>fs.appendFileSync(steps,JSON.stringify(event)+'\\n');",
      "const browser=process.argv.includes('--browser');",
      "record({stage:'package',archive:process.argv[2],browser});",
      'if(browser && ' +
        JSON.stringify(browserFailure) +
        "){console.error('controlled browser failure');process.exit(17);}",
      "const complete=()=>record({stage:'package-complete',browser});",
      'if(browser)setTimeout(complete,2200);else complete();'
    ].join('\n')
  );
  const module = { exports: {} };
  const consumerProcess = { execPath: process.execPath, env: { ...process.env, npm_execpath: npm } };
  const consumerContext = vm.createContext({
    module,
    exports: module.exports,
    process: consumerProcess,
    require(name) {
      if (name === './package-layout') return { packageRoot: path.join(f.directory, 'package') };
      if (name === 'node:child_process')
        return {
          spawnSync(command, args, options) {
            // Scale only this controlled fixture's boundary; the child processes and deadlines are real.
            return spawnSync(command, args, { ...options, timeout: options.timeout / 100, stdio: 'pipe' });
          }
        };
      return require(name);
    }
  });
  vm.runInContext(fs.readFileSync(path.join(f.directory, 'scripts/consumer-tools.js'), 'utf8'), consumerContext, {
    filename: path.join(f.directory, 'scripts/consumer-tools.js')
  });
  return {
    ...f,
    tools: module.exports,
    archive,
    verify(all) {
      const errors = [],
        messages = [],
        processState = {
          execPath: process.execPath,
          argv: [process.execPath, path.join(f.directory, 'scripts/verify.js'), ...(all ? ['--all'] : [])]
        };
      const context = vm.createContext({
        process: processState,
        __dirname: path.join(f.directory, 'scripts'),
        console: { log: (...values) => messages.push(values.join(' ')), error: (error) => errors.push(error) },
        require(name) {
          if (name === './package-layout') return { root: f.directory };
          if (name === './consumer-tools') return module.exports;
          if (name === './pack-package')
            return () => {
              record({ stage: 'pack' });
              return archive;
            };
          return require(name);
        }
      });
      vm.runInContext(fs.readFileSync(path.join(f.directory, 'scripts/verify.js'), 'utf8'), context, {
        filename: path.join(f.directory, 'scripts/verify.js')
      });
      return {
        status: processState.exitCode || 0,
        errors,
        messages,
        steps: fs
          .readFileSync(steps, 'utf8')
          .trim()
          .split('\n')
          .map((line) => JSON.parse(line))
      };
    }
  };
}

test('individual consumer commands retain the default bounded deadline', (t) => {
  const f = deadlineFixture(t);
  assert.throws(() => f.tools.run(process.execPath, ['-e', 'setTimeout(() => {}, 2200)'], f.directory), {
    code: 'ETIMEDOUT'
  });
});

test('verify:all completes healthy browser work beyond an individual command deadline', (t) => {
  const f = deadlineFixture(t),
    result = f.verify(true);
  assert.equal(result.status, 0, result.errors.map(String).join('\n'));
  assert.deepEqual(result.steps, [
    { stage: 'pack' },
    { stage: 'test:docs' },
    { stage: 'coverage' },
    { stage: 'test:build' },
    { stage: 'package', archive: f.archive, browser: true },
    { stage: 'package-complete', browser: true }
  ]);
  assert.equal(result.messages.includes('Verified tarball: ' + f.archive), true);
});

test('verify keeps its standard checks and one exact archive without requesting browsers', (t) => {
  const f = deadlineFixture(t),
    result = f.verify(false);
  assert.equal(result.status, 0, result.errors.map(String).join('\n'));
  assert.deepEqual(result.steps, [
    { stage: 'pack' },
    { stage: 'test:docs' },
    { stage: 'coverage' },
    { stage: 'test:build' },
    { stage: 'package', archive: f.archive, browser: false },
    { stage: 'package-complete', browser: false }
  ]);
});

test('verify:all propagates browser failures with the extended aggregate budget', (t) => {
  const f = deadlineFixture(t, { browserFailure: true }),
    result = f.verify(true);
  assert.equal(result.status, 1);
  assert.match(String(result.errors[0]), /failed \(17\)/);
  assert.match(String(result.errors[0]), /controlled browser failure/);
  assert.equal(
    result.steps.some((step) => step.stage === 'package' && step.browser),
    true
  );
  assert.equal(
    result.messages.some((message) => message.startsWith('Verified tarball:')),
    false
  );
});
