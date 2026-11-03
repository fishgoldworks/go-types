'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const name = require('../package.json').name;

function fixture(run) {
  const prefix = path.join(os.tmpdir(), name + '-build-test-');
  const directory = fs.mkdtempSync(prefix);
  try {
    for (const file of [
      'package.json',
      'LICENSE.md',
      'index.js',
      'index.mjs',
      'index.d.ts',
      'src',
      'scripts',
      'README.md',
      'CHANGELOG.md',
      'docs'
    ]) {
      const source = path.join(root, file);
      if (fs.existsSync(source)) fs.cpSync(source, path.join(directory, file), { recursive: true });
    }
    fs.mkdirSync(path.join(directory, 'package'));
    fs.writeFileSync(path.join(directory, 'package', 'previous.txt'), 'previous distribution');
    fs.writeFileSync(
      path.join(directory, 'inject.cjs'),
      `
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const terser = require('terser');
const mode = process.env.GO_LIBRARY_TEST_FAILURE;
if (mode.startsWith('primitive-')) {
    const failure = [undefined, null, false, 0, ''][Number(mode.slice('primitive-'.length))];
    terser.minify = async () => { console.error("Injected " + mode + " failure"); throw failure; };
}

if (mode === 'rollback-cleanup') {
    const fail = target => {
        if (path.dirname(target) === __dirname && path.basename(target).startsWith('.go-')) {
            throw Object.assign(Error('Injected cleanup failure at ' + target), {code:'EACCES'});
        }
    };
    const remove = fs.rmSync;
    fs.rmSync = (target, options) => { fail(target); return remove(target, options); };
    const removeAsync = fsp.rm;
    fsp.rm = async (target, options) => { fail(target); return removeAsync(target, options); };
}
if (mode === 'minify' || mode === 'smoke') {
    const minify = () => {
        if (mode === 'minify') throw Error('Injected minifier failure');
        return {code:'throw Error("Injected smoke failure");', map:'{}'};
    };
    terser.minify = async () => minify();
    terser.minify_sync = minify;
}
if (mode === 'replace' || mode.startsWith('rollback')) {
    let failed = false;
    const fail = target => {
        if ((!failed || mode.startsWith('rollback')) && path.resolve(target) === path.join(__dirname, 'package')) {
            failed = true;
            throw Object.assign(Error('Injected replacement failure'), {code:'EACCES'});
        }
    };
    const rename = fs.renameSync;
    fs.renameSync = (from, to) => { fail(to); return rename(from, to); };
    const renameAsync = fsp.rename;
    fsp.rename = async (from, to) => { fail(to); return renameAsync(from, to); };
}
`
    );
    const build = (mode, args = []) =>
      spawnSync(
        process.execPath,
        ['--require', path.join(directory, 'inject.cjs'), path.join(directory, 'scripts', 'build.js'), ...args],
        {
          cwd: directory,
          encoding: 'utf8',
          timeout: 30000,
          env: { ...process.env, NODE_PATH: path.join(root, 'node_modules'), GO_LIBRARY_TEST_FAILURE: mode }
        }
      );
    run(directory, build);
    assert.deepEqual(
      fs.readdirSync(directory).filter((file) => file.startsWith('.' + name + '-build-')),
      [],
      'Temporary build directories must be cleaned'
    );
  } finally {
    assert.ok(
      path.resolve(directory).startsWith(path.resolve(prefix)),
      'Cleanup must stay in the owned fixture directory'
    );
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function assertPreserved(directory, result) {
  assert.ifError(result.error);
  assert.notEqual(result.status, 0, 'An unsuccessful build must fail');
  assert.deepEqual(fs.readdirSync(path.join(directory, 'package')), ['previous.txt']);
  assert.equal(fs.readFileSync(path.join(directory, 'package', 'previous.txt'), 'utf8'), 'previous distribution');
}

for (const mode of ['minify', 'smoke', 'replace']) {
  test(mode + ' failure preserves the previous distribution', () =>
    fixture((directory, build) => {
      const result = build(mode);
      assertPreserved(directory, result);
      const stage = mode === 'replace' ? 'replacement' : mode === 'minify' ? 'minifier' : 'smoke';
      assert.match(result.stderr, new RegExp('Injected ' + stage + ' failure'));
    })
  );
}
for (const mode of ['bundle', 'minify']) {
  test('removed ' + mode + ' mode fails without changing the distribution', () =>
    fixture((directory, build) => {
      const result = build('', [mode]);
      assertPreserved(directory, result);
      assert.match(result.stderr, /Usage: node scripts\/build\.js/);
    })
  );
}
test('one build replaces stale output with the complete distribution', () =>
  fixture((directory, build) => {
    const playgrounds = ['src/temp', 'src/.tmp', 'src/util/temp', 'src/conversion/.tmp'];
    for (const playground of playgrounds) {
      fs.mkdirSync(path.join(directory, playground), { recursive: true });
      fs.writeFileSync(path.join(directory, playground, 'test2.js'), 'local playground');
    }
    const result = build('');
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    for (const playground of playgrounds) {
      assert.equal(fs.existsSync(path.join(directory, 'package', playground)), false, playground);
      assert.equal(fs.readFileSync(path.join(directory, playground, 'test2.js'), 'utf8'), 'local playground');
    }
    const expected =
      name === 'go-types'
        ? [
            'go-types.js',
            'go-types.js.map',
            'go-types.min.js',
            'go-types.min.js.map',
            'go-types.mjs',
            'go-types.mjs.map'
          ]
        : ['go-equality.js', 'go-equality.min.js'];
    assert.deepEqual(fs.readdirSync(path.join(directory, 'package', 'dist')).sort(), expected.sort());
  }));

for (const mode of ['rollback', 'rollback-cleanup'])
  test(mode + ' failure retains a recoverable previous distribution', () =>
    fixture((directory, build) => {
      const result = build(mode);
      assert.ifError(result.error);
      assert.notEqual(result.status, 0);
      const backups = fs
        .readdirSync(directory)
        .filter((file) => file.startsWith('.' + name + '-build-') && file.endsWith('-previous'));
      assert.equal(backups.length, 1);
      const backup = path.join(directory, backups[0]);
      assert.equal(fs.readFileSync(path.join(backup, 'previous.txt'), 'utf8'), 'previous distribution');
      assert.ok(result.stderr.includes(backup), 'Failure must identify the retained backup');
      assert.ok(!fs.existsSync(path.join(directory, 'package')));
      // Demonstrate that the reported backup can be restored once the filesystem permits it.
      fs.renameSync(backup, path.join(directory, 'package'));
      if (mode === 'rollback-cleanup') {
        const staging = backup.slice(0, -'-previous'.length);
        assert.ok(
          result.stderr.includes('cleanup also failed at ' + staging),
          'Failure must also identify the staging directory'
        );
        assert.equal(path.dirname(staging), directory);
        fs.rmSync(staging, { recursive: true, force: true });
      }
    })
  );
test('a clean checkout can build without an existing distribution', () =>
  fixture((directory, build) => {
    fs.unlinkSync(path.join(directory, 'package', 'previous.txt'));
    fs.rmdirSync(path.join(directory, 'package'));
    const result = build('');
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.ok(fs.existsSync(path.join(directory, 'package', 'dist', name + '.js')));
    assert.ok(fs.existsSync(path.join(directory, 'package', 'dist', name + '.min.js')));
  }));

function contents(directory) {
  const result = {};
  function visit(relative) {
    for (const entry of fs.readdirSync(path.join(directory, relative), { withFileTypes: true })) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(file);
      else result[file] = fs.readFileSync(path.join(directory, file)).toString('base64');
    }
  }
  visit('');
  return result;
}

test('package builds are repeatable, self-contained and leave canonical inputs unchanged', () =>
  fixture((directory, build) => {
    const before = contents(path.join(directory, 'src'));
    const manifest = fs.readFileSync(path.join(directory, 'package.json'), 'utf8');
    const first = build('');
    assert.equal(first.status, 0, first.stdout + first.stderr);
    const output = path.join(directory, 'package');
    const packaged = JSON.parse(fs.readFileSync(path.join(output, 'package.json'), 'utf8'));
    assert.equal(packaged.name, 'go-types');
    assert.equal(packaged.engines.node, '>=8');
    assert.equal(packaged.private, undefined);
    assert.equal(packaged.scripts, undefined);
    assert.equal(packaged.devDependencies, undefined);
    assert.equal(Object.keys(packaged.exports).length, 295);
    assert.equal(Object.keys(packaged.typesVersions['*']).length, 293);
    assert.equal(packaged.exports['./isThenable'], undefined);
    assert.equal(packaged.typesVersions['*'].isThenable, undefined);
    assert.equal(packaged.exports['./isTypeOf'], undefined);
    assert.equal(packaged.typesVersions['*'].isTypeOf, undefined);
    assert.equal(packaged.exports['./createTypeChecker'], undefined);
    assert.equal(packaged.typesVersions['*'].createTypeChecker, undefined);
    const files = contents(output);
    for (const file of ['scripts', 'test', 'node_modules']) assert.ok(!fs.existsSync(path.join(output, file)));
    for (const file of ['README.md', 'LICENSE.md', 'index.d.ts', 'docs/API.md'])
      assert.ok(
        fs.readFileSync(path.join(output, file)).equals(fs.readFileSync(path.join(directory, file))),
        'Packaged input bytes: ' + file
      );
    fs.writeFileSync(path.join(output, 'obsolete.js'), 'stale');
    const second = build('');
    assert.equal(second.status, 0, second.stdout + second.stderr);
    assert.deepEqual(contents(output), files);
    assert.deepEqual(contents(path.join(directory, 'src')), before);
    assert.equal(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'), manifest);
    assert.ok(!fs.existsSync(path.join(directory, 'isArray.js')));
    assert.ok(!fs.existsSync(path.join(directory, 'esm')));
    assert.ok(!fs.existsSync(path.join(directory, 'types')));
  }));

test('missing consumer documentation fails assembly and preserves the last package', () =>
  fixture((directory, build) => {
    fs.unlinkSync(path.join(directory, 'README.md'));
    const result = build('');
    assertPreserved(directory, result);
    assert.match(result.stderr, /ENOENT[\s\S]*README\.md/);
  }));

test('entry generation rejects canonical and outside destinations without changing them', () =>
  fixture((directory) => {
    for (const destination of [directory, path.join(directory, 'src'), path.dirname(directory)]) {
      const result = spawnSync(
        process.execPath,
        ['-e', 'require("./scripts/generate-entries.js")(' + JSON.stringify(destination) + ')'],
        {
          cwd: directory,
          encoding: 'utf8'
        }
      );
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /staging directory/);
    }
  }));

test('removed public entries leave no generated wrappers after rebuilding', () =>
  fixture((directory, build) => {
    assert.equal(build('').status, 0);
    const inventory = path.join(directory, 'scripts', 'exports.json');
    const names = JSON.parse(fs.readFileSync(inventory, 'utf8')).filter((name) => name !== 'toSymbol');
    fs.writeFileSync(inventory, JSON.stringify(names));
    const result = build('');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    for (const file of [
      'toSymbol.js',
      'conversion/toSymbol.js',
      'src/toSymbol.js',
      'esm/toSymbol.mjs',
      'types/toSymbol.d.ts'
    ]) {
      assert.ok(!fs.existsSync(path.join(directory, 'package', file)), file);
    }
    const pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package/package.json'), 'utf8'));
    assert.equal(pkg.exports['./toSymbol'], undefined);
    assert.equal(pkg.typesVersions['*'].toSymbol, undefined);
  }));

test('a failed rebuild cannot pack the previous package', () =>
  fixture((directory) => {
    fs.unlinkSync(path.join(directory, 'README.md'));
    const result = spawnSync(process.execPath, [path.join(directory, 'scripts/pack-package.js')], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 30000,
      env: { ...process.env, NODE_PATH: path.join(root, 'node_modules') }
    });
    assertPreserved(directory, result);
    assert.ok(!fs.existsSync(path.join(directory, 'artifacts')));
  }));

