'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.env.GO_TYPES_DOCUMENTATION_ROOT || path.join(__dirname, '..'));
const Types = require(path.join(root, 'index.js'));
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const reference = fs.readFileSync(path.join(root, 'docs/API.md'), 'utf8');
const apiNames = Object.keys(Types);
const domNames = new Set(['isNode', 'isElement', 'isDocumentFragment']);
const headings = [...reference.matchAll(/^(#{1,4}) ([^\n]+)$/gm)];
const sections = new Map(
  headings.flatMap((heading, index) => {
    const name = heading[2].replace(/^`|`$/g, '').split('(')[0];
    if (heading[1] !== '###' || !apiNames.includes(name)) return [];
    const end = headings[index + 1]?.index ?? reference.length;
    return [[name, reference.slice(heading.index, end)]];
  })
);

function exampleBlocks(section) {
  return [...section.matchAll(/```javascript\n([\s\S]*?)\n```/g)].map((match) => match[1]);
}

// Test the rendered documentation, rather than regenerating expected text from
// the template: assertions must catch missing sections and incorrect examples.
function executableExample(code) {
  let assertions = 0;
  const program = code
    .split('\n')
    .map((line) => {
      const statement = line.match(/^(.*?)\s*;\s*\/\/ => (.+?)\s*$/);
      if (statement) {
        assertions++;
        if (statement[2].startsWith('throws ')) {
          const type = statement[2].slice('throws '.length);
          assert.match(type, /^(TypeError|RangeError|SyntaxError|Error)$/);
          return `assert.throws(() => (${statement[1]}), ${type});`;
        }
        return `assert.deepStrictEqual((${statement[1]}), (${statement[2]}));`;
      }
      return line;
    })
    .join('\n');
  assert.ok(assertions > 0, 'Each example block must state an expected result');
  return program;
}

test('README uses the shared Markdown title, section order and usage headings', () => {
  assert.match(readme, /^# Go Types\n/);
  const expected = [
    '## Contents',
    '## Installation',
    '## Usage',
    '## API summary',
    '## Behaviour',
    '## TypeScript',
    '## Performance',
    '## Migration',
    '## Development',
    '## Further reading',
    '## Licence'
  ];
  let previous = -1;
  for (const heading of expected) {
    const position = readme.indexOf(heading + '\n');
    assert.ok(position > previous, `${heading} must exist in the original order`);
    previous = position;
  }
  for (const heading of ['### ES modules', '### CommonJS', '### Browser']) {
    assert.ok(readme.includes(heading + '\n'), heading);
  }
  const prose = readme.replace(/```[^\n]*\n[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  assert.doesNotMatch(
    prose.replace(/<br><br>/g, ''),
    /<\/?[A-Za-z][^>]*>/,
    'Use Markdown layout, allowing the Returns-cell line breaks'
  );
});

test('README Contents lists every main section and selected useful subsections', () => {
  const contents = readme.split('## Contents\n')[1].split('\n## Installation')[0];
  for (const [, title] of readme.matchAll(/^## (.+)$/gm)) {
    if (title !== 'Contents') assert.ok(contents.includes('[' + title + ']'), title);
  }
  assert.match(contents, /\[API summary\]\(#api-summary\)/);
  assert.doesNotMatch(contents, /\[isUndefined/);
  for (const [, target] of contents.matchAll(/\]\(([^)]+)\)/g)) {
    assert.ok(target.startsWith('#'), 'Contents must link within the current document: ' + target);
  }
});

test('README API summary links every public function to its signature with return types', () => {
  const summary = readme.split('## API summary\n')[1].split('\n## Behaviour')[0];
  const links = [
    ...summary.matchAll(
      /^\| \[\x60([A-Za-z]+)\(([^\x60]*)\)\x60\]\(docs\/API\.md#([a-z-]+)\) \| (.+) \| \*\*\x60([^\x60]+)\x60\*\*(?: — \x60([^\x60]+)\x60)?<br><br>(.+) \|$/gm
    )
  ];
  assert.deepEqual(links.map((match) => match[1]).sort(), [...apiNames].sort());
  for (const [, name, params, target, , returns, signature, meaning] of links) {
    assert.equal(
      target,
      (name + '(' + params + ')')
        .toLowerCase()
        .replace(/[^\w -]/g, '')
        .replace(/ /g, '-')
    );
    assert.ok(returns.length > 0, name + ' return type');
    assert.ok(meaning.trim().length > 0, name + ' return meaning');
    assert.equal(signature, undefined, name + ' is not a function factory');
  }
  assert.match(summary, /\[DOM\]\(docs\/API\.md#dom\)/);
});

test('API reference documents every public function, including all conversions', () => {
  assert.deepEqual([...sections.keys()].sort(), [...apiNames].sort());
  assert.deepEqual(
    [...reference.matchAll(/^### `(\w+)\([^\n]*\)`$/gm)].map((match) => match[1]).sort(),
    [...apiNames].sort()
  );
  for (const [name, section] of sections) {
    assert.match(section, /^\*\*Parameters\*\*$/m, name);
    assert.match(section, /^\| Parameter \| Type \|(?: Default \|)? Description \|$/m, name);
    assert.match(section, /^\*\*Examples\*\*$/m, name);
    assert.match(section, /^\*\*Returns:\*\* \x60.+\x60/m, name);
    assert.ok(exampleBlocks(section).length > 0, `${name}: runnable usage example`);
  }
});

test('README and API reference local links resolve across documents', () => {
  function anchors(markdown) {
    const slugs = new Set(),
      duplicates = new Map();
    const prose = markdown.replace(/\x60\x60\x60[^\n]*\n[\s\S]*?\x60\x60\x60/g, '').replace(/\x60/g, '');
    for (const match of prose.matchAll(/^#{1,6} (.+)$/gm)) {
      const base = match[1]
        .toLowerCase()
        .replace(/[^\w\- ]/g, '')
        .replace(/ /g, '-');
      const duplicate = duplicates.get(base) || 0;
      slugs.add(base + (duplicate ? '-' + duplicate : ''));
      duplicates.set(base, duplicate + 1);
    }
    return slugs;
  }
  for (const [file, text] of [
    ['README.md', readme],
    ['docs/API.md', reference]
  ]) {
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/i.test(target)) continue;
      const [relative, fragment] = target.split('#');
      const resolved = relative ? path.resolve(root, path.dirname(file), relative) : path.join(root, file);
      assert.ok(fs.existsSync(resolved), file + ': ' + target);
      if (fragment) assert.ok(anchors(fs.readFileSync(resolved, 'utf8')).has(fragment), file + ': ' + target);
    }
  }
  const introduction = readme.split('## Contents\n')[0];
  const summary = readme.split('## API summary\n')[1].split('\n## ')[0];
  assert.match(introduction, /\*\*\[View full API documentation\]\(docs\/API\.md\)\*\*/);
  assert.match(summary, /\*\*\[full API documentation\]\(docs\/API\.md\)\*\*/);
  assert.doesNotMatch(readme, /^#### /m);
});

test('README has the package version and no temporary publication wording', () => {
  assert.doesNotMatch(readme, /unpublished|release candidate|source candidate|not published|rc\.1|PATCH:/i);
  assert.match(readme, /\*\*Version:\*\* \[2\.0\.0\]\(CHANGELOG\.md\)/);
  assert.match(readme, /\*\*Licence:\*\* \[MIT\]\(LICENSE\.md\)/);
});

for (const name of apiNames) {
  test(`API ${name}: examples ${domNames.has(name) ? 'compile for the browser' : 'return their documented results'}`, () => {
    const section = sections.get(name);
    assert.ok(section, `${name} documentation must exist in docs/API.md`);
    const blocks = exampleBlocks(section);
    assert.ok(blocks.length > 0, name);
    for (const code of blocks) {
      const evaluate = Function('assert', ...apiNames, executableExample(code));
      if (!domNames.has(name)) evaluate(assert, ...Object.values(Types));
    }
  });
}

test('README result comments follow the shared even-column alignment rule', () => {
  for (const section of (readme + reference).split(/(?=^#{2,4} )/m)) {
    const code = [...section.matchAll(/\x60\x60\x60(?:javascript|typescript|html)\n([\s\S]*?)\n\x60\x60\x60/g)]
      .map((match) => match[1])
      .join('\n');
    const results = code
      .split('\n')
      .map((line) => line.match(/^(.*?)\s+\/\/ => (.+)$/))
      .filter(Boolean);
    if (!results.length) continue;
    const column = Math.ceil(Math.max(32, ...results.map((match) => match[1].length + 3)) / 2) * 2;
    for (const line of code.split('\n').filter((line) => /\s+\/\/ => /.test(line)))
      assert.equal(line.indexOf('// =>') + 1, column, line);
  }
});
