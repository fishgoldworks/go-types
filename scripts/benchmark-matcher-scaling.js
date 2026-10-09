'use strict';
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');
if (process.argv[2] === '--worker') {
  const T = require('./load-benchmark-library')(process.argv[3]);
  const depth = Number(process.argv[4]);
  let type = [];
  for (let i = 0; i < depth; i++) type = [type, type];
  const start = performance.now();
  const check = T.createTypeChecker(type);
  const compileMilliseconds = performance.now() - start;
  console.log(JSON.stringify({ depth, distinctArrays: depth + 1, compileMilliseconds, result: check(42) }));
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
    for (const depth of [12, 16, 20, 23, 28]) {
      const r = spawnSync(process.execPath, [__filename, '--worker', root, String(depth)], {
        encoding: 'utf8',
        timeout: 5000
      });
      results.push(
        r.error?.code === 'ETIMEDOUT'
          ? { label, depth, distinctArrays: depth + 1, timeoutMilliseconds: 5000 }
          : r.status === 0
            ? { label, ...JSON.parse(r.stdout) }
            : { label, depth, error: r.stderr || String(r.error) }
      );
    }
  }
  if (results.some((result) => result.error)) process.exitCode = 1;
  console.log(
    JSON.stringify(
      {
        node: process.version,
        warning:
          'Fresh processes; cold compile timings, not portable throughput guarantees. Child deadlines include startup. Empty leaves isolate compilation from callback work.',
        results
      },
      null,
      2
    )
  );
}
