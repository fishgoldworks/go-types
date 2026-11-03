'use strict';
// All public-resolution checks use the exact installed tarball, never the checkout.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { root, packageRoot, artifactPath, consumerManifest } = require('./package-layout');
const { run } = require('./consumer-tools');
const names = require('./exports.json');
const metadata = require('../package.json');
function targets(value, output = new Set()) {
  if (typeof value === 'string') output.add(value);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) targets(item, output);
  return output;
}
function filesIn(directory, relative = '') {
  return fs.readdirSync(path.join(directory, relative), { withFileTypes: true }).flatMap((entry) => {
    assert.ok(!entry.isSymbolicLink(), 'Unexpected package symbolic link: ' + entry.name);
    const file = path.posix.join(relative, entry.name);
    return entry.isDirectory() ? filesIn(directory, file) : [file];
  });
}
function verifyFiles(directory, pkg, sourceOnly) {
  assert.equal(pkg.name, metadata.name);
  assert.equal(pkg.version, metadata.version);
  assert.equal(pkg.license, metadata.license);
  assert.deepEqual(pkg.engines, consumerManifest().engines);
  assert.equal(pkg.private, undefined, 'The generated package must be publishable.');
  assert.equal(pkg.scripts, undefined, 'Repository lifecycle hooks must not ship.');
  assert.equal(pkg.devDependencies, undefined, 'Development dependencies must not ship.');
  for (const field of ['dependencies', 'peerDependencies', 'peerDependenciesMeta', 'optionalDependencies']) {
    assert.deepEqual(pkg[field], metadata[field], 'Consumer dependency metadata differs: ' + field);
  }
  for (const retired of [
    ...[
      'toArrayIf',
      'toBigIntIf',
      'toBooleanIf',
      'toDateIf',
      'toIntegerIf',
      'toJsonIf',
      'toMapIf',
      'toNumberIf',
      'toPlainObjectIf',
      'toSetIf',
      'toStringIf',
      'toSymbolIf',
      'boxIf',
      'unboxIf',
      'toRegExpIf',
      'toPromiseIf',
      'parseJsonIf'
    ].flatMap((name) => [
      name + '.js',
      'conversion/' + name + '.js',
      'src/' + name + '.js',
      'src/conversion/' + name + '.js',
      'esm/' + name + '.mjs',
      'types/' + name + '.d.ts',
      'types/' + name + '.d.mts'
    ]),
    'asArray.js',
    'src/asArray.js',
    'esm/asArray.mjs',
    'types/asArray.d.ts',
    'types/asArray.d.mts',
    'isNonNullish.js',
    'src/isNonNullish.js',
    'esm/isNonNullish.mjs',
    'types/isNonNullish.d.ts',
    'types/isNonNullish.d.mts',
    'isObjectLike.js',
    'src/isObjectLike.js',
    'esm/isObjectLike.mjs',
    'types/isObjectLike.d.ts',
    'types/isObjectLike.d.mts',
    'isNonFunctionObject.js',
    'src/isNonFunctionObject.js',
    'esm/isNonFunctionObject.mjs',
    'types/isNonFunctionObject.d.ts',
    'types/isNonFunctionObject.d.mts',
    'ensureSetIf.js',
    'src/ensureSetIf.js',
    'ensureMap.js',
    'src/ensureMap.js',
    'ensurePlainObject.js',
    'src/ensurePlainObject.js',
    'ensureArrayIf.js',
    'src/ensureArrayIf.js',
    'esm/ensureArrayIf.mjs',
    'types/ensureArrayIf.d.ts',
    'types/ensureArrayIf.d.mts',
    'isCyclic.js',
    'src/isCyclic.js',
    'esm/isCyclic.mjs',
    'types/isCyclic.d.ts',
    'types/isCyclic.d.mts',
    'isFragment.js',
    'src/isFragment.js',
    'esm/isFragment.mjs',
    'types/isFragment.d.ts',
    'types/isFragment.d.mts',
    'isEmptyIterable.js',
    'src/isEmptyIterable.js',
    'esm/isEmptyIterable.mjs',
    'types/isEmptyIterable.d.ts',
    'types/isEmptyIterable.d.mts',
    'isBlankIterable.js',
    'src/isBlankIterable.js',
    'esm/isBlankIterable.mjs',
    'types/isBlankIterable.d.ts',
    'types/isBlankIterable.d.mts',
    'isNonEmptyArray.js',
    'src/isNonEmptyArray.js',
    'esm/isNonEmptyArray.mjs',
    'types/isNonEmptyArray.d.ts',
    'types/isNonEmptyArray.d.mts',
    'isThenable.js',
    'src/isThenable.js',
    'esm/isThenable.mjs',
    'types/isThenable.d.ts',
    'types/isThenable.d.mts',
    'isTypeOf.js',
    'src/isTypeOf.js',
    'esm/isTypeOf.mjs',
    'types/isTypeOf.d.ts',
    'types/isTypeOf.d.mts',
    'createTypeChecker.js',
    'src/createTypeChecker.js',
    'esm/createTypeChecker.mjs',
    'types/createTypeChecker.d.ts',
    'types/createTypeChecker.d.mts'
  ]) {
    assert.equal(fs.existsSync(path.join(directory, retired)), false, 'Retired public entry shipped: ' + retired);
  }
  const expected = ['.', './package.json', './dist/go-types.js', './dist/go-types.min.js', './dist/go-types.mjs'];
  for (const name of names) {
    expected.push('./' + name, './src/' + name, './src/' + name + '.js');
    if (name.startsWith('to') || ['box', 'unbox', 'parseJson'].includes(name))
      for (const prefix of ['./conversion/', './src/conversion/']) expected.push(prefix + name, prefix + name + '.js');
  }
  assert.deepEqual(Object.keys(pkg.exports).sort(), expected.sort(), 'Public alias set changed.');
  const paths = targets(pkg.exports);
  for (const file of targets(pkg.typesVersions)) paths.add('./' + file);
  for (const field of ['main', 'module', 'types', 'unpkg', 'jsdelivr']) paths.add(pkg[field]);
  for (const target of paths) {
    const resolved = path.resolve(directory, target);
    assert.ok(
      target.startsWith('./') && resolved.startsWith(directory + path.sep),
      'External package target: ' + target
    );
    if (sourceOnly && target.startsWith('./dist/')) continue;
    assert.ok(fs.existsSync(resolved), 'Missing package target: ' + target);
  }
  return paths.size;
}
function verifyDocumentation(files, installed) {
  function anchors(file) {
    const text = fs
      .readFileSync(path.join(installed, file), 'utf8')
      .replace(/\x60\x60\x60[^\n]*\n[\s\S]*?\x60\x60\x60/g, '');
    const result = new Set(),
      counts = new Map();
    for (const [, heading] of text.matchAll(/^#{1,6} (.+)$/gm)) {
      const slug = heading
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .replace(/ /g, '-');
      const count = counts.get(slug) || 0;
      result.add(slug + (count ? '-' + count : ''));
      counts.set(slug, count + 1);
    }
    return result;
  }
  for (const filename of files.filter((file) => file.endsWith('.md'))) {
    const markdown = fs.readFileSync(path.join(installed, filename), 'utf8');
    for (const match of markdown.matchAll(/\]\(([^)\s]+)\)/g)) {
      const [target, fragment] = match[1].split('#');
      if (/^[a-z]+:/i.test(target)) continue;
      const resolved = target ? path.posix.normalize(path.posix.join(path.posix.dirname(filename), target)) : filename;
      assert.ok(files.includes(resolved), 'Broken installed documentation link: ' + filename + ' -> ' + target);
      if (fragment && resolved.endsWith('.md'))
        assert.ok(
          anchors(resolved).has(fragment),
          'Broken installed documentation fragment: ' + filename + ' -> ' + match[1]
        );
    }
  }
}
async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((arg) => arg.startsWith('--')));
  for (const flag of flags)
    assert.ok(['--source-only', '--browser', '--check-files'].includes(flag), 'Unknown option: ' + flag);
  const positional = args.filter((arg) => !arg.startsWith('--'));
  assert.ok(positional.length <= 1, 'Usage: npm run test:package -- [tarball.tgz] [--browser] [--source-only]');
  const sourceOnly = flags.has('--source-only');
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  assert.equal(lock.version, metadata.version);
  assert.equal(lock.packages[''].version, metadata.version);
  assert.deepEqual(lock.packages[''].devDependencies, metadata.devDependencies);
  assert.deepEqual(lock.packages[''].engines, metadata.engines);
  if (flags.has('--check-files')) {
    assert.equal(positional.length, 0, '--check-files checks generated output, not a supplied tarball.');
    const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    console.log(JSON.stringify({ declaredTargets: verifyFiles(packageRoot, pkg, sourceOnly), filesChecked: true }));
    return;
  }
  const tarball = path.resolve(positional[0] || artifactPath());
  assert.ok(fs.existsSync(tarball), 'Missing tarball: ' + tarball + '. Run npm run pack:package first.');
  const digest = () => crypto.createHash('sha256').update(fs.readFileSync(tarball)).digest('hex');
  const sha256 = digest();
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'go-types-package-'));
  try {
    const consumer = path.join(temporary, 'consumer');
    fs.mkdirSync(consumer);
    fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    run(
      'npm',
      ['install', tarball, '--offline', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund'],
      consumer
    );
    const installed = path.join(consumer, 'node_modules', 'go-types');
    const pkg = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8'));
    const declaredTargets = verifyFiles(installed, pkg, sourceOnly);
    const files = filesIn(installed);
    for (const filename of files) {
      assert.ok(
        !/(^|\/)(drafts|test|scripts|benchmarks|bench|verification|artifacts|package|temp|\.tmp|node_modules)(\/|$)/.test(
          filename
        ),
        'Unexpected published file: ' + filename
      );
      assert.ok(
        !/^(CONTRIBUTING\.md|docs\/(DESIGN|IMPLEMENTATION|PERFORMANCE|TESTING|project-design|implementation|performance|project-testing)\.md)$/.test(
          filename
        ),
        'Maintainer documentation in package: ' + filename
      );
      assert.ok(!/\.tgz$/.test(filename), 'Nested package: ' + filename);
    }
    for (const file of ['docs/API.md', 'docs/conversions.md', 'LICENSE.md', 'README.md'])
      assert.ok(files.includes(file));
    verifyDocumentation(files, installed);
    for (const file of ['README.md', 'docs/API.md'])
      // A per-byte assertion diff can exhaust memory for stale generated guides.
      // Compare exact bytes, but report the path rather than rendering the buffers.
      assert.ok(
        fs.readFileSync(path.join(installed, file)).equals(fs.readFileSync(path.join(root, file))),
        'Packaged documentation bytes: ' + file
      );
    run(
      process.execPath,
      ['--test', path.join(root, 'test/readme.test.js'), path.join(root, 'test/documentation-examples.test.js')],
      root,
      { env: { ...process.env, GO_TYPES_DOCUMENTATION_ROOT: installed } }
    );
    const bundleBytes = sourceOnly ? undefined : require('./test-artifacts')(installed);
    for (const [fixture, destination] of [
      ['assert-api.cjs', 'assert-api.cjs'],
      ['consumer.cjs', 'runtime-consumer.cjs'],
      ['consumer.mjs', 'runtime-consumer.mjs']
    ]) {
      fs.copyFileSync(path.join(root, 'test/runtime', fixture), path.join(consumer, destination));
    }
    fs.copyFileSync(path.join(root, 'scripts/exports.json'), path.join(consumer, 'exports.json'));
    fs.copyFileSync(path.join(root, 'test/package/entrypoints.cjs'), path.join(consumer, 'entrypoints.cjs'));
    run(process.execPath, ['--test', 'entrypoints.cjs'], consumer);
    const executables = [...new Set([process.execPath, process.env.GO_TYPES_RUNTIME_NODE].filter(Boolean))];
    const runtimeChecks = [];
    for (const executable of executables) {
      const options = sourceOnly ? ['--source-only'] : [];
      const commonjs = JSON.parse(run(executable, ['runtime-consumer.cjs', ...options], consumer));
      const esm = require('./runtime-support')(commonjs.node)
        ? JSON.parse(run(executable, ['runtime-consumer.mjs', ...options], consumer))
        : undefined;
      runtimeChecks.push({ commonjs, esm });
    }
    const optionalApiChecks = require('../test/fixtures/verify-optional-apis.cjs').verifyInstalled(installed, {
      sourceOnly
    });
    const declarationChecks = require('./test-types')(consumer, executables, { sourceOnly });
    const tooltipChecks = require('./test-tooltips')(consumer);
    const treeShaking = await require('./test-tree-shaking')(consumer);
    const browser = flags.has('--browser') ? await require('./test-browser')(installed, { sourceOnly }) : undefined;
    assert.equal(digest(), sha256, 'The tested tarball changed during verification.');
    console.log(
      JSON.stringify(
        {
          mode: sourceOnly ? 'source-only' : 'release',
          tarball,
          sha256,
          version: pkg.version,
          exports: names.length,
          declaredTargets,
          packedFiles: files.length,
          runtimeChecks,
          declarationChecks,
          optionalApiChecks,
          tooltipChecks,
          treeShaking,
          browser,
          bundleBytes,
          publicationAllowlist: true,
          installedDocumentation: true
        },
        null,
        2
      )
    );
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
