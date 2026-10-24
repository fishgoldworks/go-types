'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
async function assertPromises(api) {
  assert.strictEqual(await api.toPromise(3), 3);
  assert.strictEqual(
    await api.toPromise({
      then(resolve) {
        resolve(4);
      }
    }),
    4
  );
  const error = new Error('adoption');
  let caught;
  try {
    await api.toPromise({
      get then() {
        throw error;
      }
    });
  } catch (failure) {
    caught = failure;
  }
  assert.strictEqual(caught, error);
}
async function main() {
  const focused = require('go-types/isArray');
  assert.strictEqual(focused([]), true);
  assert.strictEqual(
    require.cache[require.resolve('go-types')],
    undefined,
    'Focused imports must not load the namespace'
  );
  const T = require('go-types');
  assert.strictEqual(focused, T.isArray);
  for (const retired of [
    'go-types/createTypeChecker',
    'go-types/src/createTypeChecker',
    'go-types/src/createTypeChecker.js'
  ]) {
    assert.throws(
      () => require(retired),
      (error) => error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
    );
  }
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
  await assertPromises(T);
  const formats = ['commonjs'];
  if (!sourceOnly)
    for (const filename of ['go-types.js', 'go-types.min.js']) {
      const request = 'go-types/dist/' + filename;
      assertAPI(require(request));
      await assertPromises(require(request));
      const code = fs.readFileSync(require.resolve(request), 'utf8');
      const scope = vm.createContext({});
      vm.runInContext(code, scope);
      assertAPI(scope.Types, vm.runInContext('Promise', scope));
      await assertPromises(scope.Types);
      let amd;
      function define(dependencies, factory) {
        amd = factory();
      }
      define.amd = {};
      const amdScope = vm.createContext({ define });
      vm.runInContext(code, amdScope);
      assertAPI(amd, vm.runInContext('Promise', amdScope));
      await assertPromises(amd);
      formats.push(filename + ': commonjs/global/amd');
    }
  console.log(JSON.stringify({ node: process.version, exports: exportsChecked, aliases, formats }));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