test('packing the development root fails with the supported release command', () =>
  fixture((directory) => {
    const cli =
      process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
    const result = spawnSync(process.execPath, [cli, 'pack', '--offline'], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 30000
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /development root is private/);
    assert.ok(!fs.readdirSync(directory).some((file) => file.endsWith('.tgz')));
  }));

test('artefact verification rejects corrupt embedded source while accepting CRLF equivalents', () =>
  fixture((directory, build) => {
    const result = build('');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const output = path.join(directory, 'package');
    const verify = require('./test-artifacts');
    assert.doesNotThrow(() => verify(output));
    for (const filename of ['go-types.js.map', 'go-types.min.js.map', 'go-types.mjs.map']) {
      const mapPath = path.join(output, 'dist', filename);
      const original = fs.readFileSync(mapPath, 'utf8');
      const map = JSON.parse(original);
      map.sourcesContent = map.sourcesContent.map((source) => source.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));
      fs.writeFileSync(mapPath, JSON.stringify(map));
      assert.doesNotThrow(() => verify(output), filename + ': equivalent line endings must be accepted');
      map.sourcesContent[0] = '// unrelated embedded source\n';
      fs.writeFileSync(mapPath, JSON.stringify(map));
      assert.throws(
        () => verify(output),
        /source content mismatch/i,
        filename + ': corrupt embedded source must be rejected'
      );
      fs.writeFileSync(mapPath, original);
    }
  }));

