'use strict';
const fs = require('node:fs');
const path = require('node:path');
const names = require('./exports.json');
const sourcePath = require('./source-path.js');
const root = path.join(__dirname, '..');
const write = (name, text) => fs.writeFileSync(path.join(root, name), text);
if (new Set(names).size !== names.length || names.some(name => !/^[A-Za-z][A-Za-z0-9]*$/.test(name))) {
    throw new TypeError('Export names must be unique JavaScript identifiers.');
}
for (const name of names) if (!fs.existsSync(path.join(root, sourcePath(name)))) throw new Error('Missing export implementation: '+name);
for (const dir of ['esm', 'types']) fs.mkdirSync(path.join(root, dir), {recursive:true});
write('index.js', "'use strict';\n\n" + names.map(name => `exports.${name} = require('./${sourcePath(name)}');`).join('\n') + '\n');
write('index.mjs', "// Named exports expose individual modules to bundlers. Function identities remain shared.\n" + names.map(name => `export { default as ${name} } from './${sourcePath(name)}';`).join('\n') + "\nexport { default } from './index.js';\n");
write('index.d.mts', "import Types from './index.js';\nexport default Types;\nexport { " + names.join(', ') + " } from './index.js';\nexport type { TypeName, PrimitiveTypeName, TypeMatcher, NarrowingMatcher, TypeGuard, PredicateMatcher, InstanceMatcher, TypedArray, Matched, ConversionCondition, ArrayElement, ConvertedObject } from './index.js';\n");
for (const name of names) {
    write(`esm/${name}.mjs`, `export { default } from '../${sourcePath(name)}';\n`);
    write(`types/${name}.d.ts`, `import Types = require('../index.js');\ndeclare const check: typeof Types.${name};\nexport = check;\n`);
    write(`types/${name}.d.mts`, `export { ${name} as default } from '../index.js';\n`);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const exportsMap = {
    '.': {import:{types:'./index.d.mts',default:'./index.mjs'},require:{types:'./index.d.ts',default:'./index.js'},default:'./index.js'}
};
for (const name of names) {
    const target = {
        import:{types:`./types/${name}.d.mts`,default:`./esm/${name}.mjs`},
        require:{types:`./types/${name}.d.ts`,default:`./${sourcePath(name)}`},default:`./${sourcePath(name)}`
    };
    const aliases = [`./${name}`, `./src/${name}`, `./src/${name}.js`];
    if (name.startsWith('to')) aliases.push(`./conversion/${name}`, `./conversion/${name}.js`, `./src/conversion/${name}`, `./src/conversion/${name}.js`);
    for (const alias of aliases) exportsMap[alias] = target;
}
exportsMap['./package.json']='./package.json';
for(const file of ['go-types.js','go-types.min.js','go-types.mjs'])exportsMap['./dist/'+file]='./dist/'+file;
pkg.exports=exportsMap;
write('package.json',JSON.stringify(pkg,null,2)+'\n');
console.log(`Generated consistent entry points for ${names.length} exports.`);
