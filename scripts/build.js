'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const esbuild = require('esbuild');
const { minify: minifyJavaScript } = require('terser');
const names = require('./exports.json');
const pkg = require('../package.json');
const root = path.join(__dirname, '..');
const { packageRoot: destination, consumerFiles } = require('./package-layout');
const banner = `(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else if (typeof define === 'function' && define.amd) define([], factory);
    else root.Types = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    var module = {exports: {}};
    var exports = module.exports;`;
const footer = 'return module.exports;\n});';

async function bundle(packageDirectory, temporary, notice) {
  const common = {
    absWorkingDir: packageDirectory,
    bundle: true,
    platform: 'browser',
    target: 'es2020',
    sourcemap: true,
    keepNames: true,
    legalComments: 'eof',
    logLevel: 'info',
    banner: { js: notice }
  };
  await esbuild.build({
    ...common,
    entryPoints: ['index.js'],
    format: 'cjs',
    target: 'node8',
    banner: { js: notice + '\n' + banner },
    footer: { js: footer },
    outfile: path.join(temporary, 'go-types.js')
  });
  await esbuild.build({
    ...common,
    entryPoints: ['index.mjs'],
    format: 'esm',
    target: 'node14',
    outfile: path.join(temporary, 'go-types.mjs')
  });
}

async function minify(temporary, notice) {
  const readable = path.join(temporary, 'go-types.js');
  const minified = await minifyJavaScript(
    { 'go-types.js': await fs.readFile(readable, 'utf8') },
    {
      ecma: 2017,
      compress: {
        // Preserve document.all and observable getters/proxy traps, as in go-equality.
        comparisons: false,
        typeofs: false,
        pure_getters: false
      },
      mangle: { properties: false },
      keep_fnames: true,
      keep_classnames: true,
      format: { comments: false, preamble: notice },
      sourceMap: {
        content: await fs.readFile(readable + '.map', 'utf8'),
        filename: 'go-types.min.js',
        url: 'go-types.min.js.map',
        includeSources: true
      }
    }
  );
  assert.equal(typeof minified.code, 'string');
  assert.equal(typeof minified.map, 'string');
  await fs.writeFile(path.join(temporary, 'go-types.min.js'), minified.code + '\n');
  await fs.writeFile(path.join(temporary, 'go-types.min.js.map'), minified.map + '\n');
}

async function verifyBundles(temporary) {
  const apis = [];
  for (const filename of ['go-types.js', 'go-types.min.js']) {
    const scope = {};
    vm.runInNewContext(await fs.readFile(path.join(temporary, filename), 'utf8'), scope);
    apis.push(scope.Types);
  }
  apis.push((await import(pathToFileURL(path.join(temporary, 'go-types.mjs')).href)).default);
  for (const api of apis) {
    assert.deepEqual(Object.keys(api).sort(), [...names].sort());
    assert.equal(api.isArrayOf([], 'number'), true);
    assert.equal(api.createTypeChecker(['number', null])(1), true);
  }
}

async function replaceDistribution(temporary) {
  const previous = temporary + '-previous';
  let hadPrevious = false;
  try {
    await fs.rename(destination, previous);
    hadPrevious = true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  try {
    await fs.rename(temporary, destination);
  } catch (error) {
    if (hadPrevious) {
      try {
        await fs.rename(previous, destination);
      } catch (restoreError) {
        // eslint-disable-next-line preserve-caught-error -- AggregateError.errors retains the original and recovery failures.
        throw new AggregateError(
          [error, restoreError],
          'Build replacement and rollback failed; previous distribution retained at ' + previous
        );
      }
    }
    throw error;
  }
  if (hadPrevious) await fs.rm(previous, { recursive: true, force: true });
}

async function copyRuntime(source, target) {
  await fs.mkdir(target, { recursive: true });
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw Error('Runtime sources must not be symbolic links: ' + entry.name);
    if (entry.isDirectory()) await copyRuntime(path.join(source, entry.name), path.join(target, entry.name));
    else if (entry.name.endsWith('.js'))
      await fs.copyFile(path.join(source, entry.name), path.join(target, entry.name));
  }
}

function validateEntries(directory) {
  const metadata = require(path.join(directory, 'package.json'));
  function targets(value) {
    if (typeof value === 'string') {
      const resolved = path.resolve(directory, value);
      assert.ok(resolved.startsWith(directory + path.sep), 'Package target escapes output: ' + value);
      assert.ok(require('node:fs').existsSync(resolved), 'Missing package target: ' + value);
    } else for (const item of Object.values(value)) targets(item);
  }
  targets(metadata.exports);
  targets(metadata.typesVersions);
  const api = require(path.join(directory, 'index.js'));
  assert.deepEqual(Object.keys(api).sort(), [...names].sort());
  for (const [alias, route] of Object.entries(metadata.exports)) {
    const target = Array.isArray(route) ? route[0] : route;
    if (alias === '.' || !target.require) continue;
    assert.equal(require(path.join(directory, alias.slice(2))), require(path.join(directory, target.require.default)));
  }
}

async function main() {
  if (process.argv.length > 2) throw Error('Usage: node scripts/build.js');
  const temporary = await fs.mkdtemp(path.join(root, '.go-types-build-'));
  let buildError;
  let buildFailed = false;
  try {
    const license = (await fs.readFile(path.join(root, 'LICENSE.md'), 'utf8')).replace(/\r\n/g, '\n').trim();
    const notice = `/*! ${pkg.name} v${pkg.version}\n\n${license}\n*/`;
    await copyRuntime(path.join(root, 'src'), path.join(temporary, 'src'));
    for (const file of consumerFiles) {
      await fs.mkdir(path.dirname(path.join(temporary, file)), { recursive: true });
      await fs.copyFile(path.join(root, file), path.join(temporary, file));
    }
    require('./generate-entries')(temporary);
    const bundles = path.join(temporary, 'dist');
    await fs.mkdir(bundles);
    await bundle(temporary, bundles, notice);
    await minify(bundles, notice);
    await verifyBundles(bundles);
    require('./test-artifacts')(temporary);
    validateEntries(temporary);
    await replaceDistribution(temporary);
  } catch (error) {
    buildError = error;
    buildFailed = true;
  }
  {
    try {
      await fs.rm(temporary, { recursive: true, force: true });
    } catch (cleanupError) {
      if (buildFailed) {
        // eslint-disable-next-line preserve-caught-error -- AggregateError.errors retains the original and recovery failures.
        throw new AggregateError(
          [buildError, cleanupError],
          (buildError instanceof Error ? buildError.message : String(buildError)) +
            '; cleanup also failed at ' +
            temporary
        );
      }
      throw cleanupError;
    }
  }
  if (buildFailed) throw buildError;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
