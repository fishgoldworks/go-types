'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const exampleResult = require('./fixtures/exampleResult.cjs');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
const root = path.resolve(process.env.GO_TYPES_DOCUMENTATION_ROOT || path.join(__dirname, '..'));
const Types = require(path.join(root, 'index.js'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
function checkTypes(code, filename) {
  const options = {
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    esModuleInterop: true,
    module: ts.ModuleKind.NodeNext,
    target: ts.ScriptTarget.ES2020,
    types: [],
    baseUrl: root,
    paths: { 'go-types': ['./index.d.ts'] }
  };
  const host = ts.createCompilerHost(options),
    original = host.getSourceFile.bind(host);
  host.getSourceFile = (file, ...args) =>
    path.resolve(file) === filename
      ? ts.createSourceFile(file, code, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TS)
      : original(file, ...args);
  const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([filename], options, host));
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n'
    })
  );
}
async function imported(specifier) {
  if (specifier === 'go-fns') {
    const entry = path.resolve(process.env.GO_TYPES_GO_FNS_ROOT, 'index.js');
    return import(pathToFileURL(entry).href);
  }
  assert.match(specifier, /^go-types(?:\/[A-Za-z]+)?$/);
  const name = specifier.slice('go-types/'.length);
  if (!manifest.exports)
    return specifier === 'go-types' ? { default: Types, ...Types } : { default: Types[name], [name]: Types[name] };
  const entry = manifest.exports[specifier === 'go-types' ? '.' : './' + name];
  const route = Array.isArray(entry) ? entry[0] : entry;
  const target = typeof route.import === 'string' ? route.import : route.import.default;
  return import(pathToFileURL(path.join(root, target)).href);
}
for (const file of ['README.md', 'docs/API.md', 'docs/conversions.md'])
  test(file + ': adoption and shared-contract examples execute; TypeScript compiles', async (t) => {
    const text = file === 'docs/API.md' ? read(file).split('## Behaviour\n')[1] : read(file);
    assert.ok(text);
    let examples = 0;
    for (const [index, block] of [...text.matchAll(/```(javascript|typescript|html)\n([\s\S]*?)\n```/g)].entries()) {
      let code = block[2];
      if (file === 'docs/conversions.md') {
        if (!code.includes('// => ')) continue;
        code = code.replace(/;\s*\n\s*\/\/ => ([^\n]+)/g, '; // => $1');
      }
      // The companion library is optional; never substitute mock combinators.
      if (/^import .+ from ['"]go-fns['"];$/m.test(code) && !process.env.GO_TYPES_GO_FNS_ROOT) {
        await t.test(
          'Optional go-fns composition examples',
          {
            skip: 'Set GO_TYPES_GO_FNS_ROOT to a go-fns checkout or installed package to run these examples.'
          },
          () => {}
        );
        continue;
      }
      if (block[1] === 'typescript') {
        checkTypes(code, path.join(root, '.documentation-example-' + index + '.mts'));
        code = ts.transpileModule(code, {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
        }).outputText;
      }
      if (block[1] === 'html')
        code = [...code.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n');
      const imports = {},
        values = [];
      for (const match of code.matchAll(/^import (.+?) from ['"]([^'"]+)['"];$/gm)) {
        const namespace = await imported(match[2]);
        const variable = '__import' + values.length;
        values.push(namespace);
        imports[variable] = namespace;
        const binding = match[1].startsWith('{') ? match[1] : match[1];
        code = code.replace(
          match[0],
          'const ' + binding + ' = ' + variable + (binding.startsWith('{') ? '' : '.default') + ';'
        );
      }
      code = code.replace(/require\('go-types(?:\/([A-Za-z]+))?'\)/g, (_, name) => (name ? '__api.' + name : '__api'));
      code = code
        .split('\n')
        .map((line) => {
          const match = line.match(/^(.*?)\s*;\s*\/\/ => (.+?)\s*$/);
          if (!match) return line;
          examples++;
          const expected = exampleResult(match[2]);
          return expected.startsWith('throws ')
            ? 'assert.throws(() => (' + match[1] + '), ' + expected.slice(7) + ');'
            : 'assert.deepStrictEqual((' + match[1] + '), (' + expected + '));';
        })
        .join('\n');
      await Function(
        'assert',
        'Types',
        '__api',
        ...Object.keys(Types),
        ...Object.keys(imports),
        'return (async function () {' + code + '\n})();'
      )(assert, Types, Types, ...Object.values(Types), ...values);
    }
    assert.ok(examples > 0, file + ': examples must assert documented results');
  });
