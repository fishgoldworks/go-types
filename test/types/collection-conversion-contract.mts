import Types, { toArray, toSet, toMap, toArrayIf, toMapIf, toSetIf, type ArrayElement } from 'go-types';
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
const conditionalArray: typeof record | typeof values = toArrayIf(record, () => true);
const conditionalSet: typeof record | typeof set = toSetIf(record, Math.random() > 0.5);
const conditionalMap: typeof record | typeof map = toMapIf(record, () => false);
const unchanged: 1 = toMapIf(1 as const, false);
const emptySet: Set<unknown> = toSet();
const emptyMap: Map<unknown, unknown> = toMap(null);
// @ts-expect-error array conversion rejects nullish sources through ESM exports.
toArray(null);
// @ts-expect-error set conversion rejects primitive numbers through focused exports.
focusedSet(1);
// @ts-expect-error strict pairs retain their arity check through legacy ESM imports.
legacyMap([['key', 1, 2]] as const);
// @ts-expect-error definite conditional conversion rejects malformed pairs.
toMapIf([['key']] as const, true);
// @ts-expect-error inferred record values include symbol values.
const numericOnly: Set<number> = set;
