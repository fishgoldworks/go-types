import T = require('go-types');
import toArray = require('go-types/toArray');
import toArrayIf = require('go-types/src/conversion/toArrayIf.js');

type Equal<A, B> = (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2 ? true : false;
type Expect<V extends true> = V;
type IsAny<V> = 0 extends 1 & V ? true : false;
function expectType<V>(_value: V): void {}
function expectFalse<V extends false>(): void {}

interface OptionalIterator extends ArrayLike<number> {
  readonly [Symbol.iterator]?: () => IterableIterator<string>;
}
interface NullableIterator extends ArrayLike<number> {
  readonly [Symbol.iterator]: (() => IterableIterator<string>) | null;
}
const optional: OptionalIterator = {
  0: 1,
  length: 1,
  *[Symbol.iterator]() {
    yield 'text';
  }
};
const nullable: NullableIterator = {
  0: 1,
  length: 1,
  *[Symbol.iterator]() {
    yield 'text';
  }
};

// A declared but optional/nullable method can take precedence at runtime.
// @ts-expect-error an optional iterator can yield strings rather than indexed numbers.
expectType<number[]>(T.toArray(optional));
// @ts-expect-error focused entries must preserve the same conservative result.
expectType<number[]>(toArray(optional));
// @ts-expect-error a nullable iterator can also be present when conversion executes.
expectType<number[]>(toArray(nullable));
// @ts-expect-error requested conversion does not prove that the iterator is absent.
expectType<number[]>(toArrayIf(optional, true));

type OptionalElements = Expect<Equal<T.ArrayElement<OptionalIterator>, unknown>>;
type NullableElements = Expect<Equal<T.ArrayElement<NullableIterator>, unknown>>;
expectType<unknown[]>(toArray(optional));
expectType<OptionalIterator>(toArrayIf(optional, false));
expectType<OptionalIterator>(toArrayIf(optional));
expectType<OptionalIterator>(toArrayIf(optional, undefined));
const dynamic = toArrayIf(optional, function (value) {
  expectFalse<IsAny<typeof value>>();
  expectType<OptionalIterator>(value);
  expectType<undefined>(this);
  // @ts-expect-error optional iteration does not erase the indexed number type in the callback.
  value[0].toUpperCase();
  return value.length > 0;
});
expectType<OptionalIterator | unknown[]>(dynamic);
// @ts-expect-error a skipped conversion can retain the original non-array object.
expectType<unknown[]>(dynamic);

// Definite iteration remains precise; absent iteration includes object values and possible array-like holes.
const definite: Iterable<string> & ArrayLike<number> = {
  0: 1,
  length: 1,
  *[Symbol.iterator]() {
    yield 'text';
  }
};
const absent: ArrayLike<number> = { 0: 1, length: 1 };
const undefinedMethod: ArrayLike<number> & { readonly [Symbol.iterator]?: undefined } = absent;
const nullMethod: ArrayLike<number> & { readonly [Symbol.iterator]: null } = { ...absent, [Symbol.iterator]: null };
expectType<string[]>(toArray(definite));
expectType<(number | undefined)[]>(toArray(absent));
expectType<(number | undefined)[]>(toArray(undefinedMethod));
expectType<(number | null | undefined)[]>(toArray(nullMethod));
expectType<number[]>(toArray([1, 2] as readonly number[]));
expectType<string[]>(toArray('text'));
expectType<(1 | 2)[]>(toArray([1, 2] as const));
expectType<number[]>(toArray(new Set<number>()));
expectType<[string, number][]>(toArray(new Map<string, number>()));
expectType<Promise<number>[]>(toArray([Promise.resolve(1)]));
// @ts-expect-error definite iterable values still take precedence over numeric positions.
expectType<number[]>(toArray(definite));
// @ts-expect-error conversion is synchronous, not promise unwrapping.
expectType<number[]>(toArray([Promise.resolve(1)]));
type Plain = Expect<Equal<T.ArrayElement<ArrayLike<number>>, number | undefined>>;
type Required = Expect<Equal<T.ArrayElement<typeof definite>, string>>;
type Nullish = Expect<Equal<T.ArrayElement<typeof nullMethod | typeof undefinedMethod>, number | null | undefined>>;
type Mixed = Expect<Equal<T.ArrayElement<OptionalIterator | readonly boolean[]>, unknown>>;
type UnknownInput = Expect<Equal<T.ArrayElement<unknown>, unknown>>;
type NeverInput = Expect<Equal<T.ArrayElement<never>, never>>;
