'use strict';
// Run each version in an isolated process with the same input sequences.
const { performance } = require('node:perf_hooks');
const { spawnSync } = require('node:child_process');
const os = require('node:os');
const rounds = 9;
const iterations = 30000;
if (process.argv[2] === '--worker') {
  const T = require('./load-benchmark-library')(process.argv[3]);
  const input = [0, 1, 1.5, NaN, Infinity, -0, 42, -2.5];
  const boxes = input.map((x) => new Number(x));
  const arrays = [[], [1, 2, 3], [null, undefined], new Array(5)];
  const values = [1, null, 'x', false, {}, undefined];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
  const simple = ['number', null, 'string'];
  const reused = T.createTypeChecker(simple);
  const cases = [
    ['isInteger / number primitives', (i) => T.isInteger(input[i % input.length])],
    ['isSafeInteger / boxed numbers', (i) => T.isSafeInteger(boxes[i % boxes.length])],
    ['isFloat / number primitives', (i) => T.isFloat(input[i % input.length])],
    ['isNumeric / numeric strings', (i) => T.isNumeric(['1.5', ' 42 ', '-2', '1e3'][i % 4])],
    ['isEmpty / arrays', (i) => T.isEmpty(arrays[i % arrays.length])],
    ['isBlank / arrays', (i) => T.isBlank(arrays[i % arrays.length])],
    ['isTypeOf / primitive type name', (i) => T.isTypeOf(values[i % values.length], 'number')],
    ['isTypeOf / three-way union', (i) => T.isTypeOf(values[i % values.length], simple)],
    ['compiled checker / three-way union', (i) => reused(values[i % values.length])],
    ['isArrayOf / eight numeric items', () => T.isArrayOf(numbers, 'number')],
    ['isArray / mixed values', (i) => T.isArray(values[i % values.length])],
    ['isMap / ordinary object negative', (i) => T.isMap(values[i % values.length])]
  ];
  let sink = 0;
  const observations = [];
  for (const [name, run] of cases) {
    for (let i = 0; i < 50000; i++) sink += Number(run(i));
    const ns = [];
    for (let r = 0; r < rounds; r++) {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) sink += Number(run(i));
      ns.push(((performance.now() - start) * 1e6) / iterations);
    }
    const sorted = ns.slice().sort((a, b) => a - b);
    observations.push({ name, medianNs: sorted[Math.floor(rounds / 2)], samplesNs: ns });
  }
  console.log(
    JSON.stringify({
      node: process.version,
      cpu: os.cpus()[0].model,
      rounds,
      iterations,
      warmup: 50000,
      sink,
      observations
    })
  );
} else {
  const [baseline, updated] = process.argv.slice(2);
  if (!baseline || !updated)
    throw Error('Usage: node scripts/benchmark-compare.js <baseline-directory> <updated-directory>');
  const results = [];
  // Alternate run order to reduce drift; retain every raw observation.
  for (const round of [0, 1, 2])
    for (const [name, root] of round % 2
      ? [
          ['updated', updated],
          ['baseline', baseline]
        ]
      : [
          ['baseline', baseline],
          ['updated', updated]
        ]) {
      const result = spawnSync(process.execPath, [__filename, '--worker', root], { encoding: 'utf8', timeout: 500000 });
      if (result.status !== 0) throw Error(result.stderr || String(result.error));
      results.push({ name, round, ...JSON.parse(result.stdout) });
    }
  const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const comparisons = results[0].observations.map((o, i) => {
    const before = median(results.filter((r) => r.name === 'baseline').map((r) => r.observations[i].medianNs));
    const after = median(results.filter((r) => r.name === 'updated').map((r) => r.observations[i].medianNs));
    return { name: o.name, baselineNs: before, updatedNs: after, speedup: before / after };
  });
  console.log(
    JSON.stringify(
      {
        warning:
          'Local microbenchmarks; JIT, GC and measurement noise apply. Medians of 3 independent process medians (9 batches each). No portable speed guarantee.',
        comparisons,
        runs: results
      },
      null,
      2
    )
  );
}
