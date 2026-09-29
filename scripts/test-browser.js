'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root=path.join(__dirname,'..');
const metadata=require('./api.json');
const names=require('./exports.json');
const sourcePath=require('./source-path.js');
const sourceOnly=process.argv.includes('--source-only');
const contract=fs.readFileSync(path.join(root,'test','browser','contract.js'),'utf8');
// Read expressions and result literals from the generated source comments so a
// broken JSDoc serialiser cannot hide behind correct API-metadata examples.
const metadataExamples=metadata.flatMap(item=>item.examples);
const sourceExamples=names.flatMap(name=>{
    const source=fs.readFileSync(path.join(root,sourcePath(name)),'utf8');
    const examples=[...source.matchAll(/^\s*\* @example (.*);\s+\/\/ => (.*)$/gm)];
    assert.ok(examples.length, `${name} source JSDoc must contain executable examples`);
    return examples.map(([,expression,expected])=>({expression,expected,
        requires:metadataExamples.find(example=>example.expression===expression)?.requires||[]}));
});
async function load(page, mode){
    if(mode==='source') await page.addScriptTag({content:require('./source-test-loader.js')()});
    else if(mode==='esm') await page.evaluate(async()=>{globalThis.Types=(await import('/bundle.mjs')).default;});
    else await page.addScriptTag({content:fs.readFileSync(path.join(root,'dist',mode==='umd'?'go-types.js':'go-types.min.js'),'utf8')});
}
async function checkOptionalHostFailure(browser, url, mode){
    // Use a fresh page so an earlier successful load or ESM cache cannot conceal
    // a failure while discovering the optional host bridge.
    const page=await browser.newPage();
    try {
        await page.goto(url);
        await page.evaluate(()=>{globalThis.process={getBuiltinModule(){throw Error('unavailable optional bridge');}};});
        await load(page,mode);
        const result=await page.evaluate(()=>({
            loaded:Types.isNumber(new Number(2)),finite:Types.isFinite(new Number(2)),
            negative:Types.isFinite({}),dictionary:Types.isEmpty({})
        }));
        assert.deepEqual(result,{loaded:true,finite:true,negative:false,dictionary:true},`${mode}: optional host failure must preserve portable behavior`);
        return result;
    } finally {await page.close();}
}
async function main(){
    const server=http.createServer((request,response)=>{
        response.setHeader('Cross-Origin-Opener-Policy','same-origin');
        response.setHeader('Cross-Origin-Embedder-Policy','require-corp');
        if(request.url==='/bundle.mjs') {
            response.setHeader('Content-Type','text/javascript');
            response.end(fs.readFileSync(path.join(root,'dist','go-types.mjs')));
        } else {response.setHeader('Content-Type','text/html');response.end('<!doctype html><html><body></body></html>');}
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    let browser;
    try {
        browser=await chromium.launch(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE} : {});
        const results=[];
        const modes=sourceOnly?['source']:['umd','umd-minified','esm'];
        const url=`http://127.0.0.1:${server.address().port}`;
        for(const mode of modes){
            const page=await browser.newPage();
            let result;
            try {
                await page.goto(url);
                await load(page,mode);
                await page.addScriptTag({content:contract});
                result=await page.evaluate(({metadata,names,sourceExamples})=>runGoTypesBrowserTests(Types,metadata,names,sourceExamples),{metadata,names,sourceExamples});
            } finally {await page.close();}
            const throwingOptionalBridge=await checkOptionalHostFailure(browser,url,mode);
            results.push({mode,...result,throwingOptionalBridge});
        }
        console.log(JSON.stringify({browser:browser.version(),sourceOnly,sourceExamples:sourceExamples.length,results},null,2));
        if(results.some(result=>result.failed)) process.exitCode=1;
    } finally {if(browser)await browser.close(); await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
