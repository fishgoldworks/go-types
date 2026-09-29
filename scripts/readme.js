'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const api = require('./api.json');
const names = require('./exports.json');
const pkg = require('../package.json');
const formatExamples = require('./format-examples.js');

// Keep the original README's category order and heading hierarchy. New checks
// extend the related categories; conversions have their own complete sections.
const categories = [
    ['Primitive', ['isUndefined', 'isNull', 'isBoolean', 'isNumber', 'isString', 'isSymbol', 'isBigInt', 'isPrimitive']],
    ['Utility', ['isNullish', 'isNonNullish', 'isEmpty', 'isBlank', 'isTruthy', 'isFalsy', 'isTypeOf', 'createTypeChecker', 'isJson']],
    ['Number', ['isInteger', 'isSafeInteger', 'isFloat', 'isFinite', 'isInfinite', 'isNaN', 'isNumeric']],
    ['Object', ['isObject', 'isObjectLike', 'isPlainObject', 'isCyclic', 'isIterable', 'isAsyncIterable', 'isIteratorLike', 'isEmptyIterable', 'isBlankIterable', 'isFunction', 'isDate', 'isValidDate', 'isInvalidDate', 'isRegExp', 'isPromise', 'isPromiseLike', 'isThenable', 'isError']],
    ['Array', ['isArray', 'isNonEmptyArray', 'isArrayOf', 'isArrayLike', 'isArrayLikeOf', 'isPair']],
    ['Collection', ['isMap', 'isMapOf', 'isSet', 'isSetOf', 'isWeakMap', 'isWeakSet']],
    ['Node', ['isNode', 'isElement', 'isFragment']],
    ['Binary', ['isArrayBuffer', 'isSharedArrayBuffer', 'isArrayBufferView', 'isTypedArray', 'isDataView']],
    ['Conversion', ['toArray', 'toBigInt', 'toBoolean', 'toDate', 'toInteger', 'toNumber', 'toObject', 'toString', 'toSymbol']],
    ['Conditional conversion', ['toArrayIf', 'toBigIntIf', 'toBooleanIf', 'toDateIf', 'toIntegerIf', 'toNumberIf', 'toObjectIf', 'toStringIf', 'toSymbolIf']],
];

// Multi-step examples are easier to copy than immediately invoked expressions.
// They are executed directly from the generated README by the tests.
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
toSymbol(Object(symbol)) === symbol; // => true`,
};

const conversionReturns = {
    toArray: ['Array', 'A new shallow array containing the input items.'],
    toBigInt: ['bigint', 'The converted primitive bigint.'],
    toBoolean: ['boolean', 'The JavaScript truthiness of the input as a primitive boolean.'],
    toDate: ['Date', 'The original genuine Date, or a Date constructed from the input. The result can be invalid.'],
    toInteger: ['number', 'The numeric conversion truncated toward zero. The result can be NaN or infinite.'],
    toNumber: ['number', 'The converted primitive number. The result can be NaN or infinite.'],
    toObject: ['object', 'The original object/function, a boxed primitive, or a fresh empty object for nullish input.'],
    toString: ['string', 'The converted primitive string.'],
    toSymbol: ['symbol', 'The original/unboxed symbol, or a new symbol created from the description.'],
};

function parameter(name, item) {
    if (name === 'value') {
        return `*   \`value\` **any** The value to ${item.name.startsWith('to') ? 'convert' : 'check'}.`;
    }
    if (name === 'condition') {
        return '*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.';
    }
    const scope = name === 'keyType' ? 'Map keys' : name === 'valueType' ? 'Map values' : 'the value or collection items';
    return `*   \`${name}\` **[Type specification](#type-specifications)** The matcher for ${scope}. An omitted matcher means \`undefined\`.`;
}

function examples(item) {
    if (Object.hasOwn(readableExamples, item.name)) {
        return '```javascript\n' + formatExamples(readableExamples[item.name]) + '\n```';
    }
    const width = Math.max(...item.examples.map(example => example.expression.length + 1));
    const render = examples => '```javascript\n' + formatExamples(examples.map(example =>
        example.expression + '; // => ' + JSON.stringify(example.expected)
    ).join('\n'), width) + '\n```';
    if (item.name.startsWith('is')) {
        return [true, false].map(result => item.examples.filter(example => example.expected === result))
            .filter(group => group.length).map(render).join('\n\n');
    }
    return render(item.examples);
}

