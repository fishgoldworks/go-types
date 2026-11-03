import T from 'go-types';
import toJson from 'go-types/conversion/toJson';

type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}
const input = { a: 1, b: 'text' } as const;
expectType<string | undefined>(toJson(input));
expectType<string | undefined>(toJson());
expectType<string | undefined>(T.toJson(input, ['a', 1] as const, 2));
expectType<string | undefined>(toJson(input, null, '\t'));
expectType<string | undefined>(toJson(undefined, () => 42));
toJson(input, function (key, value) {
  expectFalse<IsAny<typeof value>>();
  expectFalse<IsAny<typeof this>>();
  expectType<string>(key);
  expectType<unknown>(value);
  expectType<unknown>(this);
  // @ts-expect-error arbitrary serialized values need narrowing.
  void value.a;
  return typeof value === 'number' ? value + 1 : value;
});
// @ts-expect-error serialization is not guaranteed to produce a string.
expectType<string>(toJson(input));
// @ts-expect-error callback must accept arbitrary values, not just numbers.
toJson(input, (_key: string, value: number) => value);
// @ts-expect-error JSON does not guarantee a particular holder shape.
toJson(input, function (this: { policy: boolean }, _key, value) {
  return value;
});
// @ts-expect-error public indentation options are strings or numbers.
toJson(input, null, {});
// A JSON replacer has native semantics and may replace values with arbitrary objects.
toJson(input, async () => 1);
