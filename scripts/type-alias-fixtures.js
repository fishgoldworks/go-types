'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const names = require('./exports.json');

module.exports = function aliasFixtures(pkg) {
  const aliases = Object.keys(pkg.exports).filter(
    (alias) => alias !== '.' && alias !== './package.json' && !alias.startsWith('./dist/')
  );
  const aliasTypes = [
    "import Types = require('go-types');",
    'type IsAny<T> = 0 extends (1 & T) ? true : false;',
    'type NotAny<T extends false> = T;'
  ];
  const esmAliasTypes = [
    "import Types from 'go-types';",
    'type IsAny<T> = 0 extends (1 & T) ? true : false;',
    'type NotAny<T extends false> = T;'
  ];
  for (const [index, alias] of aliases.entries()) {
    const name = path.posix.basename(alias).replace(/\.js$/, '');
    assert.ok(names.includes(name), 'Unknown public alias: ' + alias);
    aliasTypes.push(
      'import alias' + index + ' = require(' + JSON.stringify('go-types/' + alias.slice(2)) + ');',
      'const typed' + index + ': typeof Types.' + name + ' = alias' + index + ';',
      'type Checked' + index + ' = NotAny<IsAny<typeof alias' + index + '>>;',
      'if (typed' +
        index +
        ' !== Types.' +
        name +
        ') throw new Error(' +
        JSON.stringify('Alias identity: ' + alias) +
        ');'
    );
    esmAliasTypes.push(
      'import alias' + index + ' from ' + JSON.stringify('go-types/' + alias.slice(2)) + ';',
      'const typed' + index + ': typeof Types.' + name + ' = alias' + index + ';',
      'type Checked' + index + ' = NotAny<IsAny<typeof alias' + index + '>>;',
      'if (typed' +
        index +
        ' !== Types.' +
        name +
        ') throw new Error(' +
        JSON.stringify('ESM alias identity: ' + alias) +
        ');'
    );
    esmAliasTypes.push(
      'import { ' + name + ' as namedAlias' + index + ' } from ' + JSON.stringify('go-types/' + alias.slice(2)) + ';',
      'const namedTyped' + index + ': typeof Types.' + name + ' = namedAlias' + index + ';',
      'type NamedChecked' + index + ' = NotAny<IsAny<typeof namedAlias' + index + '>>;',
      'if (namedTyped' +
        index +
        ' !== alias' +
        index +
        ') throw new Error(' +
        JSON.stringify('Named ESM alias identity: ' + alias) +
        ');'
    );
  }
  return { aliases, aliasTypes, esmAliasTypes };
};
