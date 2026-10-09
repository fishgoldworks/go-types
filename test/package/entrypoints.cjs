'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('go-types');
const names = require('./exports.json');
for (const name of names) {
  test('CommonJS public subpath ' + name, () => assert.equal(require('go-types/' + name), T[name]));
  test('legacy public source subpaths ' + name, () => {
    assert.equal(require('go-types/src/' + name), T[name]);
    assert.equal(require('go-types/src/' + name + '.js'), T[name]);
  });
  test('ESM public subpath ' + name, async () => assert.equal((await import('go-types/' + name)).default, T[name]));
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
  for (const name of [
    'src/util/hasNativeBrand',
    'src/hasCircularReference',
    'src/util/shouldConvert',
    'unknownFunction'
  ]) {
    assert.throws(() => require('go-types/' + name), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
  }
});

for (const name of names.filter((name) => name.startsWith('to'))) {
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
