import T from 'go-types';
import parseJson from 'go-types/parseJson';
import parseJsonIf from 'go-types/conversion/parseJsonIf';

type Equal<A, B> = (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2 ? true : false;
type Expect<V extends true> = V;
type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}
const result = parseJson('{"a":1}');
const root = T.parseJson('null');
const requested = parseJsonIf('42', true);
const skipped = parseJsonIf('invalid' as const, false);
const omitted = parseJsonIf('invalid' as const);
const dynamic = parseJsonIf('42', (value) => value.length > 0);
type Parsed = Expect<Equal<typeof result, unknown>>;
type Root = Expect<Equal<typeof root, unknown>>;
type Requested = Expect<Equal<typeof requested, unknown>>;
type Skipped = Expect<Equal<typeof skipped, 'invalid'>>;
type Omitted = Expect<Equal<typeof omitted, 'invalid'>>;
type Dynamic = Expect<Equal<typeof dynamic, unknown>>;
parseJson('1', function (key, value, context) {
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
parseJsonIf(
  '1',
  function (value) {
    expectType<string>(value);
    expectType<undefined>(this);
    return true;
  },
  (_key, value) => value
);
parseJson('1', null);
parseJson('1', async () => 2);
parseJson(null);
parseJson(42);
// @ts-expect-error parsing is not schema validation
const object: { a: number } = parseJson('{"a":1}');
// @ts-expect-error generic type assertions are not provided
parseJson<{ a: number }>('{"a":1}');
// @ts-expect-error a reviver can replace the root with arbitrary data
const revived: number = parseJson('1', () => 2);
// @ts-expect-error input is required; omitted input cannot parse
parseJson();
// @ts-expect-error reviver must accept arbitrary values
parseJson('1', (_key: string, value: number) => value);
// @ts-expect-error holder has no guaranteed application shape
parseJson('1', function (this: { a: number }, _key, value) {
  return value;
});
// @ts-expect-error source context is optional
parseJson('1', (_key, value, context: { source: string }) => value);
// @ts-expect-error only condition predicates must return synchronous booleans
parseJsonIf('1', async () => true);
// @ts-expect-error condition is not coerced
parseJsonIf('1', 'true');
