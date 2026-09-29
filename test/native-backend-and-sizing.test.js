'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('go-types');
const source = require('../scripts/source-test-loader.js')();
function load(processValue) {
    const scope = {process: processValue};
    vm.runInNewContext(source, scope);
    return scope.Types;
}

for (const [name, create] of [
    ['resolver call', () => ({getBuiltinModule() {throw Error('optional host bridge unavailable');}})],
    ['resolver getter', () => Object.defineProperty({}, 'getBuiltinModule', {get(){throw Error('optional host bridge denied');}})],
    ['types getter', () => ({getBuiltinModule() {return Object.defineProperty({}, 'types', {get(){throw Error('optional classifier access denied');}});}})]
]) {
    test('optional native acceleration falls back when '+name+' throws', () => {
        const api = load(create());
        assert.equal(api.isNumber(new Number(2)), true);
        assert.equal(api.isFinite(new Number(2)), true);
        assert.equal(api.isFinite({valueOf() {throw Error('must not coerce');}}), false);
        assert.equal(api.isMap(new Map()), true);
        assert.equal(api.isEmpty({}), true);
        assert.equal(api.isBlank({x:null}), true);
        const error = Error('application callback errors must still propagate');
        assert.throws(() => api.isTypeOf(1, {predicate(){throw error;}}), value => value === error);
    });
}

const refinements = ['isFinite','isInfinite','isNaN','isInteger','isFloat','isSafeInteger','isNumeric'];
const payloads = [0,-0,1,-1,1.5,-1.5,NaN,Infinity,-Infinity,Number.MIN_VALUE,Number.MAX_VALUE,
    Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER+1];
const F = load(undefined);
for (const name of refinements) {
    test(name+' numeric backend preserves public outcomes for native/foreign/altered wrappers', () => {
        for (const payload of payloads) {
            const expected = T[name](payload);
            const foreign = vm.runInNewContext('new Number(value)', {value:payload});
            for (const boxed of [new Number(payload),foreign]) {
                Object.setPrototypeOf(boxed, null);
                for (const key of ['valueOf','toString','constructor',Symbol.toPrimitive,Symbol.toStringTag]) {
                    Object.defineProperty(boxed, key, {get(){throw Error('payload access must use an intrinsic');}});
                }
                for (const api of [T,F]) assert.equal(api[name](boxed), expected);
            }
        }
    });
    test(name+' rejects impostors and native-object proxies without invoking traps', () => {
        let reads = 0;
        const hostile = {};
        for (const key of ['valueOf','toString','constructor',Symbol.toPrimitive,Symbol.toStringTag]) {
            Object.defineProperty(hostile, key, {get(){reads++;throw Error('do not inspect');}});
        }
        const proxy = new Proxy(new Number(1), {get(){reads++;throw Error('do not inspect');},getPrototypeOf(){reads++;throw Error('do not inspect');}});
        const revoked = Proxy.revocable(new Number(1), {});revoked.revoke();
        for (const value of [hostile,proxy,revoked.proxy,Object.create(Number.prototype),{},[],new Date(1),/x/,new Map(),new Set(),()=>1]) {
            for (const api of [T,F]) assert.equal(api[name](value),false);
        }
        assert.equal(reads,0);
    });
}

for (const name of ['isEmpty','isBlank']) {
    test(name+' distinguishes sized containers, synchronous iterables, next-only and async-only inputs', () => {
        let calls = 0;
        const iterator = {[Symbol.iterator](){calls++;return this;}, next(){calls++;return {done:true};}};
        const asyncOnly = {[Symbol.asyncIterator](){calls++;return this;},next(){calls++;return Promise.resolve({done:true});}};
        const nextOnly = {next(){calls++;return {done:true};}};
        for (const value of [iterator,asyncOnly,nextOnly]) assert.throws(() => T[name](value), error => error instanceof TypeError && /synchronous iterable/i.test(error.message) && /asynchronous/i.test(error.message));
        assert.equal(calls,0);
        // Valid lengths take precedence; opaque protocols do not turn into empty dictionaries.
        iterator.length=0; asyncOnly.length=0; nextOnly.length=0;
        for (const value of [iterator,asyncOnly,nextOnly]) assert.equal(T[name](value),true);
        assert.equal(calls,0);
    });
}

for (const discovery of ['missing', 'throws', 'partial']) {
    test('real source import and numeric outcomes with '+discovery+' optional backend', () => {
        const {spawnSync} = require('node:child_process');
        const root = require('node:path').resolve(__dirname,'..');
        const child = spawnSync(process.execPath,['-e',`
            const assert = require('node:assert/strict');
            const mode = ${JSON.stringify(discovery)};
            const original = process.getBuiltinModule;
            process.getBuiltinModule = mode === 'missing' ? undefined : mode === 'throws'
                ? () => {throw Error('host does not offer native modules');}
                : () => ({types:{}});
            const api = require(${JSON.stringify(root)});
            process.getBuiltinModule = original;
            const names = ['isFinite','isInfinite','isNaN','isInteger','isFloat','isSafeInteger','isNumeric'];
            for (const name of names) {
                for (const number of [0, -0, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER]) {
                    assert.equal(api[name](new Number(number)),api[name](number));
                }
                for (const value of [undefined,null,false,Symbol('x'),{},[],new Date(0)]) assert.equal(api[name](value),false);
                assert.equal(api[name](new Proxy(new Number(1),{})),false);
            }
            const error=Error('callback must propagate');
            assert.throws(()=>api.isTypeOf(1,{predicate(){throw error;}}),actual=>actual===error);
        `],{encoding:'utf8',timeout:10000});
        assert.equal(child.status,0,child.stderr);
    });
}
