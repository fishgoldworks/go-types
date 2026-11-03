import T from 'go-types';

type Equal<A, B> = (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2 ? true : false;
type Expect<V extends true> = V;
const boxed = T.box(3);
const empty = T.box();
const nullish = T.box(null);
const input = { a: 1 };
const unchanged = T.box(input);
const unboxed = T.unbox(3 as const);
const uncertain = T.unbox(input);
const promise = T.toPromise(Promise.resolve(3));
const omitted = T.toPromise();
const regex = T.toRegExp('a', 'i');
type A = Expect<Equal<typeof boxed, Number>>;
type B = Expect<Equal<typeof empty, undefined>>;
type C = Expect<Equal<typeof nullish, null>>;
type D = Expect<Equal<typeof unchanged, typeof input>>;
type E = Expect<Equal<typeof unboxed, 3>>;
type F = Expect<Equal<typeof uncertain, typeof input | string | number | boolean | symbol | bigint>>;
type G = Expect<Equal<typeof promise, Promise<number>>>;
type H = Expect<Equal<typeof omitted, Promise<undefined>>>;
type K = Expect<Equal<typeof regex, RegExp>>;
// @ts-expect-error structural properties cannot prove a genuine wrapper payload
const unsafe: number = T.unbox(new Number(3));
// @ts-expect-error omitted input is undefined, not an explicit generic value
T.toPromise<number>();
// @ts-expect-error omitted input is undefined
T.box<number>();
// @ts-expect-error flags are strings
T.toRegExp('a', 3);
// @ts-expect-error explicit conversion loses input-only properties
const extra: RegExp & { extra: true } = T.toRegExp({ source: 'a', extra: true });

declare const brand: unique symbol;
declare const numberId: number & { readonly [brand]: 'Id' };
declare const stringId: string & { readonly [brand]: 'Id' };
declare const booleanId: boolean & { readonly [brand]: 'Id' };
declare const symbolId: symbol & { readonly [brand]: 'Id' };
declare const bigintId: bigint & { readonly [brand]: 'Id' };
const boxedId = T.box(numberId);
const boxedTextId = T.box(stringId);
const boxedBoolId = T.box(booleanId);
const boxedSymbolId = T.box(symbolId);
const boxedBigIntId = T.box(bigintId);
const unboxedId = T.unbox(numberId);
type BrandedNumber = Expect<Equal<typeof boxedId, Number>>;
type BrandedString = Expect<Equal<typeof boxedTextId, String>>;
type BrandedBoolean = Expect<Equal<typeof boxedBoolId, Boolean>>;
type BrandedSymbol = Expect<Equal<typeof boxedSymbolId, Symbol>>;
type BrandedBigInt = Expect<Equal<typeof boxedBigIntId, BigInt>>;
type PreservedPrimitiveBrand = Expect<Equal<typeof unboxedId, typeof numberId>>;
// @ts-expect-error branded primitives still become objects when boxed
const stillPrimitive: number = T.box(numberId);
