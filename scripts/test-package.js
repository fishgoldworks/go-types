'use strict';
// Verify the published surface, not a developer directory with implicit dependencies.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const assert = require('node:assert/strict');
const verifyDistributions = require('./test-artifacts');
const root = path.resolve(__dirname, '..');
const pkg = require('../package.json');
const names = require('./exports.json');
const args = new Set(process.argv.slice(2));
const sourceOnly = args.has('--source-only');
const npm = 'npm';
function run(command, argv, cwd) {
    if(command === 'npm') {
        const cli=process.env.npm_execpath || path.join(path.dirname(process.execPath),'node_modules','npm','bin','npm-cli.js');
        if(fs.existsSync(cli)) {command=process.execPath; argv=[cli,...argv];}
        else if(process.platform==='win32') throw new Error('Run through npm run test:package so npm_execpath identifies its CLI without a Windows shell.');
    }
    const result = spawnSync(command, argv, {cwd, encoding:'utf8', timeout:120000,
        env:{...process.env, npm_config_audit:'false', npm_config_fund:'false'}});
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${command} ${argv.join(' ')} failed (${result.status}):\n${result.stdout}\n${result.stderr}`);
    return result.stdout;
}
function targets(value, output = new Set()) {
    if (typeof value === 'string') output.add(value);
    else if (value && typeof value === 'object') for (const item of Object.values(value)) targets(item, output);
    return output;
}
function verifyFiles() {
    if (!sourceOnly) {
        const filename=path.join(root,'package-lock.json');
        assert.ok(fs.existsSync(filename),'Missing development lockfile: run npm install, review and commit package-lock.json before release.');
        const lock=JSON.parse(fs.readFileSync(filename,'utf8'));
        assert.equal(lock.version,pkg.version,'Lockfile version differs from package metadata.');
        assert.equal(lock.packages?.['']?.version,pkg.version,'Lockfile root version differs.');
        assert.deepEqual(lock.packages?.['']?.devDependencies,pkg.devDependencies,'Lockfile root dev dependencies differ.');
    }
    const paths = targets(pkg.exports);
    for (const name of ['main', 'module', 'types', 'unpkg', 'jsdelivr']) if (pkg[name]) paths.add(pkg[name]);
    for (const target of paths) {
        assert.ok(target.startsWith('./'), `Unexpected external export: ${target}`);
        if (sourceOnly && target.startsWith('./dist/')) continue;
        assert.ok(fs.existsSync(path.join(root,target)), `Missing declared package target: ${target}. Run npm run build first.`);
    }
    assert.deepEqual(Object.keys(require('../index.js')).sort(), [...names].sort());
    return paths.size;
}
function verifyDocumentation(files, installed) {
    for (const filename of files.filter(file => file.endsWith('.md'))) {
        const markdown = fs.readFileSync(path.join(installed, filename), 'utf8');
        for (const match of markdown.matchAll(/\]\(([^)\s]+)\)/g)) {
            const target = match[1].split('#')[0];
            if (!target || /^[a-z]+:/i.test(target)) continue;
            const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(filename), target));
            assert.ok(files.includes(resolved), 'Broken installed documentation link: ' + filename + ' -> ' + target);
        }
    }
}
function main() {
    const targetCount = verifyFiles();
    if (args.has('--check-files')) {
        console.log(JSON.stringify({mode:sourceOnly?'source-only':'release', declaredTargets:targetCount, filesChecked:true},null,2));
        return;
    }
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(),'go-types-package-'));
    try {
        const packed = JSON.parse(run(npm,['pack','--ignore-scripts','--json','--pack-destination',temporary],root))[0];
        const files = packed.files.map(item => item.path);
        for (const filename of files) {
            assert.ok(!/(^|\/)(drafts|test|scripts|benchmarks|bench|verification|\.tmp|node_modules)(\/|$)/.test(filename), `Unexpected published file: ${filename}`);
            assert.ok(!/^(CONTRIBUTING\.md|docs\/(DESIGN|IMPLEMENTATION|PERFORMANCE|TESTING|project-design|implementation|performance|project-testing)\.md)$/.test(filename), 'Maintainer documentation must stay in the source repository: ' + filename);
            assert.ok(!/\.tgz$/.test(filename), `Nested package: ${filename}`);
        }
        for (const target of targets(pkg.exports)) {
            if (sourceOnly && target.startsWith('./dist/')) continue;
            assert.ok(files.includes(target.slice(2)), 'Declared target missing from tarball: ' + target);
        }
        assert.ok(files.includes('docs/API.md'));
        assert.ok(files.includes('docs/conversions.md'));
        for (const name of names.filter(name => name.startsWith('to'))) assert.ok(files.includes('src/conversion/' + name + '.js'));
        const consumer = path.join(temporary,'consumer');
        fs.mkdirSync(consumer);
        fs.writeFileSync(path.join(consumer,'package.json'), JSON.stringify({private:true,type:'module'}));
        // There are no runtime dependencies; local-tar installation must also work offline.
        run(npm,['install',path.join(temporary,packed.filename),'--offline','--ignore-scripts','--omit=dev','--no-audit','--no-fund'],consumer);
        const installed = path.join(consumer,'node_modules','go-types');
        verifyDocumentation(files, installed);
        const bundleBytes = sourceOnly ? undefined : verifyDistributions(installed);
        fs.writeFileSync(path.join(consumer,'check.cjs'), `
const assert = require('node:assert/strict');
const T = require('go-types');
const names = ${JSON.stringify(names)};
assert.deepEqual(Object.keys(T).sort(), [...names].sort());
for (const name of names) {
    assert.strictEqual(require('go-types/' + name), T[name]);
    assert.strictEqual(require('go-types/src/' + name), T[name]);
    assert.strictEqual(require('go-types/src/' + name + '.js'), T[name]);
}
assert.equal(T.toNumber('12.5'), 12.5);
assert.equal(T.toNumberIf('12.5', false), '12.5');
assert.deepEqual(T.toArray(new Set([1, 2])), [1, 2]);
assert.equal(T.toString(null), 'null');
assert.equal(T.toObject(12).valueOf(), 12);
assert.equal(typeof T.toSymbol('key'), 'symbol');
for (const name of names.filter(name => name.startsWith('to'))) {
    for (const prefix of ['conversion/', 'src/conversion/']) {
        for (const extension of ['', '.js']) {
            assert.strictEqual(require('go-types/' + prefix + name + extension), T[name]);
        }
    }
}
assert.equal(T.isArrayOf([], 'number'), true);
assert.equal(T.createTypeChecker(['number',null])(null), true);
assert.equal(T.isArrayBufferView(new Uint8Array(1)), true);
for (const name of ['go-types/src/util/hasNativeBrand','go-types/drafts/conversion/toNumber']) {
    assert.throws(() => require(name), {code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});
}
`);
        fs.writeFileSync(path.join(consumer,'check.mjs'), `
import assert from 'node:assert/strict';
import T, * as all from 'go-types';
const names = ${JSON.stringify(names)};
for (const name of names) {
    assert.strictEqual(all[name], T[name]);
    assert.strictEqual((await import('go-types/' + name)).default, T[name]);
}
assert.equal(T.toNumber('42'),42);
assert.equal((await import('go-types/conversion/toNumber')).default,T.toNumber);
assert.equal((await import('go-types/src/conversion/toObject.js')).default,T.toObject);
assert.equal(T.isMapOf(new Map([['x',1]]), 'string', 'number'),true);
`);
        run(process.execPath,['check.cjs'],consumer);
        run(process.execPath,['check.mjs'],consumer);
        for (const filename of ['tsconfig.json', ...JSON.parse(fs.readFileSync(path.join(root,'test','types','tsconfig.json'),'utf8')).files]) {
            fs.copyFileSync(path.join(root,'test','types',filename),path.join(consumer,filename));
        }
        const compiler = path.join(root,'node_modules','typescript','bin','tsc');
        if (fs.existsSync(compiler)) run(process.execPath,[compiler,'-p',consumer],consumer);
        else run(process.platform==='win32'?'tsc.cmd':'tsc',['-p',consumer],consumer);
        if (!sourceOnly) {
            for (const filename of ['go-types.js','go-types.min.js']) {
                const bundled = require(path.join(installed,'dist',filename));
                assert.deepEqual(Object.keys(bundled).sort(), [...names].sort());
            }
        }
        console.log(JSON.stringify({mode:sourceOnly?'source-only (browser artifacts excluded)':'release',
            version:pkg.version, exports:names.length, packedFiles:files.length, packedBytes:packed.size,
            installedCommonJS:true, installedESM:true, installedTypeScript:true,
            publicationAllowlist:true, installedDocumentation:true, bundleBytes, productionBundles:sourceOnly?'not checked':'checked'},null,2));
    } finally {fs.rmSync(temporary,{recursive:true,force:true});}
}
try {main();} catch (error) {console.error(error); process.exitCode=1;}
