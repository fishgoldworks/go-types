import T = require('go-types');
function assert(condition: boolean): void {
  if (!condition) throw new Error('Type/runtime contract regression');
}
function scalar(value: number | string, matcher: 'number' | 'boolean'): string {
  if (T.isArrayOf([value], matcher)) return 'matched';
  return typeof value === 'string' ? value.toUpperCase() : String(value);
}
function compiled(value: number | string, matcher: 'number' | 'boolean'): string {
  if (T.isArrayOf([value], matcher)) return 'matched';
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
assert(T.isArrayOf([42], 'number'));
assert(!T.isArrayOf(['42'], 'number'));
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
// Structural array/object declarations must not erase values on failed identity checks.
const copiedArrayInterface: string[] = Object.assign({}, ['x']);
assert(!T.isArray(copiedArrayInterface));
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
policy.enabled = false;
// Collection matchers use the same unbound callback convention as direct checks.
const matcherPolicy = { allowed: true };
function allowedItem(this: typeof matcherPolicy, _value: unknown): boolean {
  return this.allowed;
}
const boundItem = allowedItem.bind(matcherPolicy);
assert(T.isArrayOf([1], boundItem));
assert(T.isArrayLikeOf({ 0: 1, length: 1 }, boundItem));
assert(T.isSetOf(new Set([1]), boundItem));
assert(T.isMapOf(new Map([[1, 1]]), boundItem, boundItem));
assert(
  T.isArrayOf([1], function (value) {
    return this === undefined && value === 1;
  })
);
// Primitive intersections are boxed, even when they satisfy an object-shaped constraint.
const plainObject = T.toPlainObject({ a: 1 });
assert(plainObject.a === 1 && Object.getPrototypeOf(plainObject) === Object.prototype);
const recordObject = { a: 1 };
const copiedObject: Partial<typeof recordObject> = T.toPlainObject(recordObject);
assert(copiedObject !== recordObject && copiedObject.a === 1);
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
optionalArrayInput[Symbol.iterator] = null;
const indexedValues: unknown[] = T.toArray(optionalArrayInput);
assert(indexedValues.length === 3 && indexedValues[0] === 1 && indexedValues[1] === 1 && indexedValues[2] === null);
const definiteArrayLike: ArrayLike<number> = { 0: 7, length: 1 };
const definiteValues: (number | undefined)[] = T.toArray(definiteArrayLike);
assert(definiteValues.length === 2 && definiteValues[0] === 7 && definiteValues[1] === 1);
const definiteAbsent: ArrayLike<number> & {
  [Symbol.iterator]: null;
} = { 0: 8, length: 1, [Symbol.iterator]: null };
const definiteAbsentValues: (number | null | undefined)[] = T.toArray(definiteAbsent);
assert(definiteAbsentValues.length === 3 && definiteAbsentValues[0] === 8 && definiteAbsentValues[2] === null);

// Promise protocol detection accepts then-only values without calling their methods.
let subscriptionCalls = 0;
const thenOnly = {
  then() {
    subscriptionCalls++;
  }
};
assert(T.isPromiseLike(thenOnly));
assert(subscriptionCalls === 0);
assert(!T.isPromiseLike({ then: true }));
