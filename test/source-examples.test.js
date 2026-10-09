'use strict';
// Execute the actual JSDoc code and expected-result literals, not the metadata
// that generates them. This catches missing quotes and arrays printed as commas.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = require('../index.js');
const sourcePath = require('../scripts/source-path.js');
const names = Object.keys(T);
const values = Object.values(T);
const dom = new Set(['isNode', 'isElement', 'isFragment']);
for (const name of names.filter((name) => !dom.has(name))) {
  const source = fs.readFileSync(path.join(__dirname, '..', sourcePath(name)), 'utf8');
  const examples = [...source.matchAll(/^\s*\* @example (.*);\s+\/\/ => (.*)$/gm)];
  test(name + ' source JSDoc contains executable examples', () => assert.ok(examples.length > 0));
  for (const [, expression, expected] of examples) {
    test('JSDoc: ' + expression, () => {
      assert.ok(expected.trim().length, 'Expected result must be a complete JavaScript literal');
      const actual = Function(...names, 'return (' + expression + ');')(...values);
      const result = Function('return (' + expected + ');')();
      assert.deepStrictEqual(actual, result);
    });
  }
}
