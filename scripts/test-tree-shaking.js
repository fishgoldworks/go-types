'use strict';
// This is a real consumer-bundle check. It must run with the pinned esbuild,
// never with a hand-written module loader or a source-text size estimate.
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const esbuild = require('esbuild');
const root = path.join(__dirname, '..');
async function compile(contents) {
    return esbuild.build({absWorkingDir:root, stdin:{contents,resolveDir:root,sourcefile:'consumer.mjs',loader:'js'},
        bundle:true,platform:'browser',target:'es2020',format:'iife',minify:true,write:false,metafile:true,logLevel:'silent'});
}
async function main() {
    const expressions = {
        root: "import {isArray} from 'go-types'; globalThis.result = [isArray([]), isArray({})];",
        focused: "import isArray from 'go-types/isArray'; globalThis.result = [isArray([]), isArray({})];",
        namespace: "import Types from 'go-types'; globalThis.api = Types;"
    };
    const results={};
    for(const [name,input] of Object.entries(expressions)) {
        const build=await compile(input);
        const scope={};vm.runInNewContext(build.outputFiles[0].text,scope);
        if(name!=='namespace') assert.deepEqual(Array.from(scope.result),[true,false]);
        else assert.equal(Object.keys(scope.api).length,require('./exports.json').length);
        const included=[...new Set(Object.values(build.metafile.outputs).flatMap(output=>
            Object.entries(output.inputs).filter(([,v])=>v.bytesInOutput>0).map(([file])=>file.replace(/\\/g,'/'))))];
        if(name!=='namespace') {
            assert.ok(included.some(file=>file.endsWith('src/isArray.js')),name+' lost its actual implementation');
            assert.ok(!included.some(file=>/src\/(createTypeChecker|conversion\/)/.test(file)),name+' retained unrelated API code');
        }
        results[name]={bytes:build.outputFiles[0].contents.length,contributingModules:included};
    }
    assert.ok(results.root.bytes < results.namespace.bytes,'Root named imports should omit the unused namespace.');
    // A relative structural guard is less toolchain-sensitive than a fixed minified-byte threshold.
    assert.ok(results.root.bytes <= results.focused.bytes*1.5,'Root named import is unexpectedly larger than a focused import.');
    console.log(JSON.stringify({esbuild:esbuild.version,platform:'browser',results},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
