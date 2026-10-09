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
// conversion semantics have a later primary review area.
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
expectType<Map<unknown, unknown>>(T.toMap({ key: 1 }));
