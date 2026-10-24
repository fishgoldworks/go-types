'use strict';
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const metadata = require('../package.json');
const packageRoot = path.join(root, 'package');
const consumerFiles = [
  'index.d.ts',
  'README.md',
  'LICENSE.md',
  'CHANGELOG.md',
  'docs/API.md',
  'docs/conversions.md',
  'docs/migration.md',
  'docs/runtime.md'
];
function consumerManifest(entries = {}) {
  const fields = [
    'name',
    'version',
    'description',
    'author',
    'email',
    'license',
    'keywords',
    'homepage',
    'repository',
    'bugs',
    'funding',
    'os',
    'cpu',
    'dependencies',
    'peerDependencies',
    'peerDependenciesMeta',
    'optionalDependencies',
    'publishConfig'
  ];
  const manifest = {};
  for (const field of fields) if (metadata[field] !== undefined) manifest[field] = metadata[field];
  // Consumer bundlers may omit unused modules; importing the library requires no setup.
  manifest.sideEffects = ['./dist/go-types.js', './dist/go-types.min.js'];
  Object.assign(manifest, {
    type: 'commonjs',
    engines: { node: '>=8' },
    main: './index.js',
    module: './index.mjs',
    types: './index.d.ts',
    unpkg: './dist/go-types.min.js',
    jsdelivr: './dist/go-types.min.js'
  });
  manifest.files = [
    '*.js',
    'index.mjs',
    'index.d.ts',
    'index.d.mts',
    'conversion/*.js',
    'src/**/*.js',
    'esm/*.mjs',
    'types/*.d.ts',
    'types/*.d.mts',
    'dist/',
    'CHANGELOG.md',
    'LICENSE.md',
    'docs/API.md',
    'docs/conversions.md',
    'docs/migration.md',
    'docs/runtime.md'
  ];
  Object.assign(manifest, entries);
  // Order top-level metadata only; export conditions and fallback arrays encode precedence.
  // Platform restrictions are retained extension fields after the shared manifest fields.
  const order = [
    'name',
    'version',
    'private',
    'description',
    'license',
    'author',
    'contributors',
    'email',
    'keywords',
    'homepage',
    'repository',
    'bugs',
    'funding',
    'type',
    'engines',
    'devEngines',
    'packageManager',
    'main',
    'module',
    'browser',
    'types',
    'typesVersions',
    'exports',
    'imports',
    'bin',
    'unpkg',
    'jsdelivr',
    'files',
    'sideEffects',
    'publishConfig',
    'scripts',
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
    'peerDependenciesMeta',
    'devDependencies',
    'overrides',
    'resolutions',
    'os',
    'cpu'
  ];
  for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    if (manifest[field])
      manifest[field] = Object.fromEntries(Object.entries(manifest[field]).sort(([a], [b]) => a.localeCompare(b)));
  }
  return Object.fromEntries(
    order.filter((field) => manifest[field] !== undefined).map((field) => [field, manifest[field]])
  );
}
function artifactPath() {
  const filename = metadata.name.replace(/^@/, '').replace(/\//g, '-') + '-' + metadata.version + '.tgz';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._+-]*\.tgz$/.test(filename)) throw Error('Invalid package artifact name');
  return path.join(root, 'artifacts', filename);
}
module.exports = { root, packageRoot, consumerFiles, consumerManifest, artifactPath };
