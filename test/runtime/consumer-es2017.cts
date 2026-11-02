import Types = require('go-types');
import DefaultTypes, { isArray } from 'go-types';

const result: boolean = Types.isArray([]);
if (!result || DefaultTypes !== Types || isArray !== Types.isArray) throw new Error('ES2017 root imports differ');
const number: number = Types.toNumber('42');
if (number !== 42) throw new Error('ES2017 root conversion failed');
const plainObject: Partial<{ a: number }> = Types.toPlainObject({ a: 42 });
if (plainObject.a !== 42 || Object.getPrototypeOf(plainObject) !== Object.prototype)
  throw new Error('ES2017 plain object conversion failed');
const record = { a: 1 };
const copied: Partial<typeof record> = Types.toPlainObject(record);
// @ts-expect-error Copied properties may be omitted because they are non-enumerable.
const required: number = copied.a;
if (copied === record || copied.a !== 1) throw new Error('ES2017 object copy failed');

const entries = [['key', 1]] as const;
const convertedMap: Map<'key', 1> = Types.toMap(entries);
const convertedSet: Set<number> = Types.toSet([1, 1, 2]);
const skippedEntries: typeof entries = Types.toMapIf(entries, false);
const skippedText: 'aba' = Types.toSetIf('aba' as const, false);
if (
  convertedMap.get('key') !== 1 ||
  convertedSet.size !== 2 ||
  skippedEntries !== entries ||
  skippedText !== 'aba' ||
  Types.toMapIf(entries, true).get('key') !== 1 ||
  Types.toSetIf('aba', true).size !== 2 ||
  Types.toMap().size !== 0 ||
  Types.toSet(null).size !== 0
) {
  throw new Error('ES2017 collection conversion failed');
}

const scalarText: string & { readonly length: number } = '{"a":1}';
let rejectedText = false;
try {
  // @ts-expect-error Strings remain unsupported even with a structural object intersection.
  Types.toPlainObject(scalarText);
} catch (error) {
  rejectedText = error instanceof TypeError;
}
const unchangedText: typeof scalarText = Types.toPlainObjectIf(scalarText, false);
const skippedPredicateText: typeof scalarText = Types.toPlainObjectIf(scalarText, () => false);
if (!rejectedText || unchangedText !== scalarText || skippedPredicateText !== scalarText) {
  throw new Error('ES2017 string rejection or skipped conversion failed');
}

// Visible optional iteration prevents the declaration from promising indexed numbers.
interface OptionalArrayIterator extends ArrayLike<number> {
  [Symbol.iterator]?: () => IterableIterator<string>;
}
const optionalArrayInput: OptionalArrayIterator = {
  0: 1,
  length: 1,
  *[Symbol.iterator]() {
    yield 'text';
  }
};
const optionalArrayResult: unknown[] = Types.toArray(optionalArrayInput);
// @ts-expect-error a present optional iterator overrides the indexed number type.
const optionalArrayNumbers: number[] = Types.toArray(optionalArrayInput);
if (optionalArrayResult[0] !== 'text' || Types.toArrayIf(optionalArrayInput, false) !== optionalArrayInput) {
  throw new Error('ES2017 optional iteration declaration/behaviour failed');
}

const recordMapInput = { a: 1, b: 2 } as const;
const recordMap: Map<string, 1 | 2> = Types.toMap(recordMapInput);
const numericRecordMap: Map<string, string> = Types.toMap({ 42: 'answer' });
if (
  recordMap.get('a') !== 1 ||
  recordMap.get('b') !== 2 ||
  numericRecordMap.get('42') !== 'answer' ||
  Types.toMapIf(recordMapInput, true).get('a') !== 1 ||
  Types.toMapIf(recordMapInput, false) !== recordMapInput
) {
  throw new Error('ES2017 record Map conversion failed');
}

