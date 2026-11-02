'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const exampleResult = require('./fixtures/exampleResult.cjs');

test('inline explanations retain the expected value and reject an incorrect result', () => {
  const expected = exampleResult("'invalid' (parsing skipped; otherwise throws SyntaxError)");
  assert.equal(vm.runInNewContext('(' + expected + ')'), 'invalid');
  assert.throws(
    () => vm.runInNewContext("assert.deepStrictEqual('changed', (" + expected + '));', { assert }),
    (error) => error.code === 'ERR_ASSERTION'
  );
});

test('inline explanations preserve expected exception types', () => {
  assert.equal(exampleResult('throws SyntaxError (invalid JSON)'), 'throws SyntaxError');
});

test('parentheses and semicolons inside executable results are preserved', () => {
  for (const text of [
    "'text (parsing skipped; otherwise throws SyntaxError)'",
    '({ id: 1 })',
    '(() => { return 1; })()',
    "String ('a;b')",
    'true && (false)'
  ])
    assert.equal(exampleResult(text), text);
});

test('malformed expected expressions remain errors', () => {
  for (const text of ["'unterminated", '({ id: }) (parsing skipped; otherwise throws SyntaxError)']) {
    assert.equal(exampleResult(text), text);
    assert.throws(() => new vm.Script('(' + text + ')'), SyntaxError);
  }
});
