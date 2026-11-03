import Types, { toArray, toSet, toMap, type ArrayElement } from 'go-types';
import focusedArray from 'go-types/toArray';
import focusedSet from 'go-types/conversion/toSet';
import legacyMap from 'go-types/src/conversion/toMap.js';

const key = Symbol('key');
const record = { 42: 'answer', [key]: 7, length: false } as const;
const values: ('answer' | 7 | false)[] = toArray(record);
const focusedValues: typeof values = focusedArray(record);
const elements: ArrayElement<typeof record>[] = Types.toArray(record);
const set: Set<'answer' | 7 | false> = focusedSet(record);
const map: Map<string | typeof key, 'answer' | 7 | false> = legacyMap(record);
const emptySet: Set<unknown> = toSet();
const emptyMap: Map<unknown, unknown> = toMap(null);
// @ts-expect-error array conversion rejects nullish sources through ESM exports.
toArray(null);
// @ts-expect-error set conversion rejects primitive numbers through focused exports.
focusedSet(1);
// @ts-expect-error strict pairs retain their arity check through legacy ESM imports.
legacyMap([['key', 1, 2]] as const);
// @ts-expect-error inferred object values include symbol values.
const numericOnly: Set<number> = set;
