'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--check'))
  throw Error('Usage: node scripts/docs.js [--check]');
const check = args[0] === '--check';
const outputs = new Map();
const api = require('./api.json');
const sourcePath = require('./source-path.js');
const documentation = require('./api-documentation');
for (const [file, text] of Object.entries(require('./readme.js')({ write: false, documents: true })))
  outputs.set(path.join(root, file), text);
// Refresh source API comments from the same reviewed metadata. Preserve implementation rationale.
for (const item of api) {
  const file = path.join(root, sourcePath(item.name));
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(/\/\*\*[\s\S]*?\*\/\s*/g, '');
  const comment = documentation.comment(item, { source: true }) + '\n';
  const start = source.indexOf('function ' + item.name + '(');
  if (start < 0) throw Error('Missing named public function: ' + item.name);
  source = source.slice(0, start) + comment + source.slice(start);
  outputs.set(file, source);
}
const declarationFile = path.join(root, 'index.d.ts');
outputs.set(declarationFile, documentation.declarations(fs.readFileSync(declarationFile, 'utf8')));
if (check) {
  const stale = [...outputs]
    .filter(
      ([file, text]) =>
        !fs.existsSync(file) || fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') !== text.replace(/\r\n/g, '\n')
    )
    .map(([file]) => path.relative(root, file));
  if (stale.length) throw Error('Stale documentation: ' + stale.join(', ') + '. Run npm run docs.');
  console.log('Generated documentation is current.');
} else {
  for (const [file, text] of outputs) fs.writeFileSync(file, text);
  console.log(`Generated README, API reference, source comments and declaration tooltips for ${api.length} exports.`);
}
