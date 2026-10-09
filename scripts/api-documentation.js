'use strict';

// Shared public-API prose for the reference, source comments and declaration tooltips.
const api = require('./api.json');
const formatExamples = require('./format-examples');
const conversionTypes = {
  toArray: 'ArrayElement<T>[]',
  toBigInt: 'bigint',
  toBoolean: 'boolean',
  toDate: 'Date',
  toInteger: 'number',
  toMap: 'ConvertedMap<T>',
  toNumber: 'number',
  toObject: 'ConvertedObject<T>',
  toSet: 'ConvertedSet<T>',
  toString: 'string',
  toSymbol: 'symbol'
};

function signature(item) {
  const optionalValue = item.name.startsWith('to') && !item.name.endsWith('If') && item.name !== 'toArray';
  return (
    item.name +
    '(' +
    item.params
      .split(', ')
      .map((name) => name + (name !== 'value' || optionalValue ? '?' : ''))
      .join(', ') +
    ')'
  );
}
function anchor(item) {
  return signature(item)
    .toLowerCase()
    .replace(/[^\w -]/g, '')
    .replace(/ /g, '-');
}
function returnType(item) {
  if (item.name === 'createTypeChecker') return '(value: unknown) => boolean';
  if (item.name.endsWith('If')) return 'T | ' + returnType({ name: item.name.slice(0, -2) });
  return conversionTypes[item.name] || 'boolean';
}
function parameters(item) {
  return item.params.split(', ').map((name) => {
    const optional = name !== 'value' || signature(item).includes('value?');
    let type, description;
    if (name === 'value') {
      type =
        item.name.endsWith('If') || ['toArray', 'toMap', 'toObject', 'toSet', 'isNonNullish'].includes(item.name)
          ? 'T'
          : 'unknown';
      description = 'The value to ' + (item.name.startsWith('to') ? 'convert' : 'check') + '.';
    } else if (name === 'condition') {
      type = 'boolean | ((this: undefined, value: T) => boolean)';
      description =
        'A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.';
    } else {
      type = 'TypeMatcher';
      const scope =
        name === 'keyType'
          ? 'Map keys'
          : name === 'valueType'
            ? 'Map values'
            : item.name === 'createTypeChecker'
              ? 'values passed to the returned checker'
              : 'the value or collection items';
      description = 'The matcher for ' + scope + '. An omitted matcher matches `undefined`.';
    }
    return { name, type, description, optional };
  });
}
function wrap(text, width = 96) {
  // Keep inline code and Markdown links intact so tooltips retain their formatting.
  const words = text.match(/(?:`[^`]*`|\[[^\]]+\]\([^)]*\)|\S)+/g) || [];
  const lines = [];
  for (const word of words) {
    if (!lines.length || lines.at(-1).length + word.length + 1 > width) lines.push(word);
    else lines[lines.length - 1] += ' ' + word;
  }
  return lines;
}
function conversionDetails(item) {
  if (!item.name.endsWith('If')) return '';
  const base = api.find((candidate) => candidate.name === item.name.slice(0, -2));
  if (!base) throw Error('Missing base conversion documentation: ' + item.name);
  return 'Requested conversion uses `' + base.name + '`. ' + base.tooltip;
}
function comment(item, { source = false, indent = '' } = {}) {
  const lines = [...wrap(item.summary)];
  if (item.tooltip) lines.push('', ...wrap(item.tooltip));
  const conversion = conversionDetails(item);
  if (conversion) lines.push('', ...wrap(conversion));
  lines.push('');
  for (const parameter of parameters(item)) {
    // Source inputs accept arbitrary JavaScript values. The declarations own narrowing and overload types.
    const name = source && parameter.optional ? '[' + parameter.name + ']' : parameter.name;
    lines.push(...wrap('@param ' + (source ? '{*} ' : '') + name + ' ' + parameter.description));
  }
  const type = item.returns || (item.name === 'createTypeChecker' ? 'function(*): boolean' : 'boolean');
  lines.push(...wrap('@returns ' + (source ? '{' + type + '} ' : '') + item.summaryReturn));
  if (item.errors)
    lines.push(...wrap('@throws ' + (source ? '{*} ' : '') + item.errors.replace(/\[([^\]]+)\]\(#[^)]*\)/g, '$1')));
  lines.push('@see https://github.com/koyote130708/go-types/blob/master/docs/API.md#' + anchor(item));
  if (source) {
    const examples = formatExamples(
      item.examples.map((example) => example.expression + '; // => ' + JSON.stringify(example.expected)).join('\n')
    );
    lines.push(...examples.split('\n').map((line) => '@example ' + line));
  }
  return (
    indent + '/**\n' + lines.map((line) => indent + ' *' + (line ? ' ' + line : '')).join('\n') + '\n' + indent + ' */'
  );
}
function declarations(source) {
  const byName = new Map(api.map((item) => [item.name, item]));
  const seen = new Set();
  // Replace only comments attached to public function declarations; keep helper-type documentation intact.
  const output = source.replace(
    /(?:^[ \t]*\/\*\*(?:(?!\*\/)[\s\S])*?\*\/[ \t]*\r?\n)?^([ \t]*)function ([A-Za-z]+)(?=[<(])/gm,
    (match, indent, name) => {
      const item = byName.get(name);
      if (!item) throw Error('Undocumented declaration: ' + name);
      seen.add(name);
      return comment(item, { indent }) + '\n' + indent + 'function ' + name;
    }
  );
  if (seen.size !== api.length) throw Error('Missing public declarations for documentation');
  return output;
}
module.exports = { signature, anchor, returnType, parameters, conversionDetails, comment, declarations };
