import T = require('go-types');
import toPlainObject = require('go-types/toPlainObject');
import toPlainObjectIf = require('go-types/src/conversion/toPlainObjectIf.js');
type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}

const text: string & { readonly length: number } = '{"a":1}';
expectType<Record<string | symbol, unknown>>(toPlainObject(text));
// @ts-expect-error JSON values are unknown until checked.
expectType<number>(toPlainObject(text).a);
const symbol = Symbol('field');
const input = { a: 1, [symbol]: 'text' } as const;
const copied = toPlainObject(input);
expectType<1 | undefined>(copied.a);
expectType<'text' | undefined>(copied[symbol]);
// @ts-expect-error a declared field may be non-enumerable and omitted.
expectType<number>(copied.a);
copied.a = 1;
const pairs = [
  ['a', 1],
  ['b', 2]
] as const;
expectType<Partial<Record<'a' | 'b', 1 | 2>>>(T.toPlainObject(pairs));
expectType<Partial<Record<'a', number>>>(toPlainObject([['a', 1]]));
expectType<Record<string | symbol, unknown>>(toPlainObject(new Map<string, number>()));
expectType<Partial<Record<typeof symbol, number>>>(toPlainObject(new Map([[symbol, 1]])));
interface Input {
  a: number;
  b?: string;
}
declare const declared: Input;
expectType<Partial<Input>>(toPlainObject(declared));
interface MaybeIterable {
  a: number;
  [Symbol.iterator]?: () => IterableIterator<readonly ['b', string]>;
}
declare const maybeIterable: MaybeIterable;
expectType<unknown>(toPlainObject(maybeIterable).a);
// @ts-expect-error optional iteration can replace the copied properties.
expectType<number | undefined>(toPlainObject(maybeIterable).a);
// @ts-expect-error null is unsupported when conversion is requested.
toPlainObject(null);
// @ts-expect-error an input is required.
toPlainObject();
// @ts-expect-error undefined is unsupported.
toPlainObject(undefined);
// @ts-expect-error no primitive boxing.
toPlainObject(1);
// @ts-expect-error no primitive boxing.
toPlainObject(true);
// @ts-expect-error no primitive boxing.
toPlainObject(1n);
// @ts-expect-error no primitive boxing.
toPlainObject(symbol);
// @ts-expect-error boxed primitives are unsupported.
toPlainObject(new String('{}'));
// @ts-expect-error boxed primitives are unsupported.
toPlainObject(new Number(1));
// @ts-expect-error Dates are unsupported.
toPlainObject(new Date());
// @ts-expect-error functions are unsupported.
toPlainObject(() => 1);
// @ts-expect-error numeric entry keys are unsupported.
toPlainObject(new Map([[1, 'a']]));
// @ts-expect-error malformed pairs are unsupported.
toPlainObject([['a', 1, 2]] as const);
// @ts-expect-error ordinary arrays are unsupported.
toPlainObject([1, 2]);
// @ts-expect-error missing pair values are unsupported.
toPlainObject([['a']] as const);
expectType<Partial<Record<'a', number>>>(toPlainObjectIf([['a', 1]], true));
expectType<Partial<typeof input>>(toPlainObjectIf(input, true));
expectType<typeof input>(toPlainObjectIf(input, false));
expectType<null>(toPlainObjectIf(null, false));
expectType<undefined>(toPlainObjectIf(undefined));
expectType<1>(toPlainObjectIf(1 as const, undefined));
expectType<1>(toPlainObjectIf(1 as const, () => false));
// @ts-expect-error literal true must reject unsupported inputs.
toPlainObjectIf(null, true);
// @ts-expect-error literal true must not box a number.
toPlainObjectIf(1, true);
const conditional = toPlainObjectIf(input, function (value) {
  expectFalse<IsAny<typeof value>>();
  expectType<typeof input>(value);
  expectType<undefined>(this);
  return value.a === 1;
});
expectType<typeof input | Partial<typeof input>>(conditional);
expectType<typeof input | Partial<typeof input>>(toPlainObjectIf(input, Math.random() > 0.5));
// @ts-expect-error async predicates are unsupported.
toPlainObjectIf(input, async () => true);
// @ts-expect-error condition results must be booleans.
toPlainObjectIf(input, () => 1);
// @ts-expect-error old unpublished names have no aliases.
T.toObject(input);
// @ts-expect-error old unpublished per-function path is removed.
import oldObject = require('go-types/toObject');

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

// Omitted own properties can expose inherited Object.prototype values.
const hiddenToString = Object.defineProperty({ toString: 1 }, 'toString', { enumerable: false });
// @ts-expect-error an omitted numeric property can expose the inherited function.
expectType<number | undefined>(toPlainObject(hiddenToString).toString);
// @ts-expect-error an empty collection does not create its declared key.
expectType<number | undefined>(toPlainObject(new Map<'toString', number>()).toString);
// @ts-expect-error a broad string index includes prototype names.
expectType<number | undefined>(toPlainObject(new Map<string, number>()).toString);
// @ts-expect-error a broad record index can omit prototype names.
expectType<number | undefined>(toPlainObject({} as Record<string, number>).toString);
// @ts-expect-error the legacy prototype accessor remains inherited if omitted.
expectType<number | undefined>(toPlainObject(new Map<'__proto__', number>()).__proto__);

// @ts-expect-error JSON can shadow inherited methods with non-callable values.
toPlainObject('{"toString":1}').toString();
// @ts-expect-error broad entries can shadow inherited methods with non-callable values.
toPlainObject(new Map<string, number>([['toString', 1]])).toString();
// @ts-expect-error broad records can shadow inherited methods with non-callable values.
toPlainObject({ toString: 1 } as Record<string, number>).toString();
// @ts-expect-error a possibly present iterator can produce non-callable method-name properties.
toPlainObject(maybeIterable).toString();
