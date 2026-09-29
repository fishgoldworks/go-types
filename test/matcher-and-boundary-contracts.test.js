'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('..');

test('shared unions are snapshotted once per array identity', () => {
    let reads = 0;
    let union = [];
    for (let i = 0; i < 12; i++) {
        union = new Proxy([union, union], {
            getOwnPropertyDescriptor(target, key) {
                if (key === '0' || key === '1') reads++;
                return Reflect.getOwnPropertyDescriptor(target, key);
            }
        });
    }
    const check = T.createTypeChecker(union);
    assert.equal(check(1), false);
    assert.equal(reads, 24, 'each of the 24 exposed edges must be inspected only once');
});

test('shared predicates retain multiplicity, order, short-circuiting and live closure state', () => {
    const visits = [];
    let wanted = 3;
    const shared = [{predicate(value) { visits.push(value); return visits.length === wanted; }}];
    const check = T.createTypeChecker([shared, shared, shared, shared]);
    assert.equal(check(7), true);
    assert.deepEqual(visits, [7, 7, 7]);
    visits.length = 0; wanted = 20;
    assert.equal(check(8), false);
    assert.deepEqual(visits, [8, 8, 8, 8]);
});

test('compiled union evaluation is iterative, not recursive', () => {
    let calls = 0;
    const reject = {predicate() { calls++; return false; }};
    let union = 'number';
    for (let i = 0; i < 20000; i++) union = [reject, union];
    const check = T.createTypeChecker(union);
    assert.equal(check(1), true);
    assert.equal(calls, 20000);
    assert.equal(check('x'), false);
    assert.equal(calls, 40000);
});

test('compilation validates late invalid alternatives even after pure union simplification', () => {
    assert.throws(() => T.createTypeChecker([['number'], ['number'], ['bogus']]), TypeError);
    const cycle = []; cycle.push(cycle);
    assert.throws(() => T.createTypeChecker([[], ['number'], cycle]), TypeError);
});

for (const explicit of [false, true]) {
    for (const value of [42, 7, {}, null]) {
        test('bound custom instance target: '+explicit+' / '+String(value), () => {
            let calls = 0;
            const target = () => {};
            Object.defineProperty(target, Symbol.hasInstance, {value(v) { calls++; return v === 42; }});
            const bound = target.bind(null);
            const check = T.createTypeChecker(explicit ? {instanceOf:bound} : bound);
            assert.equal(calls, 0, 'compilation never invokes the hook');
            assert.equal(check(value), value === 42);
            assert.equal(calls, 1);
        });
    }
}

test('opaque nonconstructible targets defer native instanceof errors until evaluation', () => {
    const target = () => {};
    const check = T.createTypeChecker(target);
    assert.equal(check(1), false);
    assert.throws(() => check({}), TypeError);
    assert.equal(T.isArrayOf([], target), true);
});

test('custom instance hooks remain live after compilation', () => {
    function C() {}
    const check = T.createTypeChecker(C.bind(null));
    const instance = new C();
    assert.equal(check(instance), true);
    Object.defineProperty(C, Symbol.hasInstance, {value: () => false});
    assert.equal(check(instance), false);
});

test('cross-realm bound custom instance target works', () => {
    const target = vm.runInNewContext('(() => { const f=()=>{}; Object.defineProperty(f,Symbol.hasInstance,{value:x=>x===7}); return f.bind(null); })()');
    assert.equal(T.isTypeOf(7, target), true);
    assert.equal(T.isTypeOf(8, {instanceOf: target}), false);
});

for (const value of [undefined, null, false, true, 0, -0, 1, NaN, Infinity, '', 'x', Symbol(), 1n, {}, [], Object.create(null), () => {}]) {
    test('complementary boundaries: '+String(typeof value)+' / '+(typeof value === 'object' ? 'object' : String(value)), () => {
        assert.equal(T.isNullish(value), value === null || value === undefined);
        assert.equal(T.isNonNullish(value), !T.isNullish(value));
        assert.equal(T.isPrimitive(value), !T.isObject(value));
    });
}

test('array fast paths retain unsupported-size errors instead of disguising them as false', () => {
    for (const length of [NaN,-1,0.5,Infinity,undefined,'0']) {
        const array = new Proxy([], {get(target,key,receiver) {
            return key === 'length' ? length : Reflect.get(target,key,receiver);
        }});
        assert.throws(() => T.isEmpty(array), TypeError);
        assert.throws(() => T.isBlank(array), TypeError);
    }
});

test('fast paths read array length once and each blankness item once', () => {
    let lengthReads=0,itemReads=0;
    const array = new Proxy([undefined], {get(target,key,receiver) {
        if(key==='length') lengthReads++;
        if(key==='0') itemReads++;
        return Reflect.get(target,key,receiver);
    }});
    assert.equal(T.isBlank(array),true);
    assert.equal(lengthReads,1);assert.equal(itemReads,1);
});

for(const value of [0,-0,1,-1,1.5,-1.5,NaN,Infinity,-Infinity,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER+1,Number.MIN_VALUE]) {
    for(const [name,expected] of [
        ['isFinite',Number.isFinite(value)],['isInteger',Number.isInteger(value)],
        ['isSafeInteger',Number.isSafeInteger(value)],['isFloat',Number.isFinite(value)&&!Number.isInteger(value)],
        ['isNaN',Number.isNaN(value)],['isInfinite',value===Infinity||value===-Infinity]
    ]) test('numeric fast-path equivalence: '+name+' / '+String(value),()=>{
        assert.equal(T[name](value),expected);
        const boxed=new Number(value);
        Object.defineProperty(boxed,'valueOf',{get(){throw Error('user valueOf must not be read');}});
        Object.defineProperty(boxed,Symbol.toPrimitive,{get(){throw Error('coercion must not be read');}});
        assert.equal(T[name](boxed),expected);
    });
}

test('bound targets ignore their own prototype just as native instanceof does', () => {
    class Example {}
    const bound = Example.bind(null);
    bound.prototype = null;
    const value = new Example();
    assert.equal(value instanceof bound, true);
    assert.equal(T.isTypeOf(value, bound), true);
    assert.equal(T.isTypeOf(value, {instanceOf: bound}), true);
});

test('instance prototype errors are deferred rather than executing validation probes', () => {
    function Invalid() {}
    Invalid.prototype = null;
    const check = T.createTypeChecker(Invalid);
    assert.equal(check(1), false);
    assert.throws(() => check({}), TypeError);
});

test('reentrant compiled checks have independent evaluation stacks', () => {
    const calls=[];
    let check;
    const predicate={predicate(value) {
        calls.push(value);
        return value==='outer' ? check('inner') : false;
    }};
    check=T.createTypeChecker([[predicate,['number']],'string']);
    assert.equal(check('outer'),true);
    assert.deepEqual(calls,['outer','inner']);
    assert.equal(check(false),false);
});

test('shared effectful graph compilation does not run or deduplicate callbacks', () => {
    let calls=0;
    let spec=[{predicate() { return ++calls===3; }}];
    for(let i=0;i<1000;i++) spec=[spec,spec];
    const check=T.createTypeChecker(spec);
    assert.equal(calls,0);
    assert.equal(check(1),true);
    assert.equal(calls,3);
});

test('shared pure unions retain both matching and nonmatching outcomes', () => {
    const leaf = ['number', 'boolean'];
    const specification = [leaf, leaf];
    const check = T.createTypeChecker(specification);
    assert.equal(check(0), true);
    assert.equal(check(false), true);
    assert.equal(check('0'), false);
    assert.equal(check(null), false);
    assert.equal(check(undefined), false);
});
