import T from 'go-types';
import fromJson from 'go-types/fromJson';
import fromJsonIf from 'go-types/conversion/fromJsonIf';

type Equal<A, B> = (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2 ? true : false;
type Expect<V extends true> = V;
type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}
const result = fromJson('{"a":1}');
const root = T.fromJson('null');
const requested = fromJsonIf('42', true);
const skipped = fromJsonIf('invalid' as const, false);
const omitted = fromJsonIf('invalid' as const);
const dynamic = fromJsonIf('42', (value) => value.length > 0);
type Parsed = Expect<Equal<typeof result, unknown>>;
type Root = Expect<Equal<typeof root, unknown>>;
type Requested = Expect<Equal<typeof requested, unknown>>;
type Skipped = Expect<Equal<typeof skipped, 'invalid'>>;
type Omitted = Expect<Equal<typeof omitted, 'invalid'>>;
type Dynamic = Expect<Equal<typeof dynamic, unknown>>;
fromJson('1', function (key, value, context) {
  expectType<string>(key);
  expectFalse<IsAny<typeof value>>();
  expectFalse<IsAny<typeof this>>();
  expectType<unknown>(value);
  expectType<unknown>(this);
  expectType<string | undefined>(context?.source);
  // @ts-expect-error parsed data needs validation
  void value.a;
  // @ts-expect-error source context is unavailable on older supported runtimes
  void context.source;
  return typeof value === 'number' ? value + 1 : value;
});
fromJsonIf(
  '1',
  function (value) {
    expectType<string>(value);
    expectType<undefined>(this);
    return true;
  },
  (_key, value) => value
);
fromJson('1', null);
fromJson('1', async () => 2);
fromJson(null);
fromJson(42);
// @ts-expect-error parsing is not schema validation
const object: { a: number } = fromJson('{"a":1}');
// @ts-expect-error generic type assertions are not provided
fromJson<{ a: number }>('{"a":1}');
// @ts-expect-error a reviver can replace the root with arbitrary data
const revived: number = fromJson('1', () => 2);
// @ts-expect-error input is required; omitted input cannot parse
fromJson();
// @ts-expect-error reviver must accept arbitrary values
fromJson('1', (_key: string, value: number) => value);
// @ts-expect-error holder has no guaranteed application shape
fromJson('1', function (this: { a: number }, _key, value) {
  return value;
});
// @ts-expect-error source context is optional
fromJson('1', (_key, value, context: { source: string }) => value);
// @ts-expect-error only condition predicates must return synchronous booleans
fromJsonIf('1', async () => true);
// @ts-expect-error condition is not coerced
fromJsonIf('1', 'true');