for (let index = 0; index < 5; index++) {
  test('primitive build failure ' + index + ' cannot report success or replace the package', () =>
    fixture((directory, build) => {
      const result = build('primitive-' + index);
      assertPreserved(directory, result);
      assert.match(result.stderr, new RegExp('Injected primitive-' + index + ' failure'));
      assert.match(result.stderr, new RegExp(String([undefined, null, false, 0, ''][index])));
    })
  );
}

// These validator tests use the current generated package. They do not require a
// rebuild per mutation, and do not stand in for the real build tests above.
function artifactFixture(check) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'go-types-map-boundary-'));
  const output = path.join(directory, 'package');
  try {
    fs.cpSync(path.join(root, 'package'), output, { recursive: true });
    const verify = require('./test-artifacts');
    assert.doesNotThrow(() => verify(output), 'The unmodified fixture must pass first');
    check(directory, output, verify);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('source-map validator accepts packaged content and equivalent line endings', () =>
  artifactFixture((_directory, output, verify) => {
    for (const name of ['go-types.js.map', 'go-types.min.js.map', 'go-types.mjs.map']) {
      const file = path.join(output, 'dist', name);
      const map = JSON.parse(fs.readFileSync(file, 'utf8'));
      map.sourcesContent = map.sourcesContent.map((source) => source.replace(/\r?\n/g, '\r\n'));
      fs.writeFileSync(file, JSON.stringify(map));
    }
    assert.doesNotThrow(() => verify(output));
  }));

test('source-map validator rejects corrupt embedded content in every bundle format', () =>
  artifactFixture((_directory, output, verify) => {
    for (const name of ['go-types.js.map', 'go-types.min.js.map', 'go-types.mjs.map']) {
      const file = path.join(output, 'dist', name);
      const original = fs.readFileSync(file);
      const map = JSON.parse(original);
      map.sourcesContent[0] = '// not the corresponding packaged source\n';
      fs.writeFileSync(file, JSON.stringify(map));
      assert.throws(() => verify(output), /source content mismatch/i);
      fs.writeFileSync(file, original);
    }
  }));

test('source-map validator rejects map URLs outside the installed package', () =>
  artifactFixture((directory, output, verify) => {
    const file = path.join(output, 'dist/go-types.js');
    const map = JSON.parse(fs.readFileSync(file + '.map', 'utf8'));
    // Preserve resolvable, matching source contents; only the map ownership changes.
    map.sources = map.sources.map((source) => path.resolve(output, 'dist', source));
    fs.writeFileSync(path.join(directory, 'external.map'), JSON.stringify(map));
    const code = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, code.replace(/sourceMappingURL=\S+/, 'sourceMappingURL=../../external.map'));
    assert.throws(() => verify(output), /source.map.*outside|source.map.*escapes|source.map.*relative/i);
  }));

