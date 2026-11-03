import T = require('go-types');
import isArrayOf = require('go-types/isArrayOf');

type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}

const check = isArrayOf([1], function (value) {
  expectFalse<IsAny<typeof value>>();
  expectType<undefined>(this);
  // @ts-expect-error A reusable predicate receives unknown input.
  void value.member;
  return typeof value === 'number';
});
expectType<boolean>(check);
T.isArrayLikeOf({ length: 0 }, (value) => value === null);
T.isSetOf(new Set(), 'object');
T.isMapOf(new Map(), (value) => typeof value === 'string', T.isNumber);
// @ts-expect-error The matcher is required even for an empty collection.
T.isArrayOf([]);
// @ts-expect-error Array-like matchers are required too.
T.isArrayLikeOf({ length: 0 });
// @ts-expect-error Set matchers are required.
T.isSetOf(new Set());
// @ts-expect-error Both Map matchers are required.
T.isMapOf(new Map(), 'string');
// @ts-expect-error Literal null is not a matcher.
T.isArrayOf([], null);
// @ts-expect-error Explicit undefined does not supply a matcher.
T.isArrayOf([], undefined);
// @ts-expect-error Boxed strings are not type-name strings.
T.isArrayOf([], new String('number'));
// @ts-expect-error Arrays of alternatives are not matchers.
T.isArrayOf([], ['number', 'string']);
// Predicate results use truthiness.
T.isArrayOf([], () => 1);
// Promise results are truthy without awaiting.
T.isArrayOf([], async () => true);
// @ts-expect-error A class must be used through an explicit predicate.
T.isArrayOf([], class Account {});
function checkNarrowing(value: unknown): void {
  if (T.isArrayOf(value, (item): item is number => typeof item === 'number')) {
    // @ts-expect-error Collection checks return boolean, including with a type guard.
    expectType<number[]>(value);
  }
}
checkNarrowing(1);