function returns(item) {
    if (item.name === 'createTypeChecker') return 'Returns **Function** A reusable synchronous `(value) => boolean` checker.';
    if (item.group === 'Conditional conversion') {
        const conversion = item.name.slice(0, -2);
        return `Returns **any** The result of [${conversion}](#${conversion.toLowerCase()}) when the condition is true; otherwise the original value, unchanged.`;
    }
    if (conversionReturns[item.name]) {
        const [type, description] = conversionReturns[item.name];
        return `Returns **${type}** ${description}`;
    }
    return 'Returns **boolean** `true` when the value satisfies the check; otherwise `false`.';
}

module.exports = function generateReadme({write = true} = {}) {
    const allNames = categories.flatMap(([, members]) => members);
    if (allNames.length !== names.length || new Set(allNames).size !== allNames.length ||
        allNames.some(name => !names.includes(name))) {
        throw new Error('README categories must contain every public export exactly once.');
    }
    const byName = new Map(api.map(item => [item.name, item]));
    if (allNames.some(name => !byName.has(name))) throw new Error('Missing API metadata for README.');
    const toc = ['#### Table of Contents', ''];
    const documentation = [];
    let sectionNumber = 0;
    for (const [category, members] of categories) {
        // The original Usage section already has a Node heading. GitHub gives
        // this second Node heading a suffix; link to the API section, not Usage.
        const categoryAnchor = category === 'Node' ? 'node-1' : category.toLowerCase().replace(/ /g, '-');
        toc.push(`*   [${category}](#${categoryAnchor})`);
        documentation.push('### ' + category, '');
        if (category === 'Node') documentation.push('Run the positive examples in a web browser. Without the corresponding DOM constructors, these checks return `false`.', '');
        if (category === 'Conversion') documentation.push('These functions explicitly convert values. Native coercion rules, exceptions, and observable side effects are part of their documented contracts.', '');
        if (category === 'Conditional conversion') documentation.push('Each `If` function accepts a boolean or synchronous boolean-returning predicate. A false, omitted, or `undefined` condition returns the input unchanged without converting or inspecting it.', '');
        for (const name of members) {
            const item = byName.get(name);
            const suffix = sectionNumber ? '-' + sectionNumber : '';
            toc.push(`    *   [${name}](#${name.toLowerCase()})`,
                `        *   [Parameters](#parameters${suffix})`,
                `        *   [Examples](#examples${suffix})`);
            sectionNumber++;
            documentation.push('#### ' + name, '', item.summary, '', '##### Parameters', '',
                ...item.params.split(', ').map(param => parameter(param, item)), '', '##### Examples', '');
            if (name === 'isSharedArrayBuffer') documentation.push('The positive example requires a runtime that exposes `SharedArrayBuffer`.', '');
            documentation.push(examples(item), '', returns(item), '');
            if (item.notes) {
                documentation.push('**Notes**', '', item.notes.replace('See docs/API.md for the matcher contract.', 'See [Type specifications](#type-specifications) for the matcher contract.').replace(/NonNullable<T>/g, '`NonNullable<T>`').trim(), '');
            }
        }
    }
    toc.push('*   [Type specifications](#type-specifications)', '');
    const replacements = {
        VERSION: pkg.version,
        COUNT: String(names.length),
        DOCS_COVERAGE: String(100 * allNames.length / names.length),
        DOCUMENTATION: toc.concat(documentation).join('\n').trimEnd(),
    };
    const template = fs.readFileSync(path.join(__dirname, 'README.template.md'), 'utf8');
    const output = template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
        if (!(key in replacements)) throw new Error('Unknown README placeholder: ' + key);
        return replacements[key];
    });
    if (write) fs.writeFileSync(path.join(root, 'README.md'), output);
    return output;
};

if (require.main === module) module.exports();
