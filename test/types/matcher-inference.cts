import T = require('go-types');
import createTypeChecker = require('go-types/createTypeChecker');
import isTypeOf = require('go-types/isTypeOf');

type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}

// Callbacks intentionally have no parameter annotations: check their contextual
// types inside the body, not just the returned checker's signature.
const check = T.createTypeChecker({
  predicate(value) {
    expectFalse<IsAny<typeof value>>();
    // @ts-expect-error unknown input needs a value check before property access.
    void value.member;
    return typeof value === 'number';
  }
});
const nested = createTypeChecker([
  'string',
  [
    {
      predicate: (value) => {
        expectFalse<IsAny<typeof value>>();
        // @ts-expect-error unknown is not an implicitly inferred number.
        const number: number = value;
        return typeof value === 'number';
      }
    }
  ]
]);
isTypeOf(null, {
  predicate(value) {
    expectFalse<IsAny<typeof value>>();
    // @ts-expect-error null input does not narrow the reusable predicate parameter.
    const onlyNull: null = value;
    return value === null;
  }
});
expectType<(value: unknown) => boolean>(check);
expectType<(value: unknown) => boolean>(nested);
// @ts-expect-error arbitrary predicates do not become two-sided type guards.
expectType<(value: unknown) => value is number>(check);
// @ts-expect-error union output does not become a structural type guard.
expectType<(value: unknown) => value is number | string>(nested);
expectType<(value: unknown) => value is number>(createTypeChecker('number'));
expectType<(value: unknown) => value is undefined>(createTypeChecker(undefined));
// @ts-expect-error literal typeof-undefined includes document.all, not only undefined.
expectType<(value: unknown) => value is undefined>(createTypeChecker('undefined'));

function checkFailure(value: number | string, name: 'number' | 'boolean'): void {
  const dynamic = createTypeChecker(name);
  if (!dynamic(value)) {
    expectType<number | string>(value);
    // @ts-expect-error failure of the boolean alternative can still leave a number.
    expectType<string>(value);
  }
}
checkFailure(1, 'boolean');
