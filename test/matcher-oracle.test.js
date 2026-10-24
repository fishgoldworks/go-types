'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const compileTypeMatcher = require('../src/util/compileTypeMatcher');

// Keep this independently seeded corpus in the normal runtime suite. It covers
// shared graph evaluation with stateful predicates, callback order and errors.
test('shared matcher graphs retain ordered effects for seed 0x7317aa', () => {
  let seed = 0x7317aa;
  function rand(n) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % n;
  }
  let trace = [];
  const names = ['undefined', 'object', 'boolean', 'number', 'bigint', 'string', 'symbol', 'function'];
  const values = [undefined, null, false, true, -0, 2, NaN, 'x', '', 1n, Symbol('x'), {}, [], () => {}];
  const leaves = [
    ...names,
    null,
    undefined,
    ...[0, 1, 2].map((id) => ({
      predicate(value) {
        trace.push(id);
        if (value === 'x' && trace.length % 5 === 0) throw new Error('application predicate');
        return id === 0 ? typeof value === 'number' : id === 1 ? trace.length % 4 === 0 : false;
      }
    }))
  ];
  // Independent small-input interpreter. It deliberately expands references during
  // evaluation and shares no compilation implementation with the library.
  function reference(value, spec) {
    if (Array.isArray(spec)) {
      for (let i = 0; i < spec.length; i++) if (reference(value, spec[i])) return true;
      return false;
    }
    if (typeof spec === 'string') return typeof value === spec;
    if (spec === null || spec === undefined) return value === spec;
    return spec.predicate(value);
  }
  function observe(run) {
    trace = [];
    try {
      return { result: run(), trace: [...trace] };
    } catch (e) {
      return { error: e.message, trace: [...trace] };
    }
  }
  let comparisons = 0,
    graphs = 240;
  for (let round = 0; round < graphs; round++) {
    const pool = [...leaves];
    for (let level = 0; level < 7; level++) {
      const arr = [];
      const length = rand(4);
      for (let i = 0; i < length; i++) arr.push(pool[rand(pool.length)]);
      pool.push(arr);
    }
    const child = pool[pool.length - 1];
    const root = round % 2 ? [child, child, pool[rand(pool.length)]] : child;
    const checker = compileTypeMatcher(root);
    for (const v of values) {
      const expected = observe(() => reference(v, root));
      const actual = observe(() => checker(v));
      assert.deepEqual(actual, expected, `Graph ${round}, value type ${typeof v}`);
      comparisons++;
    }
  }
  assert.equal(comparisons, 3360);
});
