import Types, { toPlainObject, toPlainObjectIf, toDate, type ConvertedPlainObject } from 'go-types';
import focusedObject from 'go-types/toPlainObject';
import focusedObjectIf from 'go-types/conversion/toPlainObjectIf';
const text: string & { readonly length: number } = '{"a":1}';
const converted: Record<string | symbol, unknown> = toPlainObject(text);
const focused: typeof converted = focusedObject(text);
const conditional: string | typeof converted = toPlainObjectIf(text, () => true);
const skipped: typeof text = focusedObjectIf(text, false);
const result: ConvertedPlainObject<{ a: number }> = Types.toPlainObject({ a: 1 });
const date: Date = toDate(0);
// @ts-expect-error JSON conversion does not produce a primitive string.
const primitive: string = focusedObject(text);
// @ts-expect-error copied properties may be excluded by enumerability.
const value: number = result.a;
// @ts-expect-error ESM focused calls reject unsupported null input.
focusedObject(null);
