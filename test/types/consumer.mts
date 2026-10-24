import Types, {
  isNumber,
  isString,
  isBoolean,
  isNonNullish,
  isNullish,
  isSymbol,
  isBigInt,
  isInteger,
  isPlainObject,
  isArray,
  isNonEmptyArray,
  isTypeOf,
  isArrayOf,
  isMapOf,
  isSetOf,
  isIteratorLike,
  isAsyncIterable,
  isTypedArray,
  type TypeMatcher,
  type TypedArray
} from 'go-types';
function expectType<T>(_value: T): void {}
const value = null as unknown;
const filtered = [0, false, '', null, undefined].filter(isNonNullish);
expectType<(number | boolean | string)[]>(filtered);
// @ts-expect-error null was removed by filtering.
const nullable: null = filtered[0];
if (isNullish(value)) expectType<null | undefined>(value);
if (isSymbol(value)) expectType<symbol>(value);
if (isBigInt(value)) expectType<bigint>(value);
if (isNumber(value)) {
  // @ts-expect-error native brand validation is not a structural TypeScript type guard.
  expectType<number | Number>(value);
  // @ts-expect-error boxed Numbers must not narrow to primitive number.
  expectType<number>(value);
}
if (isString(value)) {
  // @ts-expect-error native brand validation is not a structural TypeScript type guard.
  expectType<string | String>(value);
  // @ts-expect-error boxed Strings must not narrow to primitive string.
  expectType<string>(value);
}
// @ts-expect-error the boxed identity contract cannot promise structural narrowing.
if (isBoolean(value)) expectType<boolean | Boolean>(value);
const maybeNumber = Math.random() ? 1.5 : 'value';
if (!isInteger(maybeNumber)) {
  expectType<number | string>(maybeNumber);
  // @ts-expect-error a failed integer check can still leave a fractional number.
  expectType<string>(maybeNumber);
}
if (isPlainObject(value)) {
  // @ts-expect-error plainness is prototype classification, not a schema.
  expectType<{ name: string }>(value);
}
// @ts-expect-error structural array-like interfaces are broader than actual array identity.
if (isArray(value)) expectType<unknown[]>(value);
// @ts-expect-error shape/cardinality validation is not structural tuple identity.
if (isNonEmptyArray(value)) expectType<[unknown, ...unknown[]]>(value);
if (isTypedArray(value)) {
  // @ts-expect-error native internal slots are not represented by the structural TypedArray interface.
  expectType<TypedArray>(value);
  // @ts-expect-error boolean validation does not assert unknown has an index signature.
  expectType<number | bigint>(value[0]);
}
if (isTypeOf(value, 'number')) expectType<number>(value);
// @ts-expect-error composite/collection specifications do not imply two-sided type narrowing.
if (isTypeOf(value, ['number', null] as const)) expectType<number | null>(value);
// @ts-expect-error composite/collection specifications do not imply two-sided type narrowing.
if (isTypeOf(value, { predicate: (x: unknown): x is string => typeof x === 'string' })) expectType<string>(value);
const partial = Math.random() ? 1 : 'x';
if (!isTypeOf(partial, { predicate: (x: unknown): boolean => x === 1 })) {
  expectType<string | number>(partial);
  // @ts-expect-error a boolean predicate is not a type predicate.
  expectType<string>(partial);
}
const onlyStrings = (value: unknown): value is string => isTypeOf(value, 'string');
expectType<string[]>([1, 'a', null].filter(onlyStrings));
const union = (value: unknown): boolean => isTypeOf(value, ['number', null] as const);
// @ts-expect-error composite/collection specifications do not imply two-sided type narrowing.
expectType<(number | null)[]>([1, 'a', null].filter(union));
const callbacks = (value: unknown): boolean => isTypeOf(value, { predicate: (x: unknown): boolean => x === 1 });
if (!callbacks(partial)) {
  // @ts-expect-error no negative-branch narrowing for general validation predicates.
  expectType<string>(partial);
}
// @ts-expect-error composite/collection specifications do not imply two-sided type narrowing.
if (isArrayOf(value, 'number')) expectType<number[]>(value);
// @ts-expect-error composite/collection specifications do not imply two-sided type narrowing.
if (isSetOf(value, 'number')) expectType<Set<number>>(value);
// @ts-expect-error composite/collection specifications do not imply two-sided type narrowing.
if (isMapOf(value, 'string', 'number')) expectType<Map<string, number>>(value);
const config: TypeMatcher = ['number', { predicate: Types.isNumber }, Date];
Types.isTypeOf(1, config);
// @ts-expect-error misspelled typeof name.
isTypeOf(value, 'nubmer');
// @ts-expect-error type specifications are not arbitrary numbers.
isTypeOf(value, 42);
// @ts-expect-error ambiguous descriptors have no valid mode.
isTypeOf(1, { predicate: () => true, instanceOf: Object });
// @ts-expect-error async validators are not accepted.
isTypeOf(1, { predicate: async () => true });
if (isIteratorLike(value)) {
  // @ts-expect-error next presence does not prove the full iterator contract.
  expectType<Iterator<unknown>>(value);
}
if (isAsyncIterable(value)) {
  // @ts-expect-error method presence does not prove returned iterators are valid.
  expectType<AsyncIterable<unknown>>(value);
}
const another = Math.random() ? () => {} : {};
if (!isTypeOf(another, 'object')) {
  // @ts-expect-error typeof-object must not erase function alternatives as TS object.
  expectType<never>(another);
}

