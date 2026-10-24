import T = require('go-types');
function expectType<V>(_v: V): void {}

export function dynamic(value: number | string, matcher: 'number' | 'boolean') {
  if (T.isTypeOf(value, matcher)) return 'matched';
  // @ts-expect-error a nonmatching runtime alternative does not eliminate numbers.
  value.toUpperCase();
  expectType<number | string>(value);
}
export function array(value: number[] | string) {
  if (T.isArrayOf(value, 'number')) return;
  // @ts-expect-error a sparse number[] can fail validation.
  value.toUpperCase();
}
export function dynamicArray(value: number[] | string, matcher: 'number' | 'boolean') {
  if (T.isArrayOf(value, matcher)) return;
  // @ts-expect-error arrays are still possible.
  value.toUpperCase();
}
export function set(value: Set<number> | string, matcher: 'number' | 'boolean') {
  if (T.isSetOf(value, matcher)) return;
  // @ts-expect-error set is still possible.
  value.toUpperCase();
}
export function map(value: Map<string, number> | string, matcher: 'number' | 'boolean') {
  if (T.isMapOf(value, 'string', matcher)) return;
  // @ts-expect-error map is still possible.
  value.toUpperCase();
}
export function dynamicTuple(value: number | string, matcher: 'number' | 'boolean') {
  if (T.isTypeOf(value, [matcher, null] as const)) return;
  // @ts-expect-error readonly tuple does not make a dynamic member an exhaustive union.
  value.toUpperCase();
}
export function sparse(value: number[] | string) {
  if (!T.isArrayOf(value, 'number')) {
    if (typeof value === 'string') return value.toUpperCase();
    return value.length;
  }
  return 'valid';
}
expectType<number | string>(sparse(new Array<number>(1)));
