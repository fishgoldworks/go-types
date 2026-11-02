'use strict';

// Shared public-API prose for the reference, source comments and declaration tooltips.
const api = require('./api.json');
const formatExamples = require('./format-examples');
const conversionTypes = {
  ensureArray: 'EnsuredArray<T>',
  ensureSet: 'EnsuredSet<T>',
  parseJson: 'unknown',
  box: 'Boxed<T>',
  unbox: 'Unboxed<T>',
  toRegExp: 'RegExp',
  toPromise: 'Promise<Awaited<T>>',
  toArray: 'ArrayElement<T>[]',
  toBigInt: 'bigint',
  toBoolean: 'boolean',
  toDate: 'Date',
  toInteger: 'number',
  toJson: 'string | undefined',
  toMap: 'ConvertedMap<T>',
  toNumber: 'number',
  toPlainObject: 'ConvertedPlainObject<T>',
  toSet: 'ConvertedSet<T>',
  toString: 'string',
  toSymbol: 'symbol'
};

function signature(item) {
  const optionalValue =
    ['ensureArray', 'ensureSet'].includes(item.name) ||
    (item.group === 'Conversion' && !['toArray', 'toPlainObject', 'parseJson'].includes(item.name));
  return (
    item.name +
    '(' +
    item.params
      .split(', ')
      .map(
        (name) =>
          name + ((name !== 'value' && !name.endsWith('Matcher') && name !== 'matcher') || optionalValue ? '?' : '')
      )
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
  if (item.name.endsWith('If')) return 'T | ' + returnType({ name: item.name.slice(0, -2) });
  return conversionTypes[item.name] || 'boolean';
}
function parameters(item) {
  return item.params.split(', ').map((name) => {
    const optional = signature(item).includes(name + '?');
    let type, description;
    if (name === 'value') {
      type =
        item.name.endsWith('If') ||
        [
          'ensureArray',
          'ensureSet',
          'box',
          'unbox',
          'toPromise',
          'toArray',
          'toMap',
          'toPlainObject',
          'toSet',
          'isNotNullish'
        ].includes(item.name)
          ? 'T'
          : 'unknown';
      description =
        'The value to ' +
        (['ensureArray', 'ensureSet'].includes(item.name)
          ? 'normalise'
          : item.group.toLowerCase().includes('conversion')
            ? 'convert'
            : 'check') +
        '.';
    } else if (name === 'condition') {
      type = 'boolean | ((this: undefined, value: T) => boolean)';
      description =
        'A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean.';
    } else if (name === 'flags') {
      type = 'string';
      description =
        'Native RegExp flags. Omitted or `undefined` preserves a RegExp input’s flags; explicit flags replace them.';
    } else if (name === 'reviver') {
      type = '((this: unknown, key: string, value: unknown, context?: { source?: string }) => unknown) | null';
      description =
        'A native JSON reviver, called for children before parents and finally for the root. Returning `undefined` deletes a property or replaces the root with `undefined`. Newer hosts may supply optional source context.';
    } else if (name === 'replacer') {
      type = '((this: unknown, key: string, value: unknown) => unknown) | readonly (string | number)[] | null';
      description =
        'A native JSON replacer callback or property-name list. Callbacks receive the containing object as `this`; omitted or `null` uses ordinary serialisation.';
    } else if (name === 'space') {
      type = 'string | number';
      description = 'Native JSON indentation, capped at ten spaces or ten string code units.';
    } else {
      type = 'TypeMatcher';
      const scope = name === 'keyMatcher' ? 'Map keys' : name === 'valueMatcher' ? 'Map values' : 'collection items';
      description = 'A required native `typeof` name or synchronous boolean predicate for ' + scope + '.';
    }
    if (['ensureArray', 'ensureSet'].includes(item.name) && name === 'value')
      description +=
        item.name === 'ensureSet'
          ? ' Omit to create an empty Set; explicit undefined or null remains one member.'
          : ' Omit to create an empty array; explicit undefined or null remains one item.';
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
  const type = item.returns || 'boolean';
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