test('source-map validator rejects matching sources outside the installed package', () =>
  artifactFixture((directory, output, verify) => {
    const file = path.join(output, 'dist/go-types.js.map');
    const original = fs.readFileSync(file);
    const map = JSON.parse(original);
    const external = path.join(directory, 'external.js');
    fs.writeFileSync(external, map.sourcesContent[0]);
    for (const source of ['../../external.js', external]) {
      map.sources[0] = source;
      fs.writeFileSync(file, JSON.stringify(map));
      assert.throws(() => verify(output), /mapped source.*outside|mapped source.*escapes|mapped source.*relative/i);
    }
  }));

test('source-map validator rejects nonempty sourceRoot instead of ignoring it', () =>
  artifactFixture((_directory, output, verify) => {
    const file = path.join(output, 'dist/go-types.js.map');
    const map = JSON.parse(fs.readFileSync(file, 'utf8'));
    map.sourceRoot = 'https://example.invalid/different-source/';
    fs.writeFileSync(file, JSON.stringify(map));
    assert.throws(() => verify(output), /sourceRoot/);
    map.sourceRoot = '';
    fs.writeFileSync(file, JSON.stringify(map));
    assert.doesNotThrow(() => verify(output));
  }));

test('source-map validator rejects a removed mapping source inventory', () =>
  artifactFixture((_directory, output, verify) => {
    const file = path.join(output, 'dist/go-types.js.map');
    const map = JSON.parse(fs.readFileSync(file, 'utf8'));
    map.sources = [];
    map.sourcesContent = [];
    fs.writeFileSync(file, JSON.stringify(map));
    assert.throws(() => verify(output), /source.*empty|mapped sources/i);
  }));

