'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Types = require('go-types');
const root = path.join(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const apiNames = Object.keys(Types);
const domNames = new Set(['isNode', 'isElement', 'isFragment']);
const headings = [...readme.matchAll(/^(#{1,4}) ([^\n]+)$/gm)];
const sections = new Map(headings.flatMap((heading, index) => {
    if (heading[1] !== '####' || !apiNames.includes(heading[2])) return [];
    const end = headings[index + 1]?.index ?? readme.length;
    return [[heading[2], readme.slice(heading.index, end)]];
}));

function exampleBlocks(section) {
    return [...section.matchAll(/```javascript\n([\s\S]*?)\n```/g)].map(match => match[1]);
}

// Test the rendered documentation, rather than regenerating expected text from
// the template: assertions must catch missing sections and incorrect examples.
function executableExample(code) {
    let assertions = 0;
    const program = code.split('\n').map(line => {
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
    }).join('\n');
    assert.ok(assertions > 0, 'Each example block must state an expected result');
    return program;
}

test('README retains the original Markdown title and top-level structure', () => {
    assert.match(readme, /^# Go Types\n/);
    const expected = ['## Installation', '## Usage', '## Documentation'];
    let previous = -1;
    for (const heading of expected) {
        const position = readme.indexOf(heading + '\n');
        assert.ok(position > previous, `${heading} must exist in the original order`);
        previous = position;
    }
    for (const heading of ['### ES6', '### Node', '### Web browser']) {
        assert.ok(readme.includes(heading + '\n'), heading);
    }
    const prose = readme.replace(/```[^\n]*\n[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
    assert.doesNotMatch(prose, /<\/?[A-Za-z][^>]*>/, 'Use Markdown, not HTML layout');
});

test('README table of contents links to every public function locally', () => {
    const links = [...readme.matchAll(/^    \*   \[([A-Za-z]+)\]\(#([a-z]+)\)$/gm)];
    assert.deepEqual(links.map(match => match[1]).sort(), [...apiNames].sort());
    for (const [, name, anchor] of links) assert.equal(anchor, name.toLowerCase());
});


test('README Node catalogue link targets API documentation, not the usage section', () => {
    const toc = readme.slice(readme.indexOf('#### Table of Contents'), readme.indexOf('### Primitive'));
    assert.match(toc, /^\*   \[Node\]\(#node-1\)$/m);
});

test('README documents every public function inline, including all conversions', () => {
    assert.deepEqual([...sections.keys()].sort(), [...apiNames].sort());
    for (const [name, section] of sections) {
        assert.match(section, /^##### Parameters$/m, name);
        assert.match(section, /^##### Examples$/m, name);
        assert.match(section, /^Returns \*\*.+\*\*/m, name);
        assert.ok(exampleBlocks(section).length > 0, `${name}: runnable usage example`);
    }
});

test('README local links resolve to headings', () => {
    const slugs = new Set();
    const duplicates = new Map();
    const prose = readme.replace(/```[^\n]*\n[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
    for (const match of prose.matchAll(/^#{1,6} (.+)$/gm)) {
        const base = match[1].toLowerCase().replace(/[^\w\- ]/g, '').replace(/ /g, '-');
        const duplicate = duplicates.get(base) || 0;
        slugs.add(base + (duplicate ? '-' + duplicate : ''));
        duplicates.set(base, duplicate + 1);
    }
    for (const match of prose.matchAll(/\]\(#([^\)]+)\)/g)) {
        assert.ok(slugs.has(match[1]), 'Broken local link: #' + match[1]);
    }
});

test('README has the package version and no temporary publication wording', () => {
    assert.doesNotMatch(readme, /unpublished|release candidate|source candidate|not published|rc\.1|PATCH:/i);
    assert.match(readme, /\*\*version\*\*: 2\.0\.0/);
    assert.match(readme, /\*\*licence\*\*: MIT/);
});

for (const name of apiNames) {
    test(`README ${name}: examples ${domNames.has(name) ? 'compile for the browser' : 'return their documented results'}`, () => {
        const section = sections.get(name);
        assert.ok(section, `${name} documentation must be inline`);
        const blocks = exampleBlocks(section);
        assert.ok(blocks.length > 0, name);
        for (const code of blocks) {
            const evaluate = Function('assert', ...apiNames, executableExample(code));
            if (!domNames.has(name)) evaluate(assert, ...Object.values(Types));
        }
    });
}