import arrayCheck from 'go-types/isArray';
import numericCheck from 'go-types/src/isNumeric.js';
expectType<boolean>(arrayCheck([]));
expectType<boolean>(numericCheck('1'));
// @ts-expect-error private helpers are not supported entry points.
import privateCheck from 'go-types/src/util/hasNativeBrand';
import legacyObjectConversion from 'go-types/src/conversion/toPlainObject';
expectType<object>(legacyObjectConversion('{}'));

// Conversion return types retain element types, original identities and conditional branches.
import {
  toArray,
  toArrayIf,
  toBigInt,
  toBoolean,
  toDate,
  toInteger,
  toNumber,
  toPlainObject,
  toString as convertToString,
  toSymbol,
  toNumberIf,
  toDateIf,
  toPlainObjectIf,
  type ConversionCondition
} from 'go-types';
expectType<number[]>(toArray(new Set([1, 2])));
expectType<string[]>(toArray('abc'));
expectType<[string, number][]>(toArray(new Map([['score', 1]])));
expectType<unknown[]>(toArray(value));
expectType<bigint>(toBigInt('42'));
expectType<boolean>(toBoolean('false'));
expectType<Date>(toDate('2024-01-01T00:00:00.000Z'));
expectType<number>(toInteger('1.9'));
expectType<number>(toNumber('1.9'));
expectType<string>(convertToString(Symbol('x')));
expectType<symbol>(toSymbol('x'));
const originalObject = { score: 1 };
expectType<Partial<typeof originalObject>>(toPlainObject(originalObject));
expectType<Record<string | symbol, unknown>>(toPlainObject('{}'));
expectType<number>(toNumberIf('1', true));
expectType<'1'>(toNumberIf('1' as const, false));
expectType<'1'>(toNumberIf('1' as const));
expectType<number | string>(toNumberIf('1', Math.random() > 0.5));
const textCondition: ConversionCondition<string> = (text) => text.length > 0;
expectType<string | number>(toNumberIf('1', textCondition));
// @ts-expect-error a predicate may skip conversion; the original string remains possible.
expectType<number>(toNumberIf('1', textCondition));
// @ts-expect-error conditions are booleans or boolean-returning predicates.
toNumberIf('1', 'true');
// @ts-expect-error async conversion predicates are not supported.
toNumberIf('1', async () => true);
// @ts-expect-error truthy return values are not boolean predicates.
toNumberIf('1', () => 1);
expectType<number[]>(toArrayIf(new Set([1]), true));
expectType<Set<number>>(toArrayIf(new Set([1]), false));
expectType<Date>(toDateIf(0, true));
expectType<0>(toDateIf(0 as const, false));
expectType<Partial<typeof originalObject>>(toPlainObjectIf(originalObject, true));
expectType<1>(toPlainObjectIf(1 as const, false));
import numberConversion from 'go-types/toNumber';
import nestedNumberConversion from 'go-types/conversion/toNumber';
import sourceConversion from 'go-types/src/conversion/toNumber.js';
expectType<number>(numberConversion('2'));
expectType<number>(nestedNumberConversion('2'));
expectType<number>(sourceConversion('2'));

