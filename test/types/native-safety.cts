// Native identity is not equivalent to a TypeScript structural interface.
// Compile-time regressions: neither branch may invent structural exclusion.
import T = require('go-types');
function expectType<V>(_value: V): void {}

export function isBooleanSafety(value: Boolean | string) {
  const accepted: boolean = T.isBoolean(value);
  if (T.isBoolean(value)) {
    expectType<Boolean | string>(value);
  } else {
    expectType<Boolean | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isNumberSafety(value: Number | string) {
  const accepted: boolean = T.isNumber(value);
  if (T.isNumber(value)) {
    expectType<Number | string>(value);
  } else {
    expectType<Number | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isStringSafety(value: String | number) {
  const accepted: boolean = T.isString(value);
  if (T.isString(value)) {
    expectType<String | number>(value);
  } else {
    expectType<String | number>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toFixed();
  }
  return accepted;
}

export function isMapSafety(value: Map<string, number> | string) {
  const accepted: boolean = T.isMap(value);
  if (T.isMap(value)) {
    expectType<Map<string, number> | string>(value);
  } else {
    expectType<Map<string, number> | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isSetSafety(value: Set<number> | string) {
  const accepted: boolean = T.isSet(value);
  if (T.isSet(value)) {
    expectType<Set<number> | string>(value);
  } else {
    expectType<Set<number> | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isWeakMapSafety(value: WeakMap<object, number> | string) {
  const accepted: boolean = T.isWeakMap(value);
  if (T.isWeakMap(value)) {
    expectType<WeakMap<object, number> | string>(value);
  } else {
    expectType<WeakMap<object, number> | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isWeakSetSafety(value: WeakSet<object> | string) {
  const accepted: boolean = T.isWeakSet(value);
  if (T.isWeakSet(value)) {
    expectType<WeakSet<object> | string>(value);
  } else {
    expectType<WeakSet<object> | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isDateSafety(value: Date | string) {
  const accepted: boolean = T.isDate(value);
  if (T.isDate(value)) {
    expectType<Date | string>(value);
  } else {
    expectType<Date | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isRegExpSafety(value: RegExp | string) {
  const accepted: boolean = T.isRegExp(value);
  if (T.isRegExp(value)) {
    expectType<RegExp | string>(value);
  } else {
    expectType<RegExp | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isArrayBufferSafety(value: ArrayBuffer | string) {
  const accepted: boolean = T.isArrayBuffer(value);
  if (T.isArrayBuffer(value)) {
    expectType<ArrayBuffer | string>(value);
  } else {
    expectType<ArrayBuffer | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isSharedArrayBufferSafety(value: SharedArrayBuffer | string) {
  const accepted: boolean = T.isSharedArrayBuffer(value);
  if (T.isSharedArrayBuffer(value)) {
    expectType<SharedArrayBuffer | string>(value);
  } else {
    expectType<SharedArrayBuffer | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isArrayBufferViewSafety(value: ArrayBufferView | string) {
  const accepted: boolean = T.isArrayBufferView(value);
  if (T.isArrayBufferView(value)) {
    expectType<ArrayBufferView | string>(value);
  } else {
    expectType<ArrayBufferView | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isTypedArraySafety(value: T.TypedArray | string) {
  const accepted: boolean = T.isTypedArray(value);
  if (T.isTypedArray(value)) {
    expectType<T.TypedArray | string>(value);
  } else {
    expectType<T.TypedArray | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isDataViewSafety(value: DataView | string) {
  const accepted: boolean = T.isDataView(value);
  if (T.isDataView(value)) {
    expectType<DataView | string>(value);
  } else {
    expectType<DataView | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isArraySafety(value: unknown[] | string) {
  const accepted: boolean = T.isArray(value);
  if (T.isArray(value)) {
    expectType<unknown[] | string>(value);
  } else {
    expectType<unknown[] | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isNonEmptyArraySafety(value: [number, ...number[]] | string) {
  const accepted: boolean = T.isNonEmptyArray(value);
  if (T.isNonEmptyArray(value)) {
    expectType<[number, ...number[]] | string>(value);
  } else {
    expectType<[number, ...number[]] | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

export function isObjectSafety(value: Number | string) {
  const accepted: boolean = T.isObject(value);
  if (T.isObject(value)) {
    expectType<Number | string>(value);
  } else {
    expectType<Number | string>(value);
    // @ts-expect-error a rejected structural/native-looking object is still possible.
    value.toUpperCase();
  }
  return accepted;
}

const tagged = Object.assign(new Date(0), { label: 'kept' });
const wrapper = new Proxy(tagged, {
  get(target, key, receiver) {
    if (key === Symbol.toPrimitive) return () => 0;
    return Reflect.get(target, key, receiver);
  }
});
const converted: Date = T.toDate(wrapper);
// @ts-expect-error conversion may construct a Date without structural subtype members.
T.toDate(wrapper).label.toUpperCase();
// @ts-expect-error actual Date identity is not established by a generic structural type.
const retained: typeof wrapper = T.toDate(wrapper);
const unchanged: typeof tagged = T.toDateIf(tagged, false);
const conditional: Date = T.toDateIf(wrapper, true);
// @ts-expect-error condition true cannot promise structural subtype preservation either.
void T.toDateIf(wrapper, true).label;
// Exact primitive checking and nullish filtering retain narrowing.
const values: number[] = [1, 'x', null].filter((value: unknown): value is number => typeof value === 'number');
const present: (number | string)[] = [1, 'x', null, undefined].filter(T.isNonNullish);
