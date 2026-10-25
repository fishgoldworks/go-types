'use strict';
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');
if (process.argv[2] === '--worker') {
  const T = require('./load-benchmark-library')(process.argv[3]);
  const items = Number(process.argv[4]);
  const values = Array.from({ length: items }, () => 1);
  values[items - 1] = 'mismatch';
  const start = performance.now();
  const result = T.isArrayOf(values, 'number');
  const matchMilliseconds = performance.now() - start;
  console.log(JSON.stringify({ items, matchMilliseconds, result }));
} else {
  const baseline = process.argv[2];
  const updated = process.argv[3] || path.join(__dirname, '..');
  const results = [];
  for (const [label, root] of baseline
    ? [
        ['baseline', baseline],
        ['updated', updated]
      ]
    : [['updated', updated]]) {
    for (const items of [12, 100, 1000, 10000, 100000]) {
      const r = spawnSync(process.execPath, [__filename, '--worker', root, String(items)], {
        encoding: 'utf8',
        timeout: 5000
      });
      results.push(
        r.error?.code === 'ETIMEDOUT'
          ? { label, items, timeoutMilliseconds: 5000 }
          : r.status === 0
            ? { label, ...JSON.parse(r.stdout) }
            : { label, items, error: r.stderr || String(r.error) }
      );
    }
  }
  if (results.some((result) => result.error)) process.exitCode = 1;
  console.log(
    JSON.stringify(
      {
        node: process.version,
        warning:
          'Fresh processes; cold matching timings, not portable throughput guarantees. Child deadlines include startup. Inputs are built before timing; a final mismatch forces a complete indexed scan.',
        results
      },
      null,
      2
    )
  );
}
