'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const focused = require('go-types/isArray');
assert.strictEqual(focused([]), true);
assert.strictEqual(
  require.cache[require.resolve('go-types')],
  undefined,
  'Focused imports must not load the namespace'
);
const T = require('go-types');
assert.strictEqual(focused, T.isArray);
const pkg = require('go-types/package.json');
const assertAPI = require('./assert-api.cjs');
const sourceOnly = process.argv.indexOf('--source-only') !== -1;
let aliases = 0;
for (const alias of Object.keys(pkg.exports)) {
  const route = pkg.exports[alias];
  const target = Array.isArray(route) ? route[0] : route;
  if (alias === '.' || alias.startsWith('./dist/') || !target.require) continue;
  const name = alias.split('/').pop().replace(/\.js$/, '');
  assert.strictEqual(require('go-types/' + alias.slice(2)), T[name], alias);
  aliases++;
}
if (Number(process.versions.node.split('.')[0]) >= 14) {
  for (const name of ['go-types/src/util/hasNativeBrand', 'go-types/drafts/conversion/toNumber']) {
    assert.throws(
      () => require(name),
      (error) => error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
    );
  }
}
const exportsChecked = assertAPI(T);
const formats = ['commonjs'];
if (!sourceOnly)
  for (const filename of ['go-types.js', 'go-types.min.js']) {
    const request = 'go-types/dist/' + filename;
    assertAPI(require(request));
    const code = fs.readFileSync(require.resolve(request), 'utf8');
    const scope = vm.createContext({});
    vm.runInContext(code, scope);
    assertAPI(scope.Types, vm.runInContext('Promise', scope));
    let amd;
    function define(dependencies, factory) {
      amd = factory();
    }
    define.amd = {};
    const amdScope = vm.createContext({ define });
    vm.runInContext(code, amdScope);
    assertAPI(amd, vm.runInContext('Promise', amdScope));
    formats.push(filename + ': commonjs/global/amd');
  }
console.log(JSON.stringify({ node: process.version, exports: exportsChecked, aliases, formats }));
