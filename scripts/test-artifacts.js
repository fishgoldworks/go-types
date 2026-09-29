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
    for (const filename of ['go-types.js', 'go-types.min.js', 'go-types.mjs']) {
        const code = fs.readFileSync(path.join(installed, 'dist', filename), 'utf8');
        sizes[filename] = Buffer.byteLength(code);
        assert.ok(code.includes(license), filename + ' must preserve the full MIT notice for standalone distribution');
        assert.ok(code.includes(pkg.name + ' v' + pkg.version), filename + ' has no current version banner');
        const reference = code.match(/sourceMappingURL=(\S+)/);
        assert.ok(reference, filename + ' has no source-map reference');
        const mapPath = path.resolve(installed, 'dist', reference[1]);
        const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
        assert.equal(map.version, 3);
        assert.equal(map.sources.length, map.sourcesContent.length);
        for (const source of map.sources) {
            assert.ok(fs.existsSync(path.resolve(path.dirname(mapPath), source)), filename + ' has a missing mapped source: ' + source);
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
        vm.runInNewContext(code, {define});
        assert.equal(calls, 1);
        assert.deepEqual(Object.keys(amd).sort(), [...names].sort());
        assert.equal(amd.toNumber('12.5'), 12.5);
        assert.equal(amd.isArrayOf([1, '2'], 'number'), false);
        assert.equal(amd.createTypeChecker(['number', null])(null), true);
        assert.equal(amd.isDate(new Date(0)), true);
        assert.equal(amd.isDate(Object.create(Date.prototype)), false);
    }
    assert.ok(sizes['go-types.min.js'] < sizes['go-types.js'] * 0.8, 'Minified bundle must be meaningfully smaller than the readable bundle');
    return sizes;
}

module.exports = verifyDistributions;
if (require.main === module) {
    try {
        const bundleBytes = verifyDistributions(path.resolve(__dirname, '..'));
        console.log(JSON.stringify({artifacts:true, loaders:['commonjs','global','amd'], bundleBytes}, null, 2));
    } catch (error) { console.error(error); process.exitCode = 1; }
}
