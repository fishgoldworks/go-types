'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'library-docs-test-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  for (const name of ['scripts', 'src', 'package.json', 'index.js', 'index.d.ts', 'README.md', 'docs']) {
    if (fs.existsSync(path.join(root, name)))
      fs.cpSync(path.join(root, name), path.join(temp, name), { recursive: true });
  }
  return temp;
}
function run(root, ...args) {
  return spawnSync(process.execPath, ['scripts/docs.js', ...args], { cwd: root, encoding: 'utf8' });
}
function snapshot(root) {
  const files = fs.readdirSync(root, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
  return new Map(
    files.map((entry) => {
      const file = path.join(entry.parentPath, entry.name);
      return [path.relative(root, file), fs.readFileSync(file).toString('base64')];
    })
  );
}

for (const document of ['README.md', 'docs/API.md'])
  test(document + ': documentation check rejects stale output without changing files', (t) => {
    const root = fixture(t);
    fs.appendFileSync(path.join(root, document), '\nStale generated content.\n');
    const before = snapshot(root);
    const result = run(root, '--check');
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /README\.md|stale/i);
    assert.deepEqual(snapshot(root), before);
    assert.equal(run(root).status, 0);
    assert.equal(run(root, '--check').status, 0);
  });

test('documentation CLI rejects unknown options without changing files', (t) => {
  const root = fixture(t);
  const before = snapshot(root);
  const result = run(root, '--unknown');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /argument|option|usage/i);
  assert.deepEqual(snapshot(root), before);
});

test('every API has a useful declaration tooltip and documented return meaning', () => {
  const ts = require('typescript');
  const api = require('./api.json');
  const file = path.join(root, 'index.d.ts');
  const program = ts.createProgram([file], { target: ts.ScriptTarget.ES2020, noEmit: true });
  const checker = program.getTypeChecker();
  let declarations = 0;
  const seen = new Set();
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      const item = api.find((item) => item.name === name);
      assert.ok(item, 'Public declaration is documented: ' + name);
      const signature = checker.getSignatureFromDeclaration(node);
      const prose = ts.displayPartsToString(signature.getDocumentationComment(checker)).replace(/\s+/g, ' ');
      const tags = signature.getJsDocTags();
      assert.ok(prose.includes(item.summary), name + ': tooltip must explain the operation');
      const returned = tags.find((tag) => tag.name === 'returns');
      assert.ok(
        returned && ts.displayPartsToString(returned.text).replace(/\s+/g, ' ').includes(item.summaryReturn),
        name + ': tooltip must explain its result'
      );
      assert.ok(
        tags.some((tag) => tag.name === 'see' && ts.displayPartsToString(tag.text).includes('docs/API.md#')),
        name + ': tooltip links to the full reference'
      );
      for (const parameter of node.parameters) {
        assert.ok(
          tags.some(
            (tag) =>
              tag.name === 'param' && ts.displayPartsToString(tag.text).startsWith(parameter.name.getText() + ' ')
          ),
          name + ': parameter ' + parameter.name.getText()
        );
      }
      seen.add(name);
      declarations++;
    }
    ts.forEachChild(node, visit);
  }
  visit(program.getSourceFile(file));
  assert.deepEqual([...seen].sort(), api.map((item) => item.name).sort());
  assert.ok(declarations > seen.size, 'Overloads are included in tooltip validation');
});

test('generated source comments retain return meaning and executable examples', () => {
  const api = require('./api.json');
  const sourcePath = require('./source-path');
  for (const item of api) {
    const source = fs.readFileSync(path.join(root, sourcePath(item.name)), 'utf8');
    const comment = source.match(
      new RegExp('/\\*\\*((?:(?!\\*/)[\\s\\S])*)\\*/\\s*function ' + item.name + '\\(')
    )?.[1];
    assert.ok(comment, item.name + ': public source comment');
    const text = comment.replace(/\n\s*\*\s?/g, ' ').replace(/\s+/g, ' ');
    assert.ok(text.includes(item.summary), item.name + ': purpose is visible in JavaScript');
    assert.match(text, /@returns \{[^}]+\} \S/, item.name + ': return description is not empty');
    assert.ok(text.includes(item.summaryReturn), item.name + ': return meaning agrees with the summary');
    assert.ok(comment.includes('@example '), item.name + ': executable examples remain');
  }
});

for (const file of ['index.d.ts', 'src/isEmpty.js'])
  test(file + ': check detects stale API comments without editing code', (t) => {
    const temp = fixture(t);
    const location = path.join(temp, file);
    const summary = require('./api.json').find((item) => item.name === 'isEmpty').summary;
    const source = fs.readFileSync(location, 'utf8');
    assert.ok(source.includes(summary), 'The generated API description is present');
    fs.writeFileSync(location, source.replace(summary, 'Outdated generated description.'));
    const before = snapshot(temp);
    assert.notEqual(run(temp, '--check').status, 0);
    assert.deepEqual(snapshot(temp), before);
    assert.equal(run(temp).status, 0);
    assert.equal(run(temp, '--check').status, 0);
  });

test('return descriptions identify conversion results without leaked native function text', () => {
  const api = require('./api.json');
  for (const item of api) {
    assert.doesNotMatch(
      item.summaryReturn,
      /\[native code\]/,
      item.name + ': prose must not contain a stringified native function'
    );
  }
  const description = api.find((item) => item.name === 'toString').summaryReturn;
  assert.match(description, /\bstring\b/, 'String conversion must describe its string result');
});

test('conditional converter tooltips include the requested conversion boundaries', () => {
  const ts = require('typescript');
  const file = path.join(root, 'index.d.ts');
  const program = ts.createProgram([file], { target: ts.ScriptTarget.ES2020, noEmit: true });
  const checker = program.getTypeChecker();
  const required = {
    toArrayIf: /Consumes iterable input/,
    toBigIntIf: /Fractional numbers and invalid integer text throw/,
    toBooleanIf: /truthiness rather than parsing boolean text/,
    toDateIf: /May return an invalid Date/,
    toIntegerIf: /Does not guarantee a finite or safe integer/,
    toJsonIf: /Cycles and unhandled bigints throw/,
    toNumberIf: /lose bigint precision/,
    toPlainObjectIf: /fresh ordinary object/,
    toStringIf: /including for boxed symbols/,
    toSymbolIf: /unboxes genuine wrappers/
  };
  const seen = new Set();
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && Object.hasOwn(required, node.name.text)) {
      const prose = ts
        .displayPartsToString(checker.getSignatureFromDeclaration(node).getDocumentationComment(checker))
        .replace(/\s+/g, ' ');
      assert.match(prose, required[node.name.text], node.name.text + ': requested conversion is self-contained');
      seen.add(node.name.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(program.getSourceFile(file));
  assert.deepEqual([...seen].sort(), Object.keys(required).sort());
});
