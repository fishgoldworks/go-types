import Types, { toPlainObject, toDate, type ConvertedPlainObject } from 'go-types';
import focusedObject from 'go-types/toPlainObject';
const text: string & { readonly length: number } = '{"a":1}';
const input = { a: 1 };
const converted: Partial<typeof input> = toPlainObject(input);
const focused: typeof converted = focusedObject(input);
const result: ConvertedPlainObject<{ a: number }> = Types.toPlainObject({ a: 1 });
const date: Date = toDate(0);
// @ts-expect-error Named root conversion does not parse JSON text.
toPlainObject(text);
// @ts-expect-error Focused conversion does not parse JSON text.
focusedObject(text);
// @ts-expect-error Copied properties may be excluded by enumerability.
const value: number = result.a;
// @ts-expect-error ESM focused calls reject unsupported null input.
focusedObject(null);
