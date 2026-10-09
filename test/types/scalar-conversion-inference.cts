import T = require('go-types');
import toObject = require('go-types/toObject');
import toObjectIf = require('go-types/src/conversion/toObjectIf.js');

type Equal<A, B> = (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2 ? true : false;
type Expect<V extends true> = V;
type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}

// These are actual primitives, not assertions, fake guards or wrapper objects.
// Their intersections also satisfy object-shaped structural constraints.
const text: string & { readonly length: number } = 'abc';
const numeric: number & { toFixed(fractionDigits?: number): string } = 12;
const flag: boolean & { valueOf(): boolean } = true;
const large: bigint & { valueOf(): bigint } = 12n;
const key: symbol & { valueOf(): symbol } = Symbol('key');

type TextResult = Expect<Equal<T.ConvertedObject<typeof text>, String>>;
type NumberResult = Expect<Equal<T.ConvertedObject<typeof numeric>, Number>>;
type BooleanResult = Expect<Equal<T.ConvertedObject<typeof flag>, Boolean>>;
type BigIntResult = Expect<Equal<T.ConvertedObject<typeof large>, BigInt>>;
type SymbolResult = Expect<Equal<T.ConvertedObject<typeof key>, Symbol>>;

// @ts-expect-error converting a structural primitive creates a wrapper, not a string.
expectType<string>(T.toObject(text));
// @ts-expect-error literal true still performs boxing, including through an alias.
expectType<number>(toObjectIf(numeric, true));
// @ts-expect-error a boolean intersection is not preserved as a primitive boolean.
expectType<boolean>(toObject(flag));
// @ts-expect-error bigint wrapper results cannot be treated as primitive bigints.
expectType<bigint>(T.toObject(large));
// @ts-expect-error symbol wrapper results cannot be treated as primitive symbols.
expectType<symbol>(toObjectIf(key, true));

expectType<String>(toObject(text));
expectType<Number>(T.toObject(numeric));
expectType<Boolean>(toObject(flag));
expectType<BigInt>(T.toObject(large));
expectType<Symbol>(toObject(key));
expectType<typeof numeric>(toObjectIf(numeric, false));
expectType<typeof text>(T.toObjectIf(text));
expectType<typeof key>(T.toObjectIf(key, undefined));
const conditional = toObjectIf(text, function (value) {
  expectFalse<IsAny<typeof value>>();
  expectType<typeof text>(value);
  expectType<undefined>(this);
  // @ts-expect-error the inferred input has no numeric-only method.
  value.toFixed();
  return value.length > 0;
});
expectType<typeof text | String>(conditional);
// @ts-expect-error an executed conversion may return a wrapper.
expectType<string>(conditional);
const dynamic = T.toObjectIf(numeric, Math.random() > 0.5);
expectType<typeof numeric | Number>(dynamic);
// @ts-expect-error a dynamic condition does not promise the unchanged primitive.
expectType<number>(dynamic);

// Unions distribute over conversion; objects and functions still retain their type.
const record = { label: 'kept' };
type UnionResult = Expect<Equal<T.ConvertedObject<typeof text | typeof record>, String | typeof record>>;
expectType<typeof record>(toObject(record));
const wrapper = Object.assign(new Number(4), { label: 'kept' });
expectType<typeof wrapper>(T.toObject(wrapper));
function callback(value: number): string {
  return String(value);
}
expectType<typeof callback>(toObject(callback));
expectType<object>(toObject());
expectType<object>(toObject(null));
expectType<object>(toObject(undefined));

// Scalar conditional callbacks retain their own input, receiver and output types.
const amount = { text: '12' };
const maybeBigInt = T.toBigIntIf(amount, (value) => {
  expectFalse<IsAny<typeof value>>();
  expectType<string>(value.text);
  return false;
});
expectType<typeof amount | bigint>(maybeBigInt);
expectType<typeof amount | boolean>(T.toBooleanIf(amount, () => false));
expectType<typeof amount | Date>(T.toDateIf(amount, () => false));
expectType<typeof amount | number>(T.toIntegerIf(amount, () => false));
expectType<typeof amount | number>(T.toNumberIf(amount, () => false));
expectType<typeof amount | string>(T.toStringIf(amount, () => false));
expectType<typeof amount | symbol>(T.toSymbolIf(amount, () => false));
// @ts-expect-error conversion conditions do not await promises.
T.toStringIf(amount, async () => true);
// @ts-expect-error condition results are not truthiness-coerced.
T.toBooleanIf(amount, () => 1);
// @ts-expect-error Date conversion does not guarantee subtype members.
void T.toDate(Object.assign(new Date(0), { label: 'kept' })).label;
