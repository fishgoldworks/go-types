import T = require('go-types');
import isTypeOf = require('go-types/isTypeOf');

type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}

// Matcher callbacks retain unknown contextual input types on the public checks.
const check = T.isTypeOf(1, {
  predicate(value) {
    expectFalse<IsAny<typeof value>>();
    // @ts-expect-error unknown input needs a value check before property access.
    void value.member;
    return typeof value === 'number';
  }
});
const nested = isTypeOf(1, [
  'string',
  [
    {
      predicate(value) {
        expectFalse<IsAny<typeof value>>();
        // @ts-expect-error unknown is not an implicitly inferred number.
        const number: number = value;
        return typeof value === 'number';
      }
    }
  ]
]);
expectType<boolean>(check);
expectType<boolean>(nested);

function checkNarrowing(value: unknown): void {
  if (isTypeOf(value, 'number')) expectType<number>(value);
  if (isTypeOf(value, undefined)) expectType<undefined>(value);
  if (isTypeOf(value, 'undefined')) {
    // @ts-expect-error typeof-undefined also includes document.all.
    expectType<undefined>(value);
  }
  if (isTypeOf(value, { predicate: (input: unknown) => typeof input === 'number' })) {
    // @ts-expect-error arbitrary predicates do not establish two-sided narrowing.
    expectType<number>(value);
  }
}
function checkFailure(value: number | string, name: 'number' | 'boolean'): void {
  if (!isTypeOf(value, name)) {
    expectType<number | string>(value);
    // @ts-expect-error failure of the boolean alternative can still leave a number.
    expectType<string>(value);
  }
}
checkNarrowing(1);
checkFailure(1, 'boolean');