// Record sources preserve symbol keys and values, and treat length as ordinary data.
const collectionSymbol = Symbol('collection');
const collectionRecord = { 42: 'answer', length: 2, [collectionSymbol]: true } as const;
const recordValues: ('answer' | 2 | true | undefined)[] = Types.toArray(collectionRecord);
const recordValuesSet: Set<'answer' | 2 | true | undefined> = Types.toSet(collectionRecord);
const recordEntries: Map<string | typeof collectionSymbol, 'answer' | 2 | true> = Types.toMap(collectionRecord);
if (
  recordValues.length !== 3 ||
  recordValues[0] !== 'answer' ||
  recordValues[1] !== 2 ||
  recordValues[2] !== true ||
  recordValuesSet.size !== 3 ||
  !recordValuesSet.has(true) ||
  recordEntries.get('42') !== 'answer' ||
  recordEntries.get('length') !== 2 ||
  recordEntries.get(collectionSymbol) !== true
) {
  throw new Error('ES2017 record collection inference/behaviour failed');
}
class ArrayLikeSlots {
  readonly 0 = 'first';
  readonly length = 2;
}
const arrayLikeSlots = new ArrayLikeSlots();
const arrayLikeValues: (string | number | undefined)[] = Types.toArray(arrayLikeSlots);
const arrayLikeSet: Set<string | number | undefined> = Types.toSet(arrayLikeSlots);
if (
  arrayLikeValues.length !== 2 ||
  arrayLikeValues[0] !== 'first' ||
  arrayLikeValues[1] !== undefined ||
  !arrayLikeSet.has(undefined)
) {
  throw new Error('ES2017 non-plain array-like inference/behaviour failed');
}
const arbitraryMapKey = { id: 1 };
const arbitraryMap: Map<typeof arbitraryMapKey, string> = Types.toMap([[arbitraryMapKey, 'value']]);
if (arbitraryMap.get(arbitraryMapKey) !== 'value') throw new Error('ES2017 arbitrary Map key inference failed');

// JSON options and conditional inference must work without DOM or newer native declarations.
const jsonInput = { a: 1, b: 2 };
const jsonText: string | undefined = Types.toJson(jsonInput, ['a'] as const, 2);
const jsonOriginal: typeof jsonInput = Types.toJsonIf(jsonInput, false);
const jsonConverted: typeof jsonInput | string | undefined = Types.toJsonIf(
  jsonInput,
  (value) => value.a === 1,
  function (_key, value) {
    return typeof value === 'number' ? value + 1 : value;
  }
);
if (jsonText !== '{\n  "a": 1\n}' || jsonOriginal !== jsonInput || jsonConverted !== '{"a":2,"b":3}') {
  throw new Error('ES2017 JSON serialization contract failed');
}

const boxedNumber: Number = Types.box(3);
const boxedNull: null = Types.box(null);
const unboxedNumber = Types.unbox(boxedNumber);
const pattern: RegExp = Types.toRegExp('a', 'i');
const nativePromise = Promise.resolve(3);
const wrappedPromise: Promise<number> = Types.toPromise(nativePromise);
const skippedPromise: 3 = Types.toPromiseIf(3 as const, false);
if (
  unboxedNumber !== 3 ||
  boxedNull !== null ||
  !pattern.test('A') ||
  wrappedPromise !== nativePromise ||
  skippedPromise !== 3
) {
  throw new Error('ES2017 wrapper, regex and Promise conversion failed');
}

const parsedJson: unknown = Types.parseJson('42');
const skippedJson: 'invalid' = Types.parseJsonIf('invalid' as const, false);
const revivedJson: unknown = Types.parseJson('{"a":1}', function (key, value, context) {
  const source: string | undefined = context && context.source;
  if (key === 'a' && source !== undefined && source !== '1') throw Error('Unexpected native source context');
  return key === '' ? 'root' : value;
});
if (parsedJson !== 42 || skippedJson !== 'invalid' || revivedJson !== 'root') {
  throw Error('ES2017 JSON parsing contract failed');
}
