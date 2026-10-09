import T = require('go-types');
function assert(condition: boolean): void {
  if (!condition) throw new Error('Type/runtime contract regression');
}
function scalar(value: number | string, matcher: 'number' | 'boolean'): string {
  if (T.isTypeOf(value, matcher)) return 'matched';
  return typeof value === 'string' ? value.toUpperCase() : String(value);
}
function compiled(value: number | string, matcher: 'number' | 'boolean'): string {
  const check = T.createTypeChecker(matcher);
  if (check(value)) return 'matched';
  return typeof value === 'string' ? value.toUpperCase() : String(value);
}
function array(value: number[] | string, matcher: 'number' | 'boolean'): string {
  if (T.isArrayOf(value, matcher)) return 'matched';
  return typeof value === 'string' ? value.toUpperCase() : String(value.length);
}
function set(value: Set<number> | string, matcher: 'number' | 'boolean'): string {
  if (T.isSetOf(value, matcher)) return 'matched';
  return typeof value === 'string' ? value.toUpperCase() : String(value.size);
}
function map(value: Map<number, number> | string, matcher: 'number' | 'boolean'): string {
  if (T.isMapOf(value, matcher, 'number')) return 'matched';
  return typeof value === 'string' ? value.toUpperCase() : String(value.size);
}
assert(scalar(42, 'boolean') === '42');
assert(scalar(42, 'number') === 'matched');
assert(compiled(42, 'boolean') === '42');
assert(compiled('x', 'number') === 'X');
assert(array([42], 'boolean') === '1');
assert(array(new Array<number>(1), 'number') === '1');
assert(set(new Set([42]), 'boolean') === '1');
assert(map(new Map([[42, 42]]), 'boolean') === '1');
assert(T.createTypeChecker('number')(42));
assert(!T.createTypeChecker('number')('42'));

// Structural types and typed proxies can fail native branding; refine explicitly.
function safeNative(
  value: Boolean | Date | Map<string, number> | Set<number> | RegExp | DataView | ArrayBufferView | string,
  check: (value: unknown) => boolean
): string {
  if (check(value)) return 'native';
  return typeof value === 'string' ? value.toUpperCase() : 'rejected';
}
assert(safeNative({ valueOf: () => true }, T.isBoolean) === 'rejected');
assert(safeNative(new Proxy(new Date(0), {}), T.isDate) === 'rejected');
assert(safeNative(new Proxy(new Map([['x', 1]]), {}), T.isMap) === 'rejected');
assert(safeNative(new Proxy(new Set([1]), {}), T.isSet) === 'rejected');
assert(safeNative(new Proxy(/x/, {}), T.isRegExp) === 'rejected');
assert(safeNative(new Proxy(new DataView(new ArrayBuffer(4)), {}), T.isDataView) === 'rejected');
assert(safeNative({ buffer: new ArrayBuffer(4), byteOffset: 0, byteLength: 4 }, T.isArrayBufferView) === 'rejected');
assert(safeNative('text', T.isBoolean) === 'TEXT');
assert(safeNative(new Date(0), T.isDate) === 'native');
const tagged = Object.assign(new Date(0), { label: 'kept' });
const wrapped = new Proxy(tagged, {
  get(target, key, receiver) {
    if (key === Symbol.toPrimitive) return () => 0;
    return Reflect.get(target, key, receiver);
  }
});
const converted: Date = T.toDate(wrapped);
assert(converted.getTime() === 0);
assert(!('label' in converted));
assert(T.toDate(tagged) === tagged);
assert(T.toDateIf(tagged, false) === tagged);
// Structural array/object declarations must not erase values on failed identity checks.
const copiedArrayInterface: string[] = Object.assign({}, ['x']);
assert(!T.isArray(copiedArrayInterface));
const emptiedTuple: [number] = [1];
emptiedTuple.pop();
assert(!T.isNonEmptyArray(emptiedTuple));
function objectOrText(value: Number | string): string {
  if (T.isObject(value)) return 'object';
  return typeof value === 'string' ? value.toUpperCase() : String(value.valueOf());
}
assert(objectOrText(42) === '42');
assert(objectOrText('x') === 'X');