// Collection conversions infer iterable values and readonly entry tuples.
import { toMap, toMapIf, toSet, toSetIf, type ConvertedMap, type ConvertedSet } from 'go-types';
import focusedMap from 'go-types/toMap';
import legacySet from 'go-types/src/conversion/toSet.js';
const entries = [['key', 1]] as const;
expectType<Map<'key', 1>>(toMap(entries));
expectType<Map<string, number>>(toMap(new Map<string, number>([['key', 1]])));
expectType<Map<string, number>>(toMap(new Map<string, number>() as ReadonlyMap<string, number>));
expectType<Map<unknown, unknown>>(toMap(value));
expectType<Map<unknown, unknown>>(toMap());
expectType<Map<unknown, unknown>>(toMap(null));
expectType<ConvertedMap<typeof entries>>(focusedMap(entries));
expectType<Set<number>>(toSet([1, 2]));
expectType<Set<string>>(toSet('abc'));
expectType<Set<number>>(toSet(new Set<number>() as ReadonlySet<number>));
expectType<Set<[string, number]>>(toSet(new Map<string, number>()));
expectType<Set<unknown>>(toSet({ length: 2 }));
expectType<Set<unknown>>(toSet());
expectType<ConvertedSet<readonly [1, 2]>>(legacySet([1, 2] as const));
expectType<Map<'key', 1>>(toMapIf(entries, true));
expectType<typeof entries>(toMapIf(entries, false));
expectType<typeof entries>(toMapIf(entries));
expectType<typeof entries | Map<'key', 1>>(toMapIf(entries, () => true));
expectType<Set<string>>(toSetIf('abc', true));
expectType<'abc'>(toSetIf('abc' as const, false));
expectType<'abc'>(toSetIf('abc' as const));
expectType<string | Set<string>>(toSetIf('abc', Math.random() > 0.5));
// @ts-expect-error Unknown iterable entries must not silently become typed Map entries.
expectType<Map<string, number>>(toMap(value));
// @ts-expect-error A Map conversion preserves its key type.
expectType<Map<number, 1>>(toMap(entries));
// @ts-expect-error A Set conversion preserves its element type.
expectType<Set<number>>(toSet('abc'));
// @ts-expect-error Predicates may skip conversion and preserve the original input.
expectType<Map<'key', 1>>(toMapIf(entries, () => true));
// @ts-expect-error Predicates may skip conversion and preserve the original input.
expectType<Set<string>>(toSetIf('abc', () => true));
// @ts-expect-error Collection conversions do not accept async conditions.
toMapIf(entries, async () => true);
// @ts-expect-error Collection conversions do not accept truthiness coercion.
toSetIf('abc', () => 1);

const recordMapInput = { a: 1, b: 2 } as const;
expectType<Map<string, 1 | 2>>(toMap(recordMapInput));
expectType<Map<string, 1 | 2>>(focusedMap(recordMapInput));
expectType<ConvertedMap<typeof recordMapInput>>(toMapIf(recordMapInput, true));
// @ts-expect-error object keys are strings, not numeric values.
expectType<Map<number, number>>(focusedMap(recordMapInput));
