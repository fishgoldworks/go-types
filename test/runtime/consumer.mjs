import assert from 'assert';
import { createRequire } from 'module';
import assertAPI from './assert-api.cjs';
const require = createRequire(import.meta.url);
const pkg = require('go-types/package.json');
async function main() {
  const focused = {};
  let aliases = 0;
  for (const [alias, route] of Object.entries(pkg.exports)) {
    const entry = Array.isArray(route) ? route[0] : route;
    if (alias === '.' || alias.startsWith('./dist/') || !entry.import) continue;
    const name = alias.split('/').pop().replace(/\.js$/, '');
    const imported = await import('go-types/' + alias.slice(2));
    assert.deepStrictEqual(Object.keys(imported).sort(), ['default', name].sort(), alias);
    assert.strictEqual(imported[name], imported.default, alias);
    focused[name] = imported[name];
    aliases++;
  }
  assert.strictEqual(
    require.cache[require.resolve('go-types')],
    undefined,
    'Function subpaths must not load the namespace'
  );
  const exportsChecked = assertAPI(focused);
  const named = await import('go-types');
  const Types = named.default;
  assert.deepStrictEqual(
    Object.keys(named)
      .filter((name) => name !== 'default')
      .sort(),
    Object.keys(Types).sort()
  );
  for (const name of Object.keys(Types)) {
    assert.strictEqual(named[name], Types[name]);
    assert.strictEqual(focused[name], Types[name]);
  }
  // The modular entries support Node 12.17; the standalone ESM bundle targets Node 14.
  if (!process.argv.includes('--source-only') && Number(process.versions.node.split('.')[0]) >= 14) {
    assertAPI((await import('go-types/dist/go-types.mjs')).default);
  }
  console.log(
    JSON.stringify({ node: process.version, exports: exportsChecked, aliases, esm: true, namedSubpaths: true })
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
