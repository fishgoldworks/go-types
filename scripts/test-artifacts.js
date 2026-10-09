'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const pkg = require('../package.json');
const names = require('./exports.json');

function verifyDistributions(installed) {
  const license = fs.readFileSync(path.join(installed, 'LICENSE.md'), 'utf8').replace(/\r\n/g, '\n').trim();
  const sizes = {};
  const packagePath = path.resolve(installed);
  const realPackagePath = fs.realpathSync(packagePath);
  function ownedFile(base, reference, label) {
    assert.equal(typeof reference, 'string', label + ' must be a relative filename');
    assert.ok(reference && !path.isAbsolute(reference), label + ' must be relative: ' + reference);
    const resolved = path.resolve(base, reference);
    assert.ok(resolved.startsWith(packagePath + path.sep), label + ' escapes package: ' + reference);
    assert.ok(fs.existsSync(resolved), label + ' is missing: ' + reference);
    assert.ok(
      fs.realpathSync(resolved).startsWith(realPackagePath + path.sep),
      label + ' resolves outside package: ' + reference
    );
    assert.ok(fs.statSync(resolved).isFile(), label + ' must reference a file: ' + reference);
    return resolved;
  }
  for (const filename of ['go-types.js', 'go-types.min.js', 'go-types.mjs']) {
    const code = fs.readFileSync(path.join(installed, 'dist', filename), 'utf8');
    sizes[filename] = Buffer.byteLength(code);
    assert.ok(code.includes(license), filename + ' must preserve the full MIT notice for standalone distribution');
    assert.ok(code.includes(pkg.name + ' v' + pkg.version), filename + ' has no current version banner');
    const reference = code.match(/sourceMappingURL=(\S+)/);
    assert.ok(reference, filename + ' has no source-map reference');
    const mapPath = ownedFile(path.join(packagePath, 'dist'), reference[1], filename + ' source-map');
    const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    assert.equal(map.version, 3);
    // These build-owned maps must be relocatable with the package. No remote or
    // alternate source root is emitted by the build; do not silently ignore one.
    assert.ok(map.sourceRoot === undefined || map.sourceRoot === '', filename + ' has unsupported sourceRoot');
    assert.ok(Array.isArray(map.sources) && map.sources.length > 0, filename + ' must have mapped sources');
    assert.ok(Array.isArray(map.sourcesContent), filename + ' must embed its mapped sources');
    assert.equal(map.sources.length, map.sourcesContent.length);
    for (const [index, source] of map.sources.entries()) {
      const sourcePath = ownedFile(path.dirname(mapPath), source, filename + ' mapped source');
      const embedded = map.sourcesContent[index];
      assert.equal(typeof embedded, 'string', filename + ' has no embedded source content: ' + source);
      const packaged = fs.readFileSync(sourcePath, 'utf8');
      assert.ok(
        embedded.replace(/\r\n/g, '\n') === packaged.replace(/\r\n/g, '\n'),
        filename + ' source content mismatch: ' + source
      );
    }
    if (filename.endsWith('.mjs')) continue;
    const commonjs = require(path.join(installed, 'dist', filename));
    const global = {};
    vm.runInNewContext(code, global);
    for (const api of [commonjs, global.Types]) {
      assert.deepEqual(Object.keys(api).sort(), [...names].sort());
      assert.equal(api.toNumber('12.5'), 12.5);
      assert.equal(api.isArrayOf([1, '2'], 'number'), false);
      assert.equal(api.isDate(new Date(0)), true);
    }
    // AMD consumers must receive the same behaviour as CommonJS and browser globals.
    let amd;
    let calls = 0;
    const define = (dependencies, factory) => {
      calls++;
      assert.deepEqual(Array.from(dependencies), []);
      amd = factory();
    };
    define.amd = {};
    vm.runInNewContext(code, { define });
    assert.equal(calls, 1);
    assert.deepEqual(Object.keys(amd).sort(), [...names].sort());
    assert.equal(amd.toNumber('12.5'), 12.5);
    assert.equal(amd.isArrayOf([1, '2'], 'number'), false);
    assert.equal(amd.createTypeChecker(['number', null])(null), true);
    assert.equal(amd.isDate(new Date(0)), true);
    assert.equal(amd.isDate(Object.create(Date.prototype)), false);
  }
  assert.ok(
    sizes['go-types.min.js'] < sizes['go-types.js'] * 0.8,
    'Minified bundle must be meaningfully smaller than the readable bundle'
  );
  return sizes;
}

module.exports = verifyDistributions;
if (require.main === module) {
  try {
    const bundleBytes = verifyDistributions(require('./package-layout').packageRoot);
    console.log(JSON.stringify({ artifacts: true, loaders: ['commonjs', 'global', 'amd'], bundleBytes }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
