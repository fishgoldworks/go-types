import T = require('go-types');
import toArray = require('go-types/toArray');
import toSet = require('go-types/conversion/toSet');
import toMap = require('go-types/src/conversion/toMap.js');

type Equal<A, B> = (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2 ? true : false;
type Expect<V extends true> = V;
function expectType<V>(_value: V): void {}

const token = Symbol('record key');
const record = { a: 1, 42: 'answer', [token]: true } as const;
expectType<(1 | 'answer' | true)[]>(toArray(record));
expectType<Set<1 | 'answer' | true>>(toSet(record));
expectType<Map<string | typeof token, 1 | 'answer' | true>>(toMap(record));
// @ts-expect-error symbol record keys are preserved.
expectType<Map<string, unknown>>(toMap(record));
// @ts-expect-error symbol values are included in the resulting array.
expectType<(1 | 'answer')[]>(toArray(record));
// @ts-expect-error symbol values are included in the resulting set.
expectType<Set<1 | 'answer'>>(toSet(record));

type RecordElements = Expect<Equal<T.ArrayElement<typeof record>, 1 | 'answer' | true>>;
type RecordSet = Expect<Equal<T.ConvertedSet<typeof record>, Set<1 | 'answer' | true>>>;
const withLength = { 0: 'first', length: 2, label: false } as const;
expectType<('first' | 2 | false | undefined)[]>(toArray(withLength));
expectType<Set<'first' | 2 | false | undefined>>(toSet(withLength));
// @ts-expect-error length and named values cannot be discarded from a possible plain record.
expectType<string[]>(toArray(withLength));
// @ts-expect-error record conversion is not limited to indexed values.
expectType<Set<string>>(toSet(withLength));
type ArrayLikeElements = Expect<Equal<T.ArrayElement<ArrayLike<string>>, string | number | undefined>>;
type ArrayLikeSet = Expect<Equal<T.ConvertedSet<ArrayLike<string>>, Set<string | number | undefined>>>;
const ordinaryLength = { length: 'ordinary data', enabled: true } as const;
expectType<('ordinary data' | true)[]>(toArray(ordinaryLength));
expectType<Set<'ordinary data' | true>>(toSet(ordinaryLength));

declare const optional: { a: number; [Symbol.iterator]?: () => IterableIterator<string> };
expectType<unknown[]>(toArray(optional));
expectType<Set<unknown>>(toSet(optional));
// @ts-expect-error optional iterators can replace the record values.
expectType<Set<number>>(toSet(optional));
const absentIterator = { a: 1, [Symbol.iterator]: null } as const;
expectType<(1 | null)[]>(toArray(absentIterator));
expectType<Set<1 | null>>(toSet(absentIterator));
expectType<Map<string | typeof Symbol.iterator, 1 | null>>(toMap(absentIterator));

const objectKey = { id: 1 };
const mapPairs = [
  [objectKey, 'object'],
  [token, 'symbol'],
  [undefined, 'undefined']
] as const;
expectType<Map<typeof objectKey | typeof token | undefined, 'object' | 'symbol' | 'undefined'>>(toMap(mapPairs));
expectType<Map<string, number>>(toMap([['key', 1]]));
declare const dynamicPairs: unknown[][];
expectType<Map<unknown, unknown>>(toMap(dynamicPairs));
// @ts-expect-error three-element tuples are invalid map entries.
toMap([['key', 1, 2]] as const);
// @ts-expect-error one-element tuples are invalid map entries.
toMap([['key']] as const);
// @ts-expect-error pair-shaped records are not actual arrays.
toMap([{ 0: 'key', 1: 1, length: 2 }] as const);
// TypeScript cannot distinguish a sparse tuple from an explicit undefined slot; runtime validates ownership.
expectType<Map<'key', undefined>>(toMap([['key', undefined]] as const));
// @ts-expect-error an invalid tuple cannot hide in a union of entries.
toMap([
  ['key', 1],
  ['bad', 2, 3]
] as const);
// @ts-expect-error numbers cannot supply map entries.
toMap([1, 2]);
// @ts-expect-error scalar numbers cannot supply a map source.
toMap(1);
// @ts-expect-error array conversion requires a supported source.
toArray(null);
// @ts-expect-error array conversion requires an argument.
toArray();
// @ts-expect-error undefined is not an array source.
toArray(undefined);
// @ts-expect-error numeric scalars are rejected rather than silently becoming empty arrays.
toArray(1);
// @ts-expect-error booleans are not array sources.
toArray(true);
// @ts-expect-error bigint scalars are not array sources.
toArray(1n);
// @ts-expect-error symbols are not array sources.
toArray(token);
// @ts-expect-error functions are not array-like sources.
toArray(() => 1);
// @ts-expect-error boxed strings are not accepted as collection sources.
toArray(new String('abc'));
// @ts-expect-error boxed numbers are not accepted as collection sources.
toSet(new Number(1));
// @ts-expect-error Dates are not collection sources.
toSet(new Date());
// @ts-expect-error RegExps are not collection sources.
toMap(/test/);
// @ts-expect-error booleans are not set sources.
toSet(false);
expectType<Set<unknown>>(toSet(null));
expectType<Set<unknown>>(toSet());
expectType<Map<unknown, unknown>>(toMap(undefined));
expectType<Map<unknown, unknown>>(toMap());

declare const unknownInput: unknown;
expectType<unknown[]>(toArray(unknownInput));
expectType<Set<unknown>>(toSet(unknownInput));
expectType<Map<unknown, unknown>>(toMap(unknownInput));
expectType<null>(T.toArrayIf(null, false));
expectType<1>(T.toSetIf(1 as const));
expectType<1>(T.toMapIf(1 as const, undefined));
// @ts-expect-error definite conversion must validate the array input.
T.toArrayIf(null, true);
// @ts-expect-error definite conversion must validate the set input.
T.toSetIf(1, true);
// @ts-expect-error definite conversion must validate tuple entries.
T.toMapIf([['key', 1, 2]] as const, true);
expectType<typeof record | (1 | 'answer' | true)[]>(T.toArrayIf(record, Math.random() > 0.5));
expectType<typeof record | Set<1 | 'answer' | true>>(T.toSetIf(record, (value) => value.a === 1));
expectType<typeof record | Map<string | typeof token, 1 | 'answer' | true>>(T.toMapIf(record, (value) => value[token]));
expectType<1 | unknown[]>(T.toArrayIf(1 as const, () => false));
expectType<1 | Set<unknown>>(T.toSetIf(1 as const, () => false));
expectType<1 | Map<unknown, unknown>>(T.toMapIf(1 as const, () => false));

const iterableDate = Object.assign(new Date(), {
  *[Symbol.iterator]() {
    yield ['date', 1] as const;
  }
});
// @ts-expect-error Dates remain unsupported even when they advertise iterable entries.
toMap(iterableDate);
// @ts-expect-error definite conditional conversion keeps the same forbidden-source rule.
T.toMapIf(iterableDate, true);
// @ts-expect-error iterable augmentation does not turn a Date into an array source.
toArray(iterableDate);
// @ts-expect-error iterable augmentation does not turn a Date into a set source.
toSet(iterableDate);
const iterableFunction = Object.assign(() => 1, {
  *[Symbol.iterator]() {
    yield ['function', 1] as const;
  }
});
// @ts-expect-error functions remain unsupported even when they advertise iterable entries.
toMap(iterableFunction);
const iterablePromise = Object.assign(Promise.resolve(1), {
  *[Symbol.iterator]() {
    yield 7;
  }
});
expectType<number[]>(toArray(iterablePromise));
expectType<Set<number>>(toSet(iterablePromise));
const plainThenable = { then: () => 1, catch: () => 2 };
expectType<(() => number)[]>(toArray(plainThenable));
expectType<Set<() => number>>(toSet(plainThenable));

// A length union can still enter the non-plain array-like branch and produce holes.
type MixedLengthElements = Expect<
  Equal<T.ArrayElement<{ 0: 'first'; length: 2 | 'ordinary' }>, 'first' | 2 | 'ordinary' | undefined>
>;
