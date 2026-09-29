'use strict';
// Run both versions in independent alternating processes, without an inspector.
// Identical inputs, consumed results, seven warm timing batches; no unit-test deadline.
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {performance} = require('node:perf_hooks');
if (process.argv[2] === '--worker') {
    const T = require(path.resolve(process.argv[3]));
    const values = {
        primitives: [0, 1, 1.5, NaN, Infinity, -1, Number.MAX_SAFE_INTEGER, -0],
        boxed: [0, 1, 1.5, NaN, Infinity, -1, Number.MAX_SAFE_INTEGER, -0].map(x => new Number(x)),
        objects: [{}, [], new Map(), new Date(0), Object.create(null), /x/, () => {}, new Set()],
        mixed: [1, new Number(2), {}, '3', null, 1.5, new Number(NaN), []]
    };
    let sink = 0;
    const rows = [];
    for (const name of ['isFinite','isInteger','isSafeInteger','isNumeric']) {
        const fn = T[name];
        for (const [kind, inputs] of Object.entries(values)) {
            const run = count => { for (let i=0; i<count; i++) sink += Number(fn(inputs[i & 7])); };
            run(12000);
            const samplesNs = [];
            for (let batch=0; batch<7; batch++) {
                const start = performance.now();run(12000);
                samplesNs.push((performance.now()-start)*1e6/12000);
            }
            rows.push({name:name+' / '+kind, samplesNs, medianNs:[...samplesNs].sort((a,b)=>a-b)[3]});
        }
    }
    console.log(JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,warmup:12000,callsPerBatch:12000,batches:7,sink,rows}));
} else {
    const roots=process.argv.slice(2).map(x=>path.resolve(x));
    if(roots.length!==2)throw Error('Usage: node scripts/benchmark-numeric-paths.js /path/to/previous /path/to/current');
    const runs=[[],[]];
    for(let round=0;round<3;round++)for(const side of round%2?[1,0]:[0,1]) {
        const child=spawnSync(process.execPath,[__filename,'--worker',roots[side]],{encoding:'utf8',timeout:60000});
        if(child.error || child.status!==0)throw child.error || Error(child.stderr);
        runs[side].push(JSON.parse(child.stdout));
    }
    const median=x=>[...x].sort((a,b)=>a-b)[1];
    const comparisons=runs[0][0].rows.map((row,i)=>{
        const beforeNs=median(runs[0].map(run=>run.rows[i].medianNs));
        const afterNs=median(runs[1].map(run=>run.rows[i].medianNs));
        return {name:row.name,beforeNs,afterNs,ratio:beforeNs/afterNs};
    });
    console.log(JSON.stringify({method:'Three independent warmed processes per version, alternating order; seven batches per case, consumed results, no debugger.',roots,comparisons,runs},null,2));
}
