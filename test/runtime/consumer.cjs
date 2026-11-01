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
  const pkg = require('go-types/package.json');
  const focused = {};
  for (const alias of Object.keys(pkg.exports)) {
    if (/^\.\/[A-Za-z][A-Za-z0-9]*$/.test(alias)) focused[alias.slice(2)] = require('go-types/' + alias.slice(2));
  }
  assert.strictEqual(focused.isArray([]), true);
  assert.strictEqual(
    require.cache[require.resolve('go-types')],
    undefined,
    'Focused imports must not load the namespace'
  );
  const T = require('go-types');
  for (const name of Object.keys(focused)) assert.strictEqual(focused[name], T[name]);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(T, 'isCyclic'), false);
  for (const retired of [
    'go-types/isNonNullish',
    'go-types/src/isNonNullish',
    'go-types/src/isNonNullish.js',
    'go-types/isObjectLike',
    'go-types/src/isObjectLike',
    'go-types/src/isObjectLike.js',
    'go-types/isNonFunctionObject',
    'go-types/src/isNonFunctionObject',
    'go-types/src/isNonFunctionObject.js',
    'go-types/ensureArrayIf',
    'go-types/src/ensureArrayIf',
    'go-types/src/ensureArrayIf.js',
    'go-types/isCyclic',
    'go-types/src/isCyclic',
    'go-types/src/isCyclic.js',
    'go-types/isFragment',
    'go-types/src/isFragment',
    'go-types/src/isFragment.js',
    'go-types/isEmptyIterable',
    'go-types/src/isEmptyIterable',
    'go-types/src/isEmptyIterable.js',
    'go-types/isBlankIterable',
    'go-types/src/isBlankIterable',
    'go-types/src/isBlankIterable.js',
    'go-types/isNonEmptyArray',
    'go-types/src/isNonEmptyArray',
    'go-types/src/isNonEmptyArray.js',
    'go-types/isNonEmptyMap',
    'go-types/isNonEmptySet',
    'go-types/isNonEmptyPlainObject',
    'go-types/isThenable',
    'go-types/src/isThenable',
    'go-types/src/isThenable.js',
    'go-types/isTypeOf',
    'go-types/src/isTypeOf',
    'go-types/src/isTypeOf.js',
    'go-types/createTypeChecker',
    'go-types/src/createTypeChecker',
    'go-types/src/createTypeChecker.js'
  ]) {
    assert.throws(
      () => require(retired),
      (error) => error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
    );
  }
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
