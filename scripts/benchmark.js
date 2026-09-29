'use strict';
// Public-API smoke benchmarks. Results are observations, never pass/fail speed requirements.
const {performance} = require('node:perf_hooks');
const os = require('node:os');
const T = require('..');
const iterations = Number(process.env.BENCH_ITERATIONS || 20000);
const rounds = Number(process.env.BENCH_ROUNDS || 5);
if (!Number.isSafeInteger(iterations) || iterations < 100 || !Number.isSafeInteger(rounds) || rounds < 3) {
    throw new TypeError('BENCH_ITERATIONS must be an integer >= 100 and BENCH_ROUNDS an integer >= 3.');
}
let sink = 0;
const cases = require('../benchmarks/cases')(T);
const observations=[];
for (const [name, check] of cases) {
    for(let index=0;index<Math.min(iterations,5000);index++) sink+=Number(check(index));
    const measurements=[];
    for(let round=0;round<rounds;round++){
        const start=performance.now();
        for(let index=0;index<iterations;index++) sink+=Number(check(index));
        measurements.push((performance.now()-start)*1e6/iterations);
    }
    const sorted=[...measurements].sort((a,b)=>a-b);
    observations.push({name, medianNanosecondsPerCall:sorted[Math.floor(sorted.length/2)],samplesNanosecondsPerCall:measurements});
}
console.log(JSON.stringify({node:process.version,platform:process.platform,architecture:process.arch,
    cpu:os.cpus()[0]?.model,iterations,rounds,warmup:Math.min(iterations,5000),sink,
    warning:'Microbenchmarks from one process and input mix; JIT/GC/measurement noise applies. No cross-runtime performance guarantee.',observations},null,2));