// Conditional conversions call predicates without a receiver. Explicitly bound
// methods and arrows retain the documented runtime behaviour and inferred types.
const policy = { enabled: true };
function convertWhenEnabled(this: typeof policy, _value: unknown): boolean {
  return this.enabled;
}
const boundCondition = convertWhenEnabled.bind(policy);
const inputNumbers: readonly number[] = [1, 2];
const inputEntries = [['key', 1]] as const;
const arrayResult = T.toArrayIf(inputNumbers, boundCondition);
const mapResult = T.toMapIf(inputEntries, boundCondition);
const setResult = T.toSetIf(inputNumbers, boundCondition);
assert(arrayResult !== inputNumbers && arrayResult.length === 2);
assert(mapResult instanceof Map && mapResult.get('key') === 1);
assert(setResult instanceof Set && setResult.has(2));
policy.enabled = false;
assert(T.toArrayIf(inputNumbers, boundCondition) === inputNumbers);
assert(T.toMapIf(inputEntries, (value) => value.length > 1) === inputEntries);
assert(
  T.toSetIf(inputNumbers, function (value) {
    return this === undefined && value.length === 0;
  }) === inputNumbers
);

// Collection matchers use the same unbound callback convention as direct checks.
const matcherPolicy = { allowed: true };
function allowedItem(this: typeof matcherPolicy, _value: unknown): boolean {
  return this.allowed;
}
const boundItem = { predicate: allowedItem.bind(matcherPolicy) };
assert(T.isArrayOf([1], boundItem));
assert(T.isArrayLikeOf({ 0: 1, length: 1 }, boundItem));
assert(T.isSetOf(new Set([1]), boundItem));
assert(T.isMapOf(new Map([[1, 1]]), boundItem, boundItem));
assert(
  T.isArrayOf([1], {
    predicate(value) {
      return this === undefined && value === 1;
    }
  })
);

// Primitive intersections are boxed, even when they satisfy an object-shaped constraint.
const scalarText: string & { readonly length: number } = 'abc';
const scalarNumber: number & { toFixed(fractionDigits?: number): string } = 12;
const scalarFlag: boolean & { valueOf(): boolean } = true;
const scalarBigInt: bigint & { valueOf(): bigint } = 12n;
const scalarSymbol: symbol & { valueOf(): symbol } = Symbol('key');
const objectText: String = T.toObject(scalarText);
const objectNumber: Number = T.toObjectIf(scalarNumber, true);
const objectFlag: Boolean = T.toObject(scalarFlag);
const objectBigInt: BigInt = T.toObject(scalarBigInt);
const objectSymbol: Symbol = T.toObject(scalarSymbol);
assert(typeof objectText === 'object' && objectText.valueOf() === scalarText);
assert(typeof objectNumber === 'object' && objectNumber.valueOf() === scalarNumber);
assert(typeof objectFlag === 'object' && objectFlag.valueOf() === scalarFlag);
assert(typeof objectBigInt === 'object' && objectBigInt.valueOf() === scalarBigInt);
assert(typeof objectSymbol === 'object' && objectSymbol.valueOf() === scalarSymbol);
assert(T.toObjectIf(scalarText, false) === scalarText);
assert(T.toObjectIf(scalarNumber, () => false) === scalarNumber);
const labelledWrapper = Object.assign(new Number(4), { label: 'kept' });
const sameWrapper: typeof labelledWrapper = T.toObject(labelledWrapper);
assert(sameWrapper === labelledWrapper && sameWrapper.label === 'kept');

// Optional/nullable iterators can override numeric indexed values at conversion time.
interface OptionalArrayIterator extends ArrayLike<number> {
  [Symbol.iterator]?: (() => IterableIterator<string>) | null;
}
const optionalArrayInput: OptionalArrayIterator = {
  0: 1,
  length: 1,
  *[Symbol.iterator]() {
    yield 'text';
  }
};
const iteratedValues: unknown[] = T.toArray(optionalArrayInput);
assert(iteratedValues.length === 1 && iteratedValues[0] === 'text');
assert(T.toArrayIf(optionalArrayInput, true)[0] === 'text');
assert(T.toArrayIf(optionalArrayInput, false) === optionalArrayInput);
assert(T.toArrayIf(optionalArrayInput) === optionalArrayInput);
optionalArrayInput[Symbol.iterator] = null;
const indexedValues: unknown[] = T.toArray(optionalArrayInput);
assert(indexedValues.length === 1 && indexedValues[0] === 1);
const convertedAfterCondition = T.toArrayIf(optionalArrayInput, (value) => {
  value[Symbol.iterator] = function* () {
    yield 'changed';
  };
  return true;
});
assert(Array.isArray(convertedAfterCondition) && convertedAfterCondition[0] === 'changed');
const definiteArrayLike: ArrayLike<number> = { 0: 7, length: 1 };
const definiteValues: number[] = T.toArray(definiteArrayLike);
assert(definiteValues[0] === 7);
const definiteAbsent: ArrayLike<number> & { [Symbol.iterator]: null } = { 0: 8, length: 1, [Symbol.iterator]: null };
const definiteAbsentValues: number[] = T.toArray(definiteAbsent);
assert(definiteAbsentValues[0] === 8);
