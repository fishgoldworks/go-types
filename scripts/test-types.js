'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { root } = require('./package-layout');
const { run, withStagedConsumer } = require('./consumer-tools');
const names = require('./exports.json');
function verifyTypes(consumer, executables = [process.execPath], { sourceOnly = false } = {}) {
  const installed = path.join(consumer, 'node_modules', 'go-types');
  const pkg = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8'));
  const compiler = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
  assert.ok(fs.existsSync(compiler), 'Install the locked development dependencies before declaration verification.');
  for (const filename of [
    'tsconfig.json',
    ...JSON.parse(fs.readFileSync(path.join(root, 'test/types/tsconfig.json'), 'utf8')).files
  ]) {
    fs.copyFileSync(path.join(root, 'test/types', filename), path.join(consumer, filename));
  }
  run(process.execPath, [compiler, '-p', consumer], consumer);
  run(
    process.execPath,
    [
      compiler,
      '--strict',
      '--skipLibCheck',
      'false',
      '--noEmitOnError',
      '--module',
      'NodeNext',
      '--target',
      'ES2020',
      '--lib',
      'ES2020',
      '--outDir',
      'compiled-modern',
      'runtime-safe.cts'
    ],
    consumer
  );
  run(process.execPath, ['compiled-modern/runtime-safe.cjs'], consumer);
  const assertions = (fs.readFileSync(path.join(consumer, 'runtime-safe.cts'), 'utf8').match(/^assert\(/gm) || [])
    .length;
  for (const [source, target] of [
    ['consumer.cts', 'runtime-types.cts'],
    ['callback-receivers.cts', 'callback-receivers.cts'],
    ['consumer-es2017.cts', 'runtime-es2017.cts'],
    ['bundles.cts', 'bundles.cts'],
    ['bundles-umd.mts', 'bundles-umd.mts'],
    ['bundles-esm.mts', 'bundles-esm.mts']
  ]) {
    fs.copyFileSync(path.join(root, 'test/runtime', source), path.join(consumer, target));
  }
  const aliases = Object.keys(pkg.exports).filter(
    (alias) => alias !== '.' && alias !== './package.json' && !alias.startsWith('./dist/')
  );
  const aliasTypes = [
    "import Types = require('go-types');",
    'type IsAny<T> = 0 extends (1 & T) ? true : false;',
    'type NotAny<T extends false> = T;'
  ];
  const esmAliasTypes = [
    "import Types from 'go-types';",
    'type IsAny<T> = 0 extends (1 & T) ? true : false;',
    'type NotAny<T extends false> = T;'
  ];
  for (const [index, alias] of aliases.entries()) {
    const name = path.posix.basename(alias).replace(/\.js$/, '');
    assert.ok(names.includes(name), 'Unknown public alias: ' + alias);
    aliasTypes.push(
      'import alias' + index + ' = require(' + JSON.stringify('go-types/' + alias.slice(2)) + ');',
      'const typed' + index + ': typeof Types.' + name + ' = alias' + index + ';',
      'type Checked' + index + ' = NotAny<IsAny<typeof alias' + index + '>>;',
      'if (typed' +
        index +
        ' !== Types.' +
        name +
        ') throw new Error(' +
        JSON.stringify('Alias identity: ' + alias) +
        ');'
    );
    esmAliasTypes.push(
      'import alias' + index + ' from ' + JSON.stringify('go-types/' + alias.slice(2)) + ';',
      'const typed' + index + ': typeof Types.' + name + ' = alias' + index + ';',
      'type Checked' + index + ' = NotAny<IsAny<typeof alias' + index + '>>;',
      'if (typed' +
        index +
        ' !== Types.' +
        name +
        ') throw new Error(' +
        JSON.stringify('ESM alias identity: ' + alias) +
        ');'
    );
  }
  fs.writeFileSync(path.join(consumer, 'runtime-aliases.cts'), aliasTypes.join('\n') + '\n');
  fs.writeFileSync(path.join(consumer, 'runtime-aliases.mts'), esmAliasTypes.join('\n') + '\n');
  const configurations = [];
  for (const [module, resolution] of [
    ['commonjs', 'node'],
    ['Node16', 'node16']
  ]) {
    const output = 'compiled-' + resolution;
    fs.writeFileSync(
      path.join(consumer, 'tsconfig-runtime.json'),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          esModuleInterop: true,
          noEmitOnError: true,
          skipLibCheck: false,
          module,
          moduleResolution: resolution,
          target: 'ES2017',
          lib: ['ES2017'],
          types: [],
          outDir: output
        },
        files: [
          'runtime-es2017.cts',
          'runtime-types.cts',
          'runtime-aliases.cts',
          'callback-receivers.cts',
          'bundles.cts'
        ]
      })
    );
    run(process.execPath, [compiler, '-p', 'tsconfig-runtime.json'], consumer);
    for (const executable of new Set(executables)) {
      for (const fixture of ['runtime-es2017', 'runtime-types', 'runtime-aliases', 'callback-receivers']) {
        run(executable, [output + '/' + fixture + '.cjs'], consumer);
      }
      if (!sourceOnly) run(executable, [output + '/bundles.cjs'], consumer);
    }
    configurations.push({ moduleResolution: resolution, target: 'ES2017', lib: 'ES2017', aliases: aliases.length });
  }
  fs.copyFileSync(path.join(root, 'test/runtime/consumer.cts'), path.join(consumer, 'default-import.mts'));
  fs.copyFileSync(
    path.join(root, 'test/runtime/callback-receivers.cts'),
    path.join(consumer, 'callback-receivers.mts')
  );
  run(
    process.execPath,
    [
      compiler,
      '--strict',
      '--esModuleInterop',
      '--noEmitOnError',
      '--module',
      'Node16',
      '--target',
      'ES2017',
      '--lib',
      'ES2017',
      '--outDir',
      'compiled-esm',
      'default-import.mts',
      'callback-receivers.mts',
      'runtime-aliases.mts',
      'bundles-umd.mts',
      'bundles-esm.mts'
    ],
    consumer
  );
  for (const executable of new Set(executables)) {
    const version = run(executable, ['--version'], consumer);
    if (require('./runtime-support')(version)) {
      run(executable, ['compiled-esm/default-import.mjs'], consumer);
      run(executable, ['compiled-esm/callback-receivers.mjs'], consumer);
      run(executable, ['compiled-esm/runtime-aliases.mjs'], consumer);
      if (!sourceOnly) run(executable, ['compiled-esm/bundles-umd.mjs'], consumer);
    }
    if (!sourceOnly && Number(version.trim().slice(1).split('.')[0]) >= 14) {
      run(executable, ['compiled-esm/bundles-esm.mjs'], consumer);
    }
  }
  return {
    modernRuntimeAssertions: assertions,
    configurations,
    emittedEsm: true,
    esmAliases: aliases.length,
    bundleImports: 5
  };
}
module.exports = verifyTypes;
if (require.main === module)
  withStagedConsumer((consumer) => {
    console.log(JSON.stringify(verifyTypes(consumer), null, 2));
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
