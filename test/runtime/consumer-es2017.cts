import Types = require('go-types');
import DefaultTypes, { isArray } from 'go-types';

const result: boolean = Types.isArray([]);
if (!result || DefaultTypes !== Types || isArray !== Types.isArray) throw new Error('ES2017 root imports differ');
const number: number = Types.toNumber('42');
if (number !== 42) throw new Error('ES2017 root conversion failed');
const boxedNumber: Number = Types.toObject(42);
if (boxedNumber.valueOf() !== 42) throw new Error('ES2017 number boxing failed');

// Check bigint declarations without requiring BigInt or emitting a bigint literal.
function checkBoxedBigInt(value: bigint) {
  const boxed = Types.toObject(value);
  const primitive: bigint = boxed.valueOf();
  const text: string = boxed.toString(16);
  const localised: string = boxed.toLocaleString();
  const tag: 'BigInt' = boxed[Symbol.toStringTag];
  const object: object = boxed;
  // @ts-expect-error Boxing does not return a primitive bigint.
  const unboxed: bigint = boxed;
  // @ts-expect-error A boxed bigint's valueOf does not return a number.
  const wrong: number = boxed.valueOf();
  // @ts-expect-error The library must not inject a newer runtime global into ES2017 consumers.
  BigInt('42');
  return { primitive, text, localised, tag, object, unboxed, wrong };
}

const entries = [['key', 1]] as const;
const convertedMap: Map<'key', 1> = Types.toMap(entries);
const convertedSet: Set<number> = Types.toSet([1, 1, 2]);
const skippedEntries: typeof entries = Types.toMapIf(entries, false);
const skippedText: 'aba' = Types.toSetIf('aba' as const, false);
if (
  convertedMap.get('key') !== 1 ||
  convertedSet.size !== 2 ||
  skippedEntries !== entries ||
  skippedText !== 'aba' ||
  Types.toMapIf(entries, true).get('key') !== 1 ||
  Types.toSetIf('aba', true).size !== 2 ||
  Types.toMap().size !== 0 ||
  Types.toSet(null).size !== 0
) {
  throw new Error('ES2017 collection conversion failed');
}

// Structural primitive intersections must still be boxed under legacy resolution.
const scalarText: string & { readonly length: number } = 'abc';
const boxedText: String = Types.toObject(scalarText);
// @ts-expect-error The result is not a primitive just because the input has a length property.
const textPrimitive: string = Types.toObject(scalarText);
const unchangedText: typeof scalarText = Types.toObjectIf(scalarText, false);
if (typeof boxedText !== 'object' || boxedText.valueOf() !== scalarText || unchangedText !== scalarText) {
  throw new Error('ES2017 primitive-intersection boxing failed');
}

// Visible optional iteration prevents the declaration from promising indexed numbers.
interface OptionalArrayIterator extends ArrayLike<number> {
  [Symbol.iterator]?: () => IterableIterator<string>;
}
const optionalArrayInput: OptionalArrayIterator = {
  0: 1,
  length: 1,
  *[Symbol.iterator]() {
    yield 'text';
  }
};
const optionalArrayResult: unknown[] = Types.toArray(optionalArrayInput);
// @ts-expect-error a present optional iterator overrides the indexed number type.
const optionalArrayNumbers: number[] = Types.toArray(optionalArrayInput);
if (optionalArrayResult[0] !== 'text' || Types.toArrayIf(optionalArrayInput, false) !== optionalArrayInput) {
  throw new Error('ES2017 optional iteration declaration/behaviour failed');
}
