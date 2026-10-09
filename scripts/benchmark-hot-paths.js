'use strict';
// Before/after benchmark: independent processes, alternating versions, consumed
// results, identical inputs, warm-up, seven batches and all raw samples retained.
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');
if (process.argv[2] === '--worker') {
  const T = require('./load-benchmark-library')(process.argv[3]);
  const objects = [{}, { x: 1 }, { x: null }, Object.create(null)];
  const arrays = [[], [1], [null, undefined], new Array(2)];
  const maps = [new Map(), new Map([['x', 1]])];
  const sets = [new Set(), new Set([1])];
  const numbers = [0, 1, 1.5, NaN, Infinity, -1];
  const boxed = [new Number(0), new Number(1), new Number(1.5), new Number(NaN)];
  const predicate = { predicate: (value) => typeof value === 'number' };
  const compiled = T.createTypeChecker(predicate);
  const cases = [
    ['isEmpty / dictionaries', (i) => T.isEmpty(objects[i % 4])],
    ['isBlank / dictionaries', (i) => T.isBlank(objects[i % 4])],
    ['isEmpty / arrays', (i) => T.isEmpty(arrays[i % 4])],
    ['isBlank / arrays', (i) => T.isBlank(arrays[i % 4])],
    ['isEmpty / Maps', (i) => T.isEmpty(maps[i % 2])],
    ['isBlank / Sets', (i) => T.isBlank(sets[i % 2])],
    ['isMap / ordinary negatives', (i) => T.isMap(objects[i % 4])],
    ['isMap / genuine Maps', (i) => T.isMap(maps[i % 2])],
    ['isTypeOf / predicate descriptor', (i) => T.isTypeOf(i, predicate)],
    ['compiled / same predicate', (i) => compiled(i)],
    ['isTypeOf / primitive name', (i) => T.isTypeOf(i, 'number')],
    ['isNumber / primitives', (i) => T.isNumber(numbers[i % 6])],
    ['isNumber / boxed', (i) => T.isNumber(boxed[i % 4])],
    ['isSafeInteger / boxed', (i) => T.isSafeInteger(boxed[i % 4])]
  ];
  let sink = 0;
  const rows = cases.map(([name, check]) => {
    for (let i = 0; i < 10000; i++) sink += Number(check(i));
    const samplesNs = [];
    for (let batch = 0; batch < 7; batch++) {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) sink += Number(check(i));
      samplesNs.push(((performance.now() - start) * 1e6) / 10000);
    }
    return { name, samplesNs, medianNs: samplesNs.slice().sort((a, b) => a - b)[3] };
  });
  console.log(
    JSON.stringify({
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      batches: 7,
      callsPerBatch: 10000,
      warmupCalls: 10000,
      sink,
      rows
    })
  );
} else {
  const roots = process.argv.slice(2).map((p) => path.resolve(p));
  if (roots.length !== 2) throw Error('Usage: node scripts/benchmark-hot-paths.js /path/to/previous /path/to/current');
  const runs = [[], []];
  for (let round = 0; round < 3; round++)
    for (const side of round % 2 ? [1, 0] : [0, 1]) {
      const result = spawnSync(process.execPath, [__filename, '--worker', roots[side]], {
        encoding: 'utf8',
        timeout: 30000
      });
      if (result.error || result.status !== 0) throw result.error || Error(result.stderr);
      runs[side].push(JSON.parse(result.stdout));
    }
  const median = (values) => values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const comparisons = runs[0][0].rows.map((row, i) => {
    const beforeNs = median(runs[0].map((run) => run.rows[i].medianNs));
    const afterNs = median(runs[1].map((run) => run.rows[i].medianNs));
    return { name: row.name, beforeNs, afterNs, ratio: beforeNs / afterNs };
  });
  console.log(
    JSON.stringify(
      {
        node: process.version,
        method:
          'Three independent warmed processes per version, alternating order. Medians of seven batches; no profiler attached.',
        roots,
        comparisons,
        runs
      },
      null,
      2
    )
  );
}
