import Types, { isMapOf, isSetOf } from 'go-types';
import isArrayOf from 'go-types/isArrayOf';
import isArrayLikeOf from 'go-types/isArrayLikeOf';

function needsReceiver(this: { allowed: boolean }, _value: unknown): boolean {
  return this.allowed;
}
const bad = { predicate: needsReceiver };
// @ts-expect-error ESM root collection callbacks receive no descriptor receiver.
isSetOf(new Set([1]), bad);
// @ts-expect-error ESM focused imports have the same receiver restriction.
isArrayOf([1], bad);
// @ts-expect-error both Map predicate positions use the shared contract.
isMapOf(new Map([[1, 1]]), 'number', bad);
// @ts-expect-error default namespace calls do not bind the callback either.
Types.isArrayLikeOf({ length: 1, 0: 1 }, bad);
const bound = { predicate: needsReceiver.bind({ allowed: true }) };
const array: boolean = isArrayOf([1], bound);
const arrayLike: boolean = isArrayLikeOf({ length: 1, 0: 1 }, bound);
const map: boolean = isMapOf(new Map([[1, 1]]), bound, bound);
const set: boolean = isSetOf(new Set([1]), bound);
