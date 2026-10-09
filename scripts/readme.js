'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const api = require('./api.json');
const names = require('./exports.json');
const pkg = require('../package.json');

// Keep the original README's category order and heading hierarchy. New checks
// extend the related categories; conversions have their own complete sections.
const categories = [
  ['Primitive', ['isUndefined', 'isNull', 'isBoolean', 'isNumber', 'isString', 'isSymbol', 'isBigInt', 'isPrimitive']],
  [
    'Utility',
    [
      'isNullish',
      'isNonNullish',
      'isEmpty',
      'isBlank',
      'isTruthy',
      'isFalsy',
      'isTypeOf',
      'createTypeChecker',
      'isJson'
    ]
  ],
  ['Number', ['isInteger', 'isSafeInteger', 'isFloat', 'isFinite', 'isInfinite', 'isNaN', 'isNumeric']],
  [
    'Object',
    [
      'isObject',
      'isObjectLike',
      'isPlainObject',
      'isCyclic',
      'isIterable',
      'isAsyncIterable',
      'isIteratorLike',
      'isEmptyIterable',
      'isBlankIterable',
      'isFunction',
      'isDate',
      'isValidDate',
      'isInvalidDate',
      'isRegExp',
      'isPromise',
      'isPromiseLike',
      'isThenable',
      'isError'
    ]
  ],
  ['Array', ['isArray', 'isNonEmptyArray', 'isArrayOf', 'isArrayLike', 'isArrayLikeOf', 'isPair']],
  ['Collection', ['isMap', 'isMapOf', 'isSet', 'isSetOf', 'isWeakMap', 'isWeakSet']],
  ['DOM', ['isNode', 'isElement', 'isFragment']],
  ['Binary', ['isArrayBuffer', 'isSharedArrayBuffer', 'isArrayBufferView', 'isTypedArray', 'isDataView']],
  [
    'Conversion',
    [
      'toArray',
      'toBigInt',
      'toBoolean',
      'toDate',
      'toInteger',
      'toMap',
      'toNumber',
      'toObject',
      'toSet',
      'toString',
      'toSymbol'
    ]
  ],
  [
    'Conditional conversion',
    [
      'toArrayIf',
      'toBigIntIf',
      'toBooleanIf',
      'toDateIf',
      'toIntegerIf',
      'toMapIf',
      'toNumberIf',
      'toObjectIf',
      'toSetIf',
      'toStringIf',
      'toSymbolIf'
    ]
  ]
];

// Multi-step examples are easier to copy than immediately invoked expressions.
// They are executed directly from the generated API reference by the tests.
const readableExamples = {
  isCyclic: `const value = {};
value.self = value;

isCyclic(value); // => true
isCyclic({ a: 1, b: { c: 1 } }); // => false

const shared = {};
isCyclic({ a: shared, b: shared }); // => false`,
  isTypeOf: `class Account {}

isTypeOf(42, 'number'); // => true
isTypeOf(new Account(), Account); // => true
isTypeOf('hello', { predicate: isString }); // => true
isTypeOf(null, ['string', null]); // => true
isTypeOf('42', Number); // => false
isTypeOf(42, 'nubmer'); // => throws TypeError`,
  createTypeChecker: `const isNumberOrNull = createTypeChecker(['number', null]);

isNumberOrNull(42); // => true
isNumberOrNull(null); // => true
isNumberOrNull('42'); // => false

const isText = createTypeChecker('string');
[1, 'hello', null, 'world'].filter(isText); // => ['hello', 'world']

createTypeChecker([])(undefined); // => false`,
  isAsyncIterable: `async function* values() {
  yield 1;
}

isAsyncIterable(values()); // => true
isAsyncIterable([]); // => false`,
  isIteratorLike: `const iterator = [1, 2][Symbol.iterator]();

isIteratorLike(iterator); // => true
isIteratorLike({ next() {} }); // => true
isIteratorLike([]); // => false
isIteratorLike({ next: 1 }); // => false`,
  isEmptyIterable: `function* values() {
  yield 1;
}

isEmptyIterable([]); // => true
isEmptyIterable(values()); // => false
isEmptyIterable(null); // => throws TypeError`,
  isBlankIterable: `function* values() {
  yield null;
  yield undefined;
}

isBlankIterable(values()); // => true
isBlankIterable([0]); // => false
isBlankIterable(new Map([['key', null]])); // => false`,
  toBigInt: `toBigInt('9007199254740993'); // => 9007199254740993n
toBigInt(true); // => 1n
toBigInt('0xff'); // => 255n
toBigInt(1.5); // => throws RangeError`,
  toBigIntIf: `toBigIntIf('42', true); // => 42n
toBigIntIf('42', false); // => '42'
toBigIntIf('42'); // => '42'
toBigIntIf('42', value => typeof value === 'string'); // => 42n`,
  toDate: `toDate(0).toISOString(); // => '1970-01-01T00:00:00.000Z'
toDate('2024-01-01T00:00:00.000Z').getTime(); // => 1704067200000
isInvalidDate(toDate('not a date')); // => true
isInvalidDate(toDate(undefined)); // => true

const date = new Date(0);
toDate(date) === date; // => true`,
  toObject: `toObject(42).valueOf(); // => 42
typeof toObject(42); // => 'object'
toObject(null); // => ({})

const object = { x: 1 };
toObject(object) === object; // => true`,
  toSymbol: `toSymbol('key').description; // => 'key'
toSymbol('key') !== toSymbol('key'); // => true

const symbol = Symbol('key');
toSymbol(symbol) === symbol; // => true
toSymbol(Object(symbol)) === symbol; // => true`
};

