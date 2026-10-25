import T = require('go-types');
import toArrayIf = require('go-types/toArrayIf');
import toMapIf = require('go-types/conversion/toMapIf');
import toSetIf = require('go-types/src/conversion/toSetIf.js');

type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}

const values: readonly number[] = [1, 2];
const entries = [['key', 1]] as const;
const policy = { enabled: true };
function needsReceiver(this: typeof policy, _value: unknown): boolean {
  return this.enabled;
}

// A callback requiring an object receiver cannot be called with undefined.
// @ts-expect-error condition callbacks do not receive the API namespace as this.
T.toArrayIf(values, needsReceiver);
// @ts-expect-error the same rule applies through focused imports.
toArrayIf(values, needsReceiver);
// @ts-expect-error map conversion does not bind a receiver.
toMapIf(entries, needsReceiver);
// @ts-expect-error set conversion does not bind a receiver.
toSetIf(values, needsReceiver);
// @ts-expect-error the shared condition type must reject receiver requirements.
const invalid: T.ConversionCondition<readonly number[]> = needsReceiver;

// Scalar neighbours share the same condition contract, even though their own
// Runtime conversion semantics are exercised by the conversion contract suites.
// @ts-expect-error scalar conditions are also called without a receiver.
T.toNumberIf('12', needsReceiver);

const array = toArrayIf(values, function (value) {
  expectFalse<IsAny<typeof value>>();
  expectType<readonly number[]>(value);
  expectType<undefined>(this);
  // @ts-expect-error contextual input retains its readonly array type, not any.
  value.push(3);
  // @ts-expect-error this is not an inferred policy or API namespace.
  void this.enabled;
  return value.length > 0;
});
expectType<readonly number[] | number[]>(array);

const map = toMapIf(entries, (value) => {
  expectFalse<IsAny<typeof value>>();
  expectType<'key'>(value[0][0]);
  expectType<1>(value[0][1]);
  // @ts-expect-error entry values do not acquire string operations.
  value[0][1].toUpperCase();
  return value.length > 0;
});
expectType<typeof entries | Map<'key', 1>>(map);
// @ts-expect-error a condition may be false, preserving the input entries.
expectType<Map<'key', 1>>(map);

const set = toSetIf(values, (value) => {
  expectFalse<IsAny<typeof value>>();
  expectType<readonly number[]>(value);
  return value.length > 0;
});
expectType<readonly number[] | Set<number>>(set);
// @ts-expect-error a condition may be false, preserving the original array.
expectType<Set<number>>(set);

// Binding, receiver-independent arrows, and explicit undefined/void receivers
// remain valid. No widening of the input or returned element types is required.
const bound = needsReceiver.bind(policy);
expectType<T.ConversionCondition<readonly number[]>>(bound);
expectType<typeof entries | Map<'key', 1>>(toMapIf(entries, bound));
expectType<number[]>(toArrayIf(values, true));
expectType<readonly number[]>(toArrayIf(values, false));
expectType<readonly number[]>(toArrayIf(values));
expectType<Set<number>>(toSetIf(values, true));
expectType<readonly number[]>(toSetIf(values, undefined));
expectType<typeof entries | Map<'key', 1>>(toMapIf(entries, Math.random() > 0.5));
const explicitUndefined: T.ConversionCondition<readonly number[]> = function (this: undefined, value) {
  return this === undefined && value.length > 0;
};
const explicitVoid: T.ConversionCondition<readonly number[]> = function (this: void, value) {
  return value.length > 0;
};
toArrayIf(values, explicitUndefined);
toSetIf(values, explicitVoid);
// @ts-expect-error a Promise is not a primitive boolean.
toMapIf(entries, async () => true);
// @ts-expect-error no truthiness coercion for condition results.
toSetIf(values, () => 1);

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
expectType<Map<string | typeof symbolKey, 1 | 'two' | true | Date>>(toMapIf(record, true));
expectType<typeof record>(toMapIf(record, false));
expectType<typeof record>(toMapIf(record));
expectType<typeof record | Map<string | typeof symbolKey, 1 | 'two' | true | Date>>(
  toMapIf(record, (value) => {
    expectFalse<IsAny<typeof value>>();
    expectType<1>(value.a);
    return true;
  })
);
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
