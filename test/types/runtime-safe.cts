import T = require('go-types');
function assert(condition: boolean): void { if (!condition) throw new Error('Type/runtime contract regression'); }
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
function map(value: Map<number,number> | string, matcher: 'number' | 'boolean'): string {
    if (T.isMapOf(value, matcher, 'number')) return 'matched';
    return typeof value === 'string' ? value.toUpperCase() : String(value.size);
}
assert(scalar(42,'boolean') === '42');
assert(scalar(42,'number') === 'matched');
assert(compiled(42,'boolean') === '42');
assert(compiled('x','number') === 'X');
assert(array([42],'boolean') === '1');
assert(array(new Array<number>(1),'number') === '1');
assert(set(new Set([42]),'boolean') === '1');
assert(map(new Map([[42,42]]),'boolean') === '1');
assert(T.createTypeChecker('number')(42));
assert(!T.createTypeChecker('number')('42'));

// Structural types and typed proxies can fail native branding; refine explicitly.
function safeNative(value: Boolean | Date | Map<string, number> | Set<number> | RegExp | DataView | ArrayBufferView | string,
                    check: (value: unknown) => boolean): string {
    if (check(value)) return 'native';
    return typeof value === 'string' ? value.toUpperCase() : 'rejected';
}
assert(safeNative({valueOf: () => true}, T.isBoolean) === 'rejected');
assert(safeNative(new Proxy(new Date(0), {}), T.isDate) === 'rejected');
assert(safeNative(new Proxy(new Map([['x', 1]]), {}), T.isMap) === 'rejected');
assert(safeNative(new Proxy(new Set([1]), {}), T.isSet) === 'rejected');
assert(safeNative(new Proxy(/x/, {}), T.isRegExp) === 'rejected');
assert(safeNative(new Proxy(new DataView(new ArrayBuffer(4)), {}), T.isDataView) === 'rejected');
assert(safeNative({buffer: new ArrayBuffer(4), byteOffset: 0, byteLength: 4}, T.isArrayBufferView) === 'rejected');
assert(safeNative('text', T.isBoolean) === 'TEXT');
assert(safeNative(new Date(0), T.isDate) === 'native');
const tagged = Object.assign(new Date(0), {label: 'kept'});
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
const emptiedTuple: [number] = [1]; emptiedTuple.pop();
assert(!T.isNonEmptyArray(emptiedTuple));
function objectOrText(value: Number | string): string {
    if (T.isObject(value)) return 'object';
    return typeof value === 'string' ? value.toUpperCase() : String(value.valueOf());
}
assert(objectOrText(42) === '42');
assert(objectOrText('x') === 'X');
