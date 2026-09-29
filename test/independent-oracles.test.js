'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const T = require('go-types');

// Small bounded graph interpreter: deliberately recursive and not compiled or
// deduplicated, unlike the production checker. Seed and bounds are reproducible.
function random(seed) {return () => ((seed = Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;}
function outcome(run) {try {return {value:run()};} catch(error) {return {error:error.name,message:error.message};}}
function interpret(value, specification) {
    if (Array.isArray(specification)) {
        for (let i=0; i<specification.length; i++) if (interpret(value,specification[i])) return true;
        return false;
    }
    if (typeof specification==='string') return typeof value===specification;
    if (specification===null || specification===undefined) return value===specification;
    if (typeof specification==='function') return value instanceof specification;
    if (Object.hasOwn(specification,'instanceOf')) return value instanceof specification.instanceOf;
    return specification.predicate(value);
}
for (let seed=1; seed<=128; seed++) {
    test('independent ordered matcher interpretation / seed '+seed, () => {
        let trace=[];
        const always={predicate(value){trace.push('always');return true;}};
        const never={predicate(value){trace.push('never');return false;}};
        const number={predicate(value){trace.push('number');return typeof value==='number';}};
        const thrower={predicate(){trace.push('throw');throw new RangeError('deliberate callback failure');}};
        const hooked=()=>{};
        Object.defineProperty(hooked,Symbol.hasInstance,{value(value){trace.push('instance');return value===42;}});
        const pool=['number','string','object','undefined','boolean','symbol','bigint','function',null,undefined,always,never,number,thrower,{instanceOf:hooked.bind(null)},hooked];
        const next=random(seed);
        for (let i=0; i<14; i++) {
            const branch=[];
            for (let n=Math.floor(next()*4);n>0;n--) branch.push(pool[Math.floor(next()*pool.length)]);
            pool.push(branch);
        }
        const specification=[pool[pool.length-1],pool[pool.length-2],pool[pool.length-1]];
        trace=[];const compiled=T.createTypeChecker(specification);assert.deepEqual(trace,[]);
        for (const value of [undefined,null,0,42,NaN,'42','',false,true,1n,Symbol('x'),{},[],()=>{}]) {
            trace=[];const expected=outcome(()=>interpret(value,specification));const calls=[...trace];
            trace=[];const actual=outcome(()=>compiled(value));
            assert.deepEqual(actual,expected);assert.deepEqual(trace,calls);
        }
    });
}

// Native conversions are the oracle for the supported conversion contracts;
// object-returning identity exceptions (Date/Symbol) have explicit assertions.
const conversions = {
    toArray:value=>Array.from(value),toBigInt:value=>BigInt(value),toBoolean:value=>Boolean(value),
    toInteger:value=>Math.trunc(Number(value)),toNumber:value=>Number(value),
    toObject:value=>Object(value),toString:value=>String(value)
};
const inputFactories = [()=>undefined,()=>null,()=>true,()=>false,()=>0,()=>-0,()=>-1.5,()=>NaN,()=>Infinity,
    ()=>-Infinity,()=>1n,()=>'0x10',()=>'',()=>' \t',()=>'false',()=>'A😀B',()=>'not numeric',()=>[1,2],()=>new Set([1,2]),
    ()=>({0:'x',length:2}),()=>({length:1.5}),()=>new Number(3),()=>new String('12.5'),()=>new Boolean(false),
    ()=>({valueOf(){return 3;}}),()=>({[Symbol.toPrimitive](){return '4.8';}}),()=>({valueOf(){throw new SyntaxError('conversion failure');}})];
for (const [name,native] of Object.entries(conversions)) {
    test(name+' agrees with independent native-conversion expectations',()=>{
        for (const make of inputFactories) {
            const value=make();
            assert.deepEqual(outcome(()=>T[name](value)),outcome(()=>native(value)));
        }
    });
}
for (const name of Object.keys(conversions).concat(['toDate','toSymbol'])) {
    test(name+'If does not inspect a skipped revoked proxy and invokes conditions once',()=>{
        const {proxy,revoke}=Proxy.revocable({},{});revoke();
        assert.equal(T[name+'If'](proxy,false),proxy);
        let calls=0;
        assert.equal(T[name+'If'](proxy,value=>{calls++;assert.equal(value,proxy);return false;}),proxy);
        assert.equal(calls,1);
    });
}
