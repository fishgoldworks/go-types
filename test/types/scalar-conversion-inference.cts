import T = require('go-types');
import toPlainObject = require('go-types/toPlainObject');
type IsAny<V> = 0 extends 1 & V ? true : false;
function expectFalse<V extends false>(): void {}
function expectType<V>(_value: V): void {}

const text: string & { readonly length: number } = '{"a":1}';
// @ts-expect-error Strings, including intersections, are not conversion sources.
toPlainObject(text);
expectType<never>(null as unknown as T.ConvertedPlainObject<string>);
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
// @ts-expect-error old unpublished names have no aliases.
T.toObject(input);
// @ts-expect-error old unpublished per-function path is removed.
import oldObject = require('go-types/toObject');

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

// @ts-expect-error Copied properties can shadow inherited methods with non-callable values.
toPlainObject({ toString: 1 }).toString();
// @ts-expect-error broad entries can shadow inherited methods with non-callable values.
toPlainObject(new Map<string, number>([['toString', 1]])).toString();
// @ts-expect-error broad records can shadow inherited methods with non-callable values.
toPlainObject({ toString: 1 } as Record<string, number>).toString();
// @ts-expect-error a possibly present iterator can produce non-callable method-name properties.
toPlainObject(maybeIterable).toString();
