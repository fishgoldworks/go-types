'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('go-types');
const names = require('./exports.json');
const excludedHelpers = [
  'asArray',
  'isNonNullish',
  'isObjectLike',
  'isNonFunctionObject',
  'ensureArrayIf',
  'ensureSetIf',
  'ensureMap',
  'ensurePlainObject',
  'isCyclic',
  'isFragment',
  'isEmptyIterable',
  'isBlankIterable',
  'isNonEmptyArray',
  'isNonEmptyMap',
  'isNonEmptySet',
  'isNonEmptyPlainObject'
];
for (const name of names) {
  test('CommonJS public subpath ' + name, () => assert.equal(require('go-types/' + name), T[name]));
  test('legacy public source subpaths ' + name, () => {
    assert.equal(require('go-types/src/' + name), T[name]);
    assert.equal(require('go-types/src/' + name + '.js'), T[name]);
  });
  test('ESM public subpath ' + name, async () => {
    const entry = await import('go-types/' + name);
    assert.deepEqual(Object.keys(entry).sort(), ['default', name].sort());
    assert.equal(entry.default, T[name]);
    assert.equal(entry[name], T[name]);
  });
}
test('ESM root shares the exact CommonJS API', async () => {
  const esm = await import('go-types');
  assert.equal(esm.default, T);
  assert.deepEqual(
    Object.keys(esm)
      .filter((x) => x !== 'default')
      .sort(),
    Object.keys(T).sort()
  );
  for (const name of names) assert.equal(esm[name], T[name]);
});
test('private and unknown imports are not public entry points', () => {
  for (const name of excludedHelpers) assert.equal(Object.hasOwn(T, name), false, name);
  for (const name of [
    ...excludedHelpers,
    'src/asArray',
    'src/asArray.js',
    'src/isNonNullish',
    'src/isNonNullish.js',
    'src/isObjectLike',
    'src/isObjectLike.js',
    'src/isNonFunctionObject',
    'src/isNonFunctionObject.js',
    'src/ensureArrayIf',
    'src/ensureArrayIf.js',
    'src/util/isNonFunctionObject',
    'src/util/isNonFunctionObject.js',
    'src/isCyclic',
    'src/isCyclic.js',
    'src/isFragment',
    'src/isFragment.js',
    'src/isEmptyIterable',
    'src/isEmptyIterable.js',
    'src/isBlankIterable',
    'src/isBlankIterable.js',
    'src/isNonEmptyArray',
    'src/isNonEmptyArray.js',
    'isThenable',
    'src/isThenable',
    'src/isThenable.js',
    'isTypeOf',
    'src/isTypeOf',
    'src/isTypeOf.js',
    'createTypeChecker',
    'src/createTypeChecker',
    'src/createTypeChecker.js',
    'src/util/compileTypeMatcher',
    'src/util/hasNativeBrand',
    'src/hasCircularReference',
    'src/util/shouldConvert',
    'unknownFunction'
  ]) {
    assert.throws(() => require('go-types/' + name), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
  }
});

for (const name of names.filter(
  (name) => name.startsWith('to') || ['box', 'boxIf', 'unbox', 'unboxIf', 'parseJson', 'parseJsonIf'].includes(name)
)) {
  for (const prefix of ['conversion/', 'src/conversion/']) {
    for (const extension of ['', '.js']) {
      const request = 'go-types/' + prefix + name + extension;
      test('conversion source compatibility: ' + request, async () => {
        assert.equal(require(request), T[name]);
        assert.equal((await import(request)).default, T[name]);
      });
    }
  }
}

test('pre-exports CommonJS aliases exist physically and share implementations', () => {
  const path = require('node:path');
  const directory = path.dirname(require.resolve('go-types/package.json'));
  for (const [alias, route] of Object.entries(require('go-types/package.json').exports)) {
    const target = Array.isArray(route) ? route[0] : route;
    if (alias === '.' || alias.startsWith('./dist/') || !target.require) continue;
    assert.equal(
      require(path.join(directory, alias.slice(2))),
      require(path.join(directory, target.require.default)),
      alias
    );
  }
});

test('ESM rejects unsupported helpers and private compilation modules', async () => {
  const root = await import('go-types');
  for (const name of excludedHelpers) assert.equal(Object.hasOwn(root, name), false, name);
  assert.equal(Object.hasOwn(root, 'isTypeOf'), false);
  assert.equal(Object.hasOwn(root, 'isInstanceOf'), false);
  assert.equal(Object.hasOwn(root, 'createTypeChecker'), false);
  for (const name of [
    ...excludedHelpers,
    'src/isFragment',
    'src/isFragment.js',
    'src/isEmptyIterable',
    'src/isEmptyIterable.js',
    'src/isBlankIterable',
    'src/isBlankIterable.js',
    'src/isNonEmptyArray',
    'src/isNonEmptyArray.js',
    'isThenable',
    'src/isThenable',
    'src/isThenable.js',
    'isTypeOf',
    'src/isTypeOf',
    'src/isTypeOf.js',
    'createTypeChecker',
    'src/createTypeChecker',
    'src/createTypeChecker.js',
    'src/util/compileTypeMatcher'
  ]) {
    await assert.rejects(import('go-types/' + name), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
  }
});
