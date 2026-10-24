import T = require('go-types');
import isArrayOf = require('go-types/isArrayOf');
import isArrayLikeOf = require('go-types/isArrayLikeOf');
import isSetOf = require('go-types/isSetOf');
import isMapOf = require('go-types/isMapOf');

function expectType<V>(_value: V): void {}
type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}

const policy = { allowed: true };
function needsReceiver(this: typeof policy, _value: unknown): boolean {
  return this.allowed;
}
const bad = { predicate: needsReceiver };
// @ts-expect-error collection predicates are not invoked with a policy receiver.
isArrayOf([1], bad);
// @ts-expect-error array-like predicates receive no receiver either.
isArrayLikeOf({ 0: 1, length: 1 }, bad);
// @ts-expect-error Set predicates receive no receiver.
isSetOf(new Set([1]), bad);
// @ts-expect-error Map key predicates receive no receiver.
isMapOf(new Map([[1, 1]]), bad, 'number');
// @ts-expect-error Map value predicates receive no receiver.
isMapOf(new Map([[1, 1]]), 'number', bad);
// @ts-expect-error the same shared contract applies to direct matching.
T.isTypeOf(1, bad);
// @ts-expect-error the exported descriptor type must retain the invocation contract.
const invalidDescriptor: T.PredicateMatcher = bad;

const bound = { predicate: needsReceiver.bind(policy) };
expectType<boolean>(isArrayOf([1], bound));
expectType<boolean>(isArrayLikeOf({ 0: 1, length: 1 }, bound));
expectType<boolean>(isSetOf(new Set([1]), bound));
expectType<boolean>(isMapOf(new Map([[1, 1]]), bound, bound));
const independent: T.PredicateMatcher = {
  predicate: function (this: void, value) {
    return value !== null;
  }
};
expectType<boolean>(isArrayOf([1], independent));

isArrayOf([1], {
  predicate(value) {
    expectFalse<IsAny<typeof value>>();
    expectType<undefined>(this);
    // @ts-expect-error the reusable matcher input is unknown, not the current array's element type.
    value.toFixed();
    // @ts-expect-error a descriptor is not a callback receiver.
    void this.predicate;
    return typeof value === 'number';
  }
});
isMapOf(
  new Map([['key', 1]]),
  {
    predicate: (key) => {
      expectFalse<IsAny<typeof key>>();
      // @ts-expect-error known Map keys do not narrow the reusable callback parameter.
      expectType<string>(key);
      return typeof key === 'string';
    }
  },
  {
    predicate(value) {
      expectType<undefined>(this);
      expectFalse<IsAny<typeof value>>();
      return typeof value === 'number';
    }
  }
);
const nested: T.TypeMatcher = ['number', [bound, independent]];
expectType<boolean>(isArrayLikeOf({ length: 0 }, nested));
function checkFailure(value: number[] | string): void {
  if (!isArrayOf(value, 'number')) {
    expectType<number[] | string>(value);
    // @ts-expect-error rejection can leave a sparse numeric array, not only a string.
    expectType<string>(value);
  }
}
