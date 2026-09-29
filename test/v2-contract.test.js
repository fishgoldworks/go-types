'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('../');
const foreign = text => vm.runInNewContext(text);
const predicate = fn => ({predicate: fn});

for (const name of ['isArrayBuffer', 'isSharedArrayBuffer', 'isArrayBufferView', 'isTypedArray', 'isDataView',
    'isAsyncIterable', 'isIteratorLike', 'isNonNullish', 'isObjectLike', 'isNonEmptyArray', 'isJson',
    'createTypeChecker', 'isSetOf', 'isMapOf', 'isEmptyIterable', 'isBlankIterable']) {
    test('public export: ' + name, () => assert.equal(typeof T[name], 'function'));
}
for (const value of [undefined, null, false, true, 0, -0, NaN, Infinity, '', 'x', 0n, Symbol(), {}, [], () => {}]) {
    test('non-nullish is the strict complement of nullish: ' + String(value), () => {
        assert.equal(T.isNonNullish(value), value !== null && value !== undefined);
        assert.equal(T.isNonNullish(value), !T.isNullish(value));
    });
    test('object-like excludes functions: ' + String(value), () => {
        assert.equal(T.isObjectLike(value), value !== null && typeof value === 'object');
    });
}
test('non-nullish filtering retains every valid falsy value', () => {
    assert.deepEqual([0, false, '', NaN, 0n, null, undefined].filter(T.isNonNullish), [0, false, '', NaN, 0n]);
});
for (const [label, value, expected] of [['empty', [], false], ['one hole', new Array(1), true], ['pair', [1,2], true],
    ['arraylike', {length:1}, false], ['foreign', foreign('[1]'), true]]) {
    test('non-empty array: ' + label, () => assert.equal(T.isNonEmptyArray(value), expected));
}
for (const [name, make, result] of [
    ['isArrayBuffer', () => new ArrayBuffer(0), true],
    ['isArrayBuffer', () => new SharedArrayBuffer(0), false],
    ['isSharedArrayBuffer', () => new SharedArrayBuffer(8), true],
    ['isSharedArrayBuffer', () => new ArrayBuffer(8), false],
    ['isArrayBufferView', () => new Uint8Array(0), true],
    ['isArrayBufferView', () => new DataView(new ArrayBuffer(0)), true],
    ['isArrayBufferView', () => new ArrayBuffer(0), false],
    ['isTypedArray', () => new Uint8Array(0), true],
    ['isTypedArray', () => new DataView(new ArrayBuffer(0)), false],
    ['isDataView', () => new DataView(new ArrayBuffer(0)), true],
    ['isDataView', () => new Uint8Array(0), false],
    ['isTypedArray', () => Buffer.from([1]), true]
]) test('binary classification: ' + name + ' ' + make, () => assert.equal(T[name](make()), result));
for (const [name, expression, Constructor] of [
    ['isArrayBuffer', 'new ArrayBuffer(8)', ArrayBuffer],
    ['isSharedArrayBuffer', 'new SharedArrayBuffer(8)', SharedArrayBuffer],
    ['isDataView', 'new DataView(new ArrayBuffer(8))', DataView],
    ['isTypedArray', 'new Uint16Array(4)', Uint16Array],
    ['isArrayBufferView', 'new Float32Array(2)', Float32Array]
]) {
    test('binary identity: ' + name + ' cross-realm', () => assert.equal(T[name](foreign(expression)), true));
    test('binary identity: ' + name + ' prototype-only and tag imitations', () => {
        assert.equal(T[name](Object.create(Constructor.prototype)), false);
        assert.equal(T[name]({[Symbol.toStringTag]: Constructor.name}), false);
    });
    test('binary identity: ' + name + ' rejects proxies including revoked proxies', () => {
        const native = foreign(expression);
        assert.equal(T[name](new Proxy(native, {})), false);
        const {proxy, revoke} = Proxy.revocable(native, {}); revoke();
        assert.equal(T[name](proxy), false);
    });
    test('binary identity: ' + name + ' ignores customised tag getters', () => {
        const native = foreign(expression);
        Object.defineProperty(native, Symbol.toStringTag, {get() {throw Error('must not run');}});
        assert.equal(T[name](native), true);
    });
}
for (const C of [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array,
    Float32Array, Float64Array, BigInt64Array, BigUint64Array]) {
    test('typed-array family: ' + C.name, () => {
        const input = new C(2);
        assert.equal(T.isTypedArray(input), true);
        assert.equal(T.isArrayBufferView(input), true);
        assert.equal(T.isDataView(input), false);
        assert.equal(T.isTypedArray(new (class extends C {})(2)), true);
    });
}
test('detached buffer/view identities are preserved', () => {
    const buffer = new ArrayBuffer(8), typed = new Uint8Array(buffer), view = new DataView(buffer);
    structuredClone(buffer, {transfer:[buffer]});
    assert.equal(T.isArrayBuffer(buffer), true);
    assert.equal(T.isTypedArray(typed), true);
    assert.equal(T.isArrayBufferView(view), true);
    assert.equal(T.isDataView(view), true);
});
test('resizable buffer and out-of-bounds views preserve native identity', () => {
    const buffer = new ArrayBuffer(8, {maxByteLength:16});
    const view = new DataView(buffer, 4, 4), typed = new Uint8Array(buffer, 4, 4);
    buffer.resize(2);
    assert.equal(T.isArrayBuffer(buffer), true);
    assert.equal(T.isDataView(view), true);
    assert.equal(T.isTypedArray(typed), true);
});
for (const [input, async, iterator] of [[null,false,false], [[],false,false], [{next:1},false,false],
    [{next(){}},false,true], [{[Symbol.asyncIterator]:1},false,false], [{[Symbol.asyncIterator](){}},true,false]]) {
    test('protocol shape: ' + String(input) + ' ' + async + iterator, () => {
        assert.equal(T.isAsyncIterable(input), async);
        assert.equal(T.isIteratorLike(input), iterator);
    });
}
test('protocol inspection never invokes async iterator or next methods', () => {
    let called = false;
    const value = {next(){called=true;throw Error();}, [Symbol.asyncIterator](){called=true;throw Error();}};
    assert.equal(T.isAsyncIterable(value), true);
    assert.equal(T.isIteratorLike(value), true);
    assert.equal(called, false);
});
test('async generators have async iterable and iterator capabilities only', () => {
    const iterator = (async function*(){yield 1;})();
    assert.equal(T.isAsyncIterable(iterator), true);
    assert.equal(T.isIteratorLike(iterator), true);
    assert.equal(T.isIterable(iterator), false);
});
test('protocol inspection allows null-prototype objects and callable objects', () => {
    for (const x of [Object.create(null), function(){}]) {
        x.next = () => ({done:true}); x[Symbol.asyncIterator] = () => x;
        assert.equal(T.isIteratorLike(x), true); assert.equal(T.isAsyncIterable(x), true);
    }
});
test('plain null-prototype dictionaries participate in empty/blank checks', () => {
    const x = Object.create(null);
    assert.equal(T.isPlainObject(x), true); assert.equal(T.isEmpty(x), true); assert.equal(T.isBlank(x), true);
    x.value = null;
    assert.equal(T.isEmpty(x), false); assert.equal(T.isBlank(x), true);
    x.value = 0;
    assert.equal(T.isBlank(x), false);
});
for (const text of ['', ' ', '\t\r\n', '\u00a0', '\u2003', '\ufeff']) {
    test('numeric whitespace rejected: ' + JSON.stringify(text), () => {
        assert.equal(T.isNumeric(text), false); assert.equal(T.isNumeric(new String(text)), false);
    });
}
for (const text of ['0', '-0', '1.5', '-.2', '1e3', ' 1 ', '0x10', '0b11', '0o7']) {
    test('numeric finite number syntax retained: ' + JSON.stringify(text), () => assert.equal(T.isNumeric(text), true));
}
for (const fn of ['isEmpty', 'isBlank']) {
    test(fn + ' rejects unsized iterators without advancing/closing them', () => {
        let calls = 0;
        const value = (function*(){try {calls++; yield 1;} finally {calls++;}})();
        assert.throws(() => T[fn](value), TypeError); assert.equal(calls, 0);
        assert.deepEqual(value.next(), {value:1, done:false});
    });
    test(fn + ' rejects async iterators without invoking them', () => {
        let calls = 0;
        const x = {next(){calls++;}, [Symbol.asyncIterator](){calls++;}};
        assert.throws(() => T[fn](x), TypeError); assert.equal(calls,0);
    });
    test(fn + ' uses container identity rather than overridden iteration', () => {
        const x = new Map();
        x[Symbol.iterator] = () => {throw Error('must not call');};
        Object.defineProperty(x, 'size', {get(){throw Error('must not read');}});
        assert.equal(T[fn](x), true);
    });
    test(fn + ' checks arrays with disabled iterators without consuming anything', () => {
        const a = []; a[Symbol.iterator] = null;
        assert.equal(T[fn](a), true);
    });
}
test('blank Maps inspect values and leave contents unchanged', () => {
    const map = new Map([['a', null], ['b', undefined]]);
    assert.equal(T.isBlank(map), true); assert.equal(T.isEmpty(map), false);
    assert.deepEqual([...map], [['a',null],['b',undefined]]);
    map.set('c', 0); assert.equal(T.isBlank(map), false);
});
test('empty and blank dictionary scope excludes symbol/non-enumerable/inherited properties', () => {
    const x = Object.create(null);
    x[Symbol('x')] = 1;
    Object.defineProperty(x, 'hidden', {value:1});
    assert.equal(T.isEmpty(x), true); assert.equal(T.isBlank(x), true);
});
for (const fn of ['isEmptyIterable', 'isBlankIterable']) {
    test(fn + ' reads Symbol.iterator once', () => {
        let gets = 0;
        const input = {get [Symbol.iterator](){gets++; return function*(){yield null;};}};
        assert.equal(T[fn](input), fn === 'isBlankIterable'); assert.equal(gets,1);
    });
    test(fn + ' rejects non-iterables instead of classifying them as empty', () => {
        for (const value of [null, undefined, 1, {}, {next(){}}]) assert.throws(() => T[fn](value), TypeError);
    });
}