const { signature, anchor, returnType, parameters, conversionDetails } = require('./api-documentation');

// Readable examples retain the reviewed reference's complete executable coverage.
const referenceExamples = {
  isArrayOf:
    'isArrayOf([1,2], "number");    // => true\nisArrayOf([], "number");       // => true\n\nisArrayOf([1,"x"], "number");  // => false',
  isArrayLikeOf:
    'isArrayLikeOf({0:1,length:1}, "number");     // => true\nisArrayLikeOf({length:0}, "number");         // => true\n\nisArrayLikeOf({0:"x",length:1}, "number");   // => false',
  isSetOf:
    'isSetOf(new Set([1,2]), "number");     // => true\nisSetOf(new Set(), "number");          // => true\n\nisSetOf(new Set([1,"x"]), "number");   // => false'
};

function parameterTable(item) {
  const entries = parameters(item);
  const optional = entries.some((parameter) => parameter.optional);
  const table = [
    optional ? '| Parameter | Type | Default | Description |' : '| Parameter | Type | Description |',
    optional ? '| --- | --- | --- | --- |' : '| --- | --- | --- |'
  ];
  for (const parameter of entries) {
    const type =
      parameter.type === 'TypeMatcher'
        ? '[`TypeMatcher`](#type-specifications)'
        : '`' + parameter.type.replace(/\|/g, '\\|') + '`';
    table.push(
      '| `' +
        parameter.name +
        (parameter.optional ? '?' : '') +
        '` | ' +
        type +
        ' | ' +
        (optional ? (parameter.optional ? '`undefined`' : '—') + ' | ' : '') +
        parameter.description +
        ' |'
    );
  }
  return table.join('\n');
}
function returns(item) {
  return '**Returns:** `' + returnType(item) + '` — ' + item.summaryReturn;
}
function formatReference(code, minimum = 32) {
  const lines = code.split('\n');
  const parts = lines.map((line) => line.match(/^(.*?)\s+\/\/ => (.+)$/));
  const column = Math.ceil(Math.max(minimum, ...parts.filter(Boolean).map((match) => match[1].length + 3)) / 2) * 2;
  return lines
    .map((line, index) => (parts[index] ? parts[index][1].padEnd(column - 1) + '// => ' + parts[index][2] : line))
    .join('\n');
}
module.exports = function generateReadme({ write = true, documents = false } = {}) {
  const allNames = categories.flatMap(([, members]) => members);
  if (
    allNames.length !== names.length ||
    new Set(allNames).size !== allNames.length ||
    allNames.some((name) => !names.includes(name))
  ) {
    throw new Error('README categories must contain every public export exactly once.');
  }
  const byName = new Map(api.map((item) => [item.name, item]));
  if (allNames.some((name) => !byName.has(name))) throw new Error('Missing API metadata for README.');
  const summary = [categories.map(([name]) => `[${name}](#${name.toLowerCase().replace(/ /g, '-')})`).join(' · '), ''];
  const documentation = [];
  for (const [category, members] of categories) {
    summary.push('**' + category + '**', '', '| API | Description | Returns |', '| --- | --- | --- |');
    documentation.push('## ' + category, '');
    if (category === 'DOM')
      documentation.push(
        'Run the positive examples in a web browser. Without the corresponding DOM constructors, these checks return `false`.',
        ''
      );
    if (category === 'Conversion')
      documentation.push(
        'These functions explicitly convert values. Native coercion rules, exceptions, and observable side effects are part of their documented contracts.',
        ''
      );
    if (category === 'Conditional conversion')
      documentation.push(
        'Each `If` function accepts a boolean or synchronous boolean-returning predicate. A `false`, omitted, or `undefined` condition returns the input unchanged without converting or inspecting it.',
        ''
      );
    for (const [index, name] of members.entries()) {
      if (index > 0) documentation.push('---', '');
      const item = byName.get(name);
      if (!item.summaryReturn) throw new Error('Missing summary return description: ' + name);
      const type = returnType(item).replace(/\|/g, '\\|');
      const label = name === 'createTypeChecker' ? '**`Function`** — `' + type + '`' : '**`' + type + '`**';
      summary.push(
        `| [\`${signature(item)}\`](#${anchor(item)}) | ${item.summary} | ${label}<br><br>${item.summaryReturn} |`
      );
      documentation.push(
        '### `' + signature(item) + '`',
        '',
        item.summary,
        '',
        [item.description, conversionDetails(item)].filter(Boolean).join('\n\n'),
        '',
        '**Parameters**',
        '',
        parameterTable(item),
        '',
        returns(item),
        ''
      );
      if (item.errors) documentation.push('**Errors:** ' + item.errors, '');
      documentation.push('**Examples**', '');
      if (name === 'isSharedArrayBuffer')
        documentation.push('The positive example requires native `SharedArrayBuffer` support.', '');
      if (['isBigInt', 'isPrimitive', 'toBigInt', 'toBigIntIf'].includes(name))
        documentation.push('Examples using bigint literals require native BigInt support.', '');
      if (name === 'isAsyncIterable')
        documentation.push('The positive example requires native async-generator support.', '');
      let code = Object.hasOwn(referenceExamples, name)
        ? referenceExamples[name]
        : Object.hasOwn(readableExamples, name)
          ? readableExamples[name]
          : item.examples
              .map((example) => example.expression + '; // => ' + JSON.stringify(example.expected))
              .join('\n');
      const metadataCode = item.examples
        .map((example) => example.expression + '; // => ' + JSON.stringify(example.expected))
        .join('\n');
      const minimum =
        Math.ceil(
          Math.max(
            32,
            ...[code, metadataCode]
              .join('\n')
              .split('\n')
              .map((line) => (line.match(/^(.*?)\s+\/\/ => /)?.[1].length || 0) + 3)
          ) / 2
        ) * 2;
      documentation.push('```javascript\n' + formatReference(code, minimum) + '\n```', '');
      if (Object.hasOwn(referenceExamples, name) || Object.hasOwn(readableExamples, name)) {
        documentation.push(
          '**Additional examples**',
          '',
          '```javascript\n' + formatReference(metadataCode, minimum) + '\n```',
          ''
        );
      }
      if (item.notes)
        documentation.push(
          '**Notes**',
          '',
          item.notes
            .replace(
              'See docs/API.md for the matcher contract.',
              'See [Type specifications](#type-specifications) for the matcher contract.'
            )
            .trim(),
          ''
        );
    }
    summary.push('');
  }
  summary.push(
    '`T` is the input type. `ArrayElement<T>[]` preserves inferred iterable/array-like element types, `ConvertedMap<T>` and `ConvertedSet<T>` preserve inferred collection types, and `ConvertedObject<T>` preserves objects or describes the native boxed result. Conditional conversions retain `T` when skipped; literal conditions select the corresponding declaration overload. Checks return boolean values, with narrowing available only where described under [TypeScript](#typescript).',
    ''
  );
  const replacements = {
    VERSION: pkg.version,
    COUNT: String(names.length),
    DOCS_COVERAGE: String((100 * allNames.length) / names.length),
    DOCUMENTATION: documentation.join('\n').trimEnd(),
    API_SUMMARY: summary.join('\n').trimEnd(),
    TOC: '{{TOC}}'
  };
  const outputs = {};
  for (const [name, destination] of [
    ['README', 'README.md'],
    ['API', 'docs/API.md']
  ]) {
    const template = fs.readFileSync(path.join(__dirname, name + '.template.md'), 'utf8');
    let output = template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
      if (!(key in replacements)) throw new Error('Unknown documentation placeholder: ' + key);
      return name === 'README' && key === 'API_SUMMARY'
        ? replacements[key].replace(/\]\(#/g, '](docs/API.md#')
        : replacements[key];
    });
    const toc = [...output.matchAll(/^(#{2,3}) (.+)$/gm)]
      .filter(
        ([, level, title]) => title !== 'Contents' && (level === '##' || (name === 'API' && !title.startsWith('`')))
      )
      .map(([, level, title]) => {
        return (level === '###' ? '  ' : '') + '- [' + title + '](#' + title.toLowerCase().replace(/ /g, '-') + ')';
      })
      .join('\n');
    output = output.replace('{{TOC}}', toc);
    outputs[destination] = output;
    if (write) fs.writeFileSync(path.join(root, destination), output);
  }
  return documents ? outputs : outputs['README.md'];
};
if (require.main === module) module.exports();