test('source-map validator rejects absolute paths even to sources inside the package', () =>
  artifactFixture((_directory, output, verify) => {
    const file = path.join(output, 'dist/go-types.js.map');
    const map = JSON.parse(fs.readFileSync(file, 'utf8'));
    map.sources[0] = path.resolve(path.dirname(file), map.sources[0]);
    fs.writeFileSync(file, JSON.stringify(map));
    assert.throws(() => verify(output), /mapped source.*relative/i);
  }));

test('source-map validator rejects a source directory link escaping the package', (t) =>
  artifactFixture((directory, output, verify) => {
    const file = path.join(output, 'dist/go-types.js.map');
    const map = JSON.parse(fs.readFileSync(file, 'utf8'));
    const external = path.join(directory, 'external-sources');
    const link = path.join(output, 'mapped-sources');
    fs.mkdirSync(external);
    fs.writeFileSync(path.join(external, 'source.js'), map.sourcesContent[0]);
    try {
      // Windows junctions exercise real-path ownership without file-symlink privileges.
      fs.symlinkSync(external, link, process.platform === 'win32' ? 'junction' : 'dir');
    } catch (error) {
      if (process.platform === 'win32' && ['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) {
        t.skip('This Windows host does not permit creation of directory links');
        return;
      }
      throw error;
    }
    map.sources[0] = '../mapped-sources/source.js';
    fs.writeFileSync(file, JSON.stringify(map));
    assert.throws(() => verify(output), /mapped source.*outside/i);
  }));
