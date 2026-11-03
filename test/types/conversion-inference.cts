import T = require('go-types');

type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}

const input: Iterable<string> & ArrayLike<number> = {
  0: 1,
  length: 1,
  *[Symbol.iterator]() {
    yield 'text';
  }
};
expectType<string[]>(T.toArray(input));
// @ts-expect-error iterator element type takes precedence over numeric indices.
expectType<number[]>(T.toArray(input));
expectType<Set<string>>(T.toSet(input));
expectType<Set<unknown>>(T.toSet(null));
expectType<Map<string, number>>(T.toMap({ key: 1 }));
const symbolKey = Symbol('record key');
const record = { a: 1, b: 'two', 3: true, [symbolKey]: new Date() } as const;
expectType<Map<string | typeof symbolKey, 1 | 'two' | true | Date>>(T.toMap(record));
// @ts-expect-error object property keys, including numeric names, become strings.
expectType<Map<3, unknown>>(T.toMap(record));
// @ts-expect-error object values also include the string and numeric properties.
expectType<Map<string, Date>>(T.toMap(record));
const inferredRecordMap = T.toMap(record);
expectFalse<IsAny<typeof inferredRecordMap>>();
interface RecordInput {
  readonly a: number;
  readonly b?: string;
}
declare const recordInput: RecordInput;
expectType<Map<string, number | string | undefined>>(T.toMap(recordInput));
expectType<Map<string, unknown>>(T.toMap({}));
const iterableRecord = {
  a: 1,
  *[Symbol.iterator]() {
    yield [7, 'entry'] as const;
  }
};
expectType<Map<7, 'entry'>>(T.toMap(iterableRecord));
interface OptionalRecordIterator {
  a: number;
  [Symbol.iterator]?: () => IterableIterator<readonly [number, string]>;
}
declare const optionalRecordIterator: OptionalRecordIterator;
expectType<Map<unknown, unknown>>(T.toMap(optionalRecordIterator));
// @ts-expect-error an optional iterator may replace object entries at runtime.
expectType<Map<string, number>>(T.toMap(optionalRecordIterator));
expectType<Map<string | typeof Symbol.iterator, number | null>>(T.toMap({ a: 1, [Symbol.iterator]: null }));
expectType<Map<string | typeof Symbol.iterator, number | undefined>>(T.toMap({ a: 1, [Symbol.iterator]: undefined }));

// A broad symbol index signature also includes a possible Symbol.iterator.
declare const symbolicRecord: { a: number; [key: symbol]: unknown };
expectType<Map<unknown, unknown>>(T.toMap(symbolicRecord));
// @ts-expect-error a broad symbol index can hide a custom iterator.
expectType<Map<string, number>>(T.toMap(symbolicRecord));
