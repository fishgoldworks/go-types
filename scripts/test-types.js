'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.join(__dirname, '..');
const temporary = fs.mkdtempSync(path.join(root, '.go-types-typecheck-'));
const local = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const global = path.resolve(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'typescript', 'bin', 'tsc');
const compiler = [process.env.TSC_JS, local, global].find(file => file && fs.existsSync(file));
function run(command, args) {
    const result = spawnSync(command, args, {cwd:root, encoding:'utf8', timeout:60000});
    if (result.error) throw result.error;
    if (result.status !== 0) throw Error(result.stdout + result.stderr);
    process.stdout.write(result.stdout);
}
try {
    if (!compiler) throw Error('Install TypeScript locally or set TSC_JS to its bin/tsc JavaScript file.');
    run(process.execPath, [compiler, '-p', 'test/types/tsconfig.json']);
    run(process.execPath, [compiler, '--strict', '--module', 'NodeNext', '--target', 'ES2020', '--lib', 'ES2020',
        '--rootDir', root, '--outDir', temporary, 'test/types/runtime-safe.cts']);
    run(process.execPath, [path.join(temporary, 'test', 'types', 'runtime-safe.cjs')]);
    const count = (fs.readFileSync(path.join(root, 'test/types/runtime-safe.cts'), 'utf8').match(/^assert\(/gm) || []).length;
    console.log(`${count} TypeScript compile-and-run checks passed.`);
} finally {
    fs.rmSync(temporary, {recursive:true, force:true});
}
