'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const Types = require('go-types');

const targets = ['Array', 'BigInt', 'Boolean', 'Date', 'Integer', 'Number', 'Object', 'String', 'Symbol'];
for (const target of targets) {
    for (const suffix of ['', 'If']) {
        const name = 'to' + target + suffix;
        test(name + ' is a supported root function', () => {
            assert.equal(Object.hasOwn(Types, name), true);
            assert.equal(typeof Types[name], 'function');
        });
    }
}

// Expectations are explicit public contracts, not calls to private helpers.
const arrayCases = [
    ['empty array', () => [], []],
    ['array', () => [1, 2], [1, 2]],
    ['sparse array becomes dense', () => Array(2), [undefined, undefined]],
    ['string uses Unicode code points', () => 'A\u{1F600}B', ['A', '\u{1F600}', 'B']],
    ['empty string', () => '', []],
    ['boxed string', () => new String('ab'), ['a', 'b']],
    ['set preserves insertion order', () => new Set([2, 1, 2]), [2, 1]],
    ['map yields entries', () => new Map([['a', 1]]), [['a', 1]]],
    ['typed array', () => new Uint8Array([1, 2]), [1, 2]],
    ['bigint typed array', () => new BigInt64Array([1n, 2n]), [1n, 2n]],
    ['array-like values', () => ({0: 'x', 1: 'y', length: 2}), ['x', 'y']],
    ['missing array-like indices', () => ({length: 2}), [undefined, undefined]],
    ['fractional length follows Array.from', () => ({0: 'x', 1: 'y', length: 1.9}), ['x']],
    ['string length is converted', () => ({0: 'x', length: '1'}), ['x']],
    ['negative length is zero', () => ({length: -1}), []],
    ['NaN length is zero', () => ({length: NaN}), []],
    ['no collection shape gives empty array', () => ({}), []],
    ['number has no collection shape', () => 42, []],
    ['boolean has no collection shape', () => false, []],
    ['symbol has no collection shape', () => Symbol('x'), []],
    ['bigint has no collection shape', () => 1n, []],
    ['arguments object', () => (function () { return arguments; })('a', 'b'), ['a', 'b']],
    ['foreign array', () => vm.runInNewContext('[1, 2]'), [1, 2]],
    ['foreign set', () => vm.runInNewContext('new Set([2, 1])'), [2, 1]],
    ['null-prototype array-like', () => Object.assign(Object.create(null), {0: 'x', length: 1}), ['x']],
    ['inherited indices', () => Object.assign(Object.create({0: 'x'}), {length: 1}), ['x']],
    ['null iterator falls back to length', () => ({0: 'x', length: 1, [Symbol.iterator]: null}), ['x']],
];
for (const [label, input, expected] of arrayCases) {
    test('toArray: ' + label, () => assert.deepEqual(Types.toArray(input()), expected));
}

test('toArray returns a new shallow array without modifying its input', () => {
    const item = {};
    const input = Object.freeze([item]);
    const result = Types.toArray(input);
    assert.notEqual(result, input);
    assert.equal(result[0], item);
    result.push('new');
    assert.deepEqual(input, [item]);
});
test('toArray ignores subclass species and creates a local ordinary array', () => {
    class Items extends Array { static get [Symbol.species]() { throw Error('species read'); } }
    const result = Types.toArray(new Items(1, 2));
    assert.equal(Object.getPrototypeOf(result), Array.prototype);
    assert.deepEqual(result, [1, 2]);
});
test('toArray consumes a finite iterator once and executes its finally block', () => {
    let finished = 0;
    function* values() { try { yield 1; yield 2; } finally { finished++; } }
    const iterator = values();
    assert.deepEqual(Types.toArray(iterator), [1, 2]);
    assert.equal(finished, 1);
    assert.deepEqual(Types.toArray(iterator), []);
});
test('toArray prefers the iterator and does not inspect a conflicting length', () => {
    const input = {
        get length() { throw Error('length should not be read'); },
        *[Symbol.iterator]() { yield 7; }
    };
    assert.deepEqual(Types.toArray(input), [7]);
});
test('toArray snapshots array-like length once and reads values live', () => {
    let reads = 0;
    const input = {0: 'x', 1: 'y', get length() { reads++; return 2; }};
    assert.deepEqual(Types.toArray(input), ['x', 'y']);
    assert.equal(reads, 1);
});
for (const value of [null, undefined]) {
    test('toArray rejects ' + String(value), () => assert.throws(() => Types.toArray(value), TypeError));
}
for (const [label, value, error] of [
    ['non-callable iterator', {[Symbol.iterator]: 1}, TypeError],
    ['iterator returns a primitive', {[Symbol.iterator]: () => 1}, TypeError],
    ['next returns a primitive', {[Symbol.iterator]: () => ({next: () => 1})}, TypeError],
    ['symbol length', {length: Symbol('length')}, TypeError],
    ['bigint length', {length: 1n}, TypeError],
    ['array length overflow', {length: 2 ** 32}, RangeError],
]) {
    test('toArray rejects ' + label, () => assert.throws(() => Types.toArray(value), error));
}
test('toArray propagates the original iteration exception', () => {
    const error = new Error('next failed');
    const value = {[Symbol.iterator]: () => ({next() { throw error; }})};
    assert.throws(() => Types.toArray(value), e => e === error);
});
test('toArray propagates the original property exception', () => {
    const error = new Error('read failed');
    assert.throws(() => Types.toArray({get length() { throw error; }}), e => e === error);
});

const numberCases = [
    ['positive', 12, 12, 12], ['negative', -12, -12, -12],
    ['fractional', 1.9, 1.9, 1], ['negative fraction', -1.9, -1.9, -1],
    ['negative fraction preserves signed zero', -0.9, -0.9, -0],
    ['positive zero', 0, 0, 0], ['negative zero', -0, -0, -0],
    ['NaN', NaN, NaN, NaN], ['positive infinity', Infinity, Infinity, Infinity],
    ['negative infinity', -Infinity, -Infinity, -Infinity],
    ['null', null, 0, 0], ['undefined', undefined, NaN, NaN],
    ['true', true, 1, 1], ['false', false, 0, 0],
    ['empty string', '', 0, 0], ['whitespace', ' \t\n', 0, 0],
    ['decimal text', '12.9', 12.9, 12], ['negative decimal text', '-12.9', -12.9, -12],
    ['padded text', '  12  ', 12, 12], ['negative-zero text', '-0', -0, -0],
    ['hexadecimal', '0x10', 16, 16], ['binary', '0b11', 3, 3],
    ['octal', '0o10', 8, 8], ['exponent', '1e3', 1000, 1000],
    ['small exponent', 1e-7, 1e-7, 0], ['large exponent', 1e21, 1e21, 1e21],
    ['Infinity text', 'Infinity', Infinity, Infinity],
    ['partial numeric text is invalid', '12px', NaN, NaN],
    ['commas are invalid', '1,000', NaN, NaN], ['separators in text are invalid', '1_000', NaN, NaN],
    ['bigint', 12n, 12, 12], ['bigint text with suffix is invalid', '12n', NaN, NaN],
    ['boxed number', new Number(1.5), 1.5, 1], ['boxed false is unboxed', new Boolean(false), 0, 0],
    ['empty array', [], 0, 0], ['singleton array', ['2'], 2, 2],
    ['multi-item array', [1, 2], NaN, NaN], ['plain object', {}, NaN, NaN],
    ['Date timestamp', new Date(1234), 1234, 1234],
    ['unsafe integer rounds as Number', 9007199254740993n, 9007199254740992, 9007199254740992],
    ['smallest negative value', -Number.MIN_VALUE, -Number.MIN_VALUE, -0],
];
for (const [label, value, number, integer] of numberCases) {
    test('toNumber: ' + label, () => assert.equal(Types.toNumber(value), number));
    test('toInteger: ' + label, () => assert.equal(Types.toInteger(value), integer));
}
for (const name of ['toNumber', 'toInteger']) {
    test(name + ' rejects primitive and boxed symbols', () => {
        assert.throws(() => Types[name](Symbol()), TypeError);
        assert.throws(() => Types[name](Object(Symbol())), TypeError);
    });
    test(name + ' uses one observable numeric conversion', () => {
        const hints = [];
        const input = {[Symbol.toPrimitive](hint) { hints.push(hint); return '12'; }};
        assert.equal(Types[name](input), 12);
        assert.deepEqual(hints, ['number']);
    });
    test(name + ' propagates coercion errors without replacement', () => {
        const error = new Error('coercion');
        assert.throws(() => Types[name]({valueOf() { throw error; }}), e => e === error);
    });
    test(name + ' accepts foreign boxed input', () => {
        assert.equal(Types[name](vm.runInNewContext('new Number(12)')), 12);
    });
}

const bigintCases = [
    ['bigint', 123n, 123n], ['number', 12, 12n], ['negative integer', -12, -12n],
    ['negative zero', -0, 0n], ['decimal string', '9007199254740993', 9007199254740993n],
    ['hex string', '0xff', 255n], ['binary string', '0b11', 3n], ['octal string', '0o10', 8n],
    ['whitespace', '  ', 0n], ['empty text', '', 0n], ['true', true, 1n], ['false', false, 0n],
    ['boxed bigint', Object(2n), 2n], ['boxed number', new Number(2), 2n],
    ['boxed string', new String('2'), 2n], ['array primitive conversion', [2], 2n],
    ['empty array primitive conversion', [], 0n],
];
for (const [label, value, expected] of bigintCases) {
    test('toBigInt: ' + label, () => assert.equal(Types.toBigInt(value), expected));
}
for (const [label, value, error] of [
    ['fraction', 1.5, RangeError], ['NaN', NaN, RangeError], ['Infinity', Infinity, RangeError],
    ['undefined', undefined, TypeError], ['null', null, TypeError], ['symbol', Symbol(), TypeError],
    ['decimal fraction text', '1.5', SyntaxError], ['trailing suffix', '1n', SyntaxError],
    ['exponent text', '1e3', SyntaxError], ['partial text', '1px', SyntaxError],
]) {
    test('toBigInt rejects ' + label, () => assert.throws(() => Types.toBigInt(value), error));
}
test('toBigInt supports foreign wrappers without trusting constructor names', () => {
    assert.equal(Types.toBigInt(vm.runInNewContext('Object(42n)')), 42n);
});
test('toBigInt invokes a numeric primitive hook once', () => {
    const calls = [];
    assert.equal(Types.toBigInt({[Symbol.toPrimitive](hint) { calls.push(hint); return '42'; }}), 42n);
    assert.deepEqual(calls, ['number']);
});

for (const [label, value, expected] of [
    ['false', false, false], ['true', true, true], ['zero', 0, false], ['negative zero', -0, false],
    ['NaN', NaN, false], ['undefined', undefined, false], ['null', null, false],
    ['empty string', '', false], ['zero bigint', 0n, false], ['nonzero bigint', -1n, true],
    ['nonempty string false', 'false', true], ['nonempty string zero', '0', true],
    ['whitespace text', ' ', true], ['number', -1, true], ['infinity', Infinity, true],
    ['symbol', Symbol(), true], ['object', {}, true], ['array', [], true],
    ['boxed false', new Boolean(false), true], ['boxed zero', new Number(0), true],
    ['boxed empty string', new String(''), true], ['function', () => {}, true],
]) {
    test('toBoolean: ' + label, () => assert.equal(Types.toBoolean(value), expected));
}
test('toBoolean never calls object primitive-conversion hooks', () => {
    const input = {get [Symbol.toPrimitive]() { throw Error('must not be read'); }};
    assert.equal(Types.toBoolean(input), true);
    const revocable = Proxy.revocable({}, {}); revocable.revoke();
    assert.equal(Types.toBoolean(revocable.proxy), true);
});

for (const [label, value, expected] of [
    ['undefined', undefined, 'undefined'], ['null', null, 'null'], ['true', true, 'true'],
    ['false', false, 'false'], ['zero', 0, '0'], ['negative zero', -0, '0'],
    ['number', 12.5, '12.5'], ['NaN', NaN, 'NaN'], ['infinity', Infinity, 'Infinity'],
    ['bigint', 123n, '123'], ['string', 'abc', 'abc'], ['empty text', '', ''],
    ['symbol', Symbol('key'), 'Symbol(key)'], ['symbol without description', Symbol(), 'Symbol()'],
    ['boxed string', new String('abc'), 'abc'], ['boxed number', new Number(2), '2'],
    ['array', [1, null, 2], '1,,2'], ['plain object', {}, '[object Object]'],
]) {
    test('toString: ' + label, () => assert.equal(Types.toString(value), expected));
}
test('toString uses the string conversion hint exactly once', () => {
    const hints = [];
    assert.equal(Types.toString({[Symbol.toPrimitive](hint) { hints.push(hint); return 42; }}), '42');
    assert.deepEqual(hints, ['string']);
});
test('toString propagates conversion exceptions', () => {
    const error = new Error('string failed');
    assert.throws(() => Types.toString({toString() { throw error; }}), e => e === error);
    assert.throws(() => Types.toString(Object(Symbol('x'))), TypeError);
    assert.throws(() => Types.toString(Object.create(null)), TypeError);
});

for (const [label, value] of [
    ['plain object', {}], ['array', []], ['function', () => {}], ['date', new Date(0)],
    ['map', new Map()], ['null-prototype dictionary', Object.create(null)],
    ['foreign object', vm.runInNewContext('({x: 1})')], ['boxed number', new Number(1)],
]) {
    test('toObject preserves ' + label + ' identity', () => assert.equal(Types.toObject(value), value));
}
for (const [label, value] of [
    ['number', 42], ['NaN', NaN], ['negative zero', -0], ['string', 'abc'],
    ['boolean', false], ['bigint', 12n], ['symbol', Symbol('x')],
]) {
    test('toObject boxes ' + label, () => {
        const output = Types.toObject(value);
        assert.equal(typeof output, 'object');
        assert.equal(output.valueOf(), value);
    });
}
for (const value of [null, undefined]) {
    test('toObject creates a fresh empty object for ' + String(value), () => {
        const first = Types.toObject(value);
        assert.deepEqual(first, {});
        assert.notEqual(first, Types.toObject(value));
    });
}
test('toObject does not parse JSON text', () => {
    const output = Types.toObject('{"x":1}');
    assert.equal(output.valueOf(), '{"x":1}');
    assert.equal(output.x, undefined);
});
test('toObject does not inspect or unwrap a revoked proxy', () => {
    const revocable = Proxy.revocable({}, {}); revocable.revoke();
    assert.equal(Types.toObject(revocable.proxy), revocable.proxy);
});

for (const [label, value, expected] of [
    ['timestamp zero', 0, 0], ['positive timestamp', 1234, 1234],
    ['negative timestamp', -1234, -1234], ['fractional timestamp truncation', 1234.9, 1234],
    ['null timestamp', null, 0], ['false timestamp', false, 0], ['true timestamp', true, 1],
    ['ISO text', '2024-01-01T00:00:00.000Z', 1704067200000],
    ['invalid text', 'not a date', NaN], ['empty text', '', NaN], ['undefined', undefined, NaN],
    ['NaN', NaN, NaN], ['Infinity', Infinity, NaN],
    ['TimeClip maximum', 8640000000000000, 8640000000000000],
    ['TimeClip overflow', 8640000000000001, NaN],
]) {
    test('toDate: ' + label, () => assert.equal(Types.toDate(value).getTime(), expected));
}
test('toDate does not silently substitute the current time when omitted', () => {
    assert.equal(Types.toDate().getTime(), NaN);
});
for (const [label, value] of [
    ['local Date', new Date(42)], ['invalid Date', new Date(NaN)],
    ['foreign Date', vm.runInNewContext('new Date(42)')],
    ['Date subclass', new (class extends Date {})(42)],
]) {
    test('toDate preserves ' + label + ' identity', () => assert.equal(Types.toDate(value), value));
}
test('toDate does not execute overridden hooks on genuine Dates', () => {
    const date = new Date(42);
    Object.defineProperty(date, Symbol.toPrimitive, {get() { throw Error('must not read'); }});
    date.getTime = () => { throw Error('must not call'); };
    assert.equal(Types.toDate(date), date);
});
test('toDate performs observable native conversion for non-Date objects', () => {
    const hints = [];
    assert.equal(Types.toDate({[Symbol.toPrimitive](hint) { hints.push(hint); return 42; }}).getTime(), 42);
    assert.deepEqual(hints, ['default']);
});
test('toDate propagates symbol, bigint and coercion errors', () => {
    assert.throws(() => Types.toDate(Symbol('x')), TypeError);
    assert.throws(() => Types.toDate(1n), TypeError);
    const error = new Error('date failed');
    assert.throws(() => Types.toDate({valueOf() { throw error; }}), e => e === error);
});

for (const [label, value, expected] of [
    ['undefined', undefined, undefined], ['null', null, 'null'], ['string', 'key', 'key'],
    ['empty string', '', ''], ['number', 12, '12'], ['boolean', false, 'false'],
    ['bigint', 12n, '12'], ['boxed string', new String('key'), 'key'],
]) {
    test('toSymbol: ' + label, () => {
        const output = Types.toSymbol(value);
        assert.equal(typeof output, 'symbol');
        assert.equal(output.description, expected);
    });
}
test('toSymbol preserves primitive and boxed Symbol identity', () => {
    const symbol = Symbol('x');
    assert.equal(Types.toSymbol(symbol), symbol);
    assert.equal(Types.toSymbol(Object(symbol)), symbol);
    assert.equal(Types.toSymbol(Symbol.for('shared')), Symbol.for('shared'));
});
test('toSymbol unboxes foreign Symbol wrappers', () => {
    const boxed = vm.runInNewContext('Object(Symbol("x"))');
    assert.equal(Types.toSymbol(boxed), boxed.valueOf());
});
test('toSymbol creates unique, non-registry symbols for descriptions', () => {
    const first = Types.toSymbol('x');
    assert.notEqual(first, Types.toSymbol('x'));
    assert.equal(Symbol.keyFor(first), undefined);
});
test('toSymbol does not run overridden hooks on genuine Symbol wrappers', () => {
    const symbol = Symbol('x');
    const boxed = Object(symbol);
    Object.defineProperty(boxed, Symbol.toPrimitive, {get() { throw Error('must not read'); }});
    assert.equal(Types.toSymbol(boxed), symbol);
});
test('toSymbol invokes string conversion on other objects and propagates errors', () => {
    const hints = [];
    assert.equal(Types.toSymbol({[Symbol.toPrimitive](hint) { hints.push(hint); return 'x'; }}).description, 'x');
    assert.deepEqual(hints, ['string']);
    const error = new Error('symbol failed');
    assert.throws(() => Types.toSymbol({toString() { throw error; }}), e => e === error);
    assert.throws(() => Types.toSymbol(Object.create(null)), TypeError);
    assert.throws(() => Types.toSymbol(Object.create(Symbol.prototype)), TypeError);
});

const conditionalFixtures = {
    Array: {input: () => 'ab', check: output => assert.deepEqual(output, ['a', 'b'])},
    BigInt: {input: () => '42', check: output => assert.equal(output, 42n)},
    Boolean: {input: () => '', check: output => assert.equal(output, false)},
    Date: {input: () => 0, check: output => assert.equal(output.getTime(), 0)},
    Integer: {input: () => '4.8', check: output => assert.equal(output, 4)},
    Number: {input: () => '4.8', check: output => assert.equal(output, 4.8)},
    Object: {input: () => 4, check: output => {assert.equal(typeof output, 'object'); assert.equal(output.valueOf(), 4);}},
    String: {input: () => 4, check: output => assert.equal(output, '4')},
    Symbol: {input: () => 'x', check: output => {assert.equal(typeof output, 'symbol'); assert.equal(output.description, 'x');}},
};
for (const target of targets) {
    const name = 'to' + target + 'If';
    const fixture = conditionalFixtures[target];
    test(name + ' converts when the condition is true', () => fixture.check(Types[name](fixture.input(), true)));
    test(name + ' preserves exact input identity when false or omitted', () => {
        const input = Object.freeze({x: 1});
        assert.equal(Types[name](input, false), input);
        assert.equal(Types[name](input), input);
        assert.equal(Types[name](input, undefined), input);
        assert.equal(Types[name](-0, false), -0);
        assert.equal(Types[name](NaN, false), NaN);
    });
    test(name + ' calls a synchronous predicate once with the original input and no receiver', () => {
        const input = fixture.input();
        let calls = 0;
        fixture.check(Types[name](input, function (value) {
            calls++;
            assert.equal(arguments.length, 1);
            assert.equal(value, input);
            assert.equal(this, undefined);
            return true;
        }));
        assert.equal(calls, 1);
    });
    test(name + ' skips all input inspection when its predicate returns false', () => {
        const revocable = Proxy.revocable({}, {}); revocable.revoke();
        let calls = 0;
        assert.equal(Types[name](revocable.proxy, () => {calls++; return false;}), revocable.proxy);
        assert.equal(calls, 1);
    });
    test(name + ' rejects non-boolean conditions without coercion', () => {
        for (const condition of [null, 0, 1, '', 'false', {}, [], new Boolean(false), Symbol('x'), 1n]) {
            assert.throws(() => Types[name](fixture.input(), condition), TypeError);
        }
    });
    test(name + ' rejects non-boolean predicate results, including promises', () => {
        for (const result of [undefined, null, 0, 1, 'true', {}, [], new Boolean(true), Promise.resolve(true)]) {
            assert.throws(() => Types[name](fixture.input(), () => result), TypeError);
        }
        assert.throws(() => Types[name](fixture.input(), async () => true), TypeError);
    });
    test(name + ' propagates the original predicate error', () => {
        const error = new Error('predicate failed');
        assert.throws(() => Types[name](fixture.input(), () => {throw error;}), e => e === error);
    });
}
test('conditional conversions do not pre-convert invalid values on a false condition', () => {
    assert.equal(Types.toBigIntIf('bad', false), 'bad');
    assert.equal(Types.toArrayIf(null, false), null);
    const symbol = Symbol('x');
    assert.equal(Types.toNumberIf(symbol, false), symbol);
    assert.throws(() => Types.toBigIntIf('bad', true), SyntaxError);
    assert.throws(() => Types.toArrayIf(null, true), TypeError);
    assert.throws(() => Types.toNumberIf(symbol, true), TypeError);
});
test('conditional array conversion does not advance an iterator when skipped', () => {
    let calls = 0;
    function* values() { calls++; yield 1; }
    const value = values();
    assert.equal(Types.toArrayIf(value, false), value);
    assert.equal(calls, 0);
    assert.deepEqual(Types.toArrayIf(value, true), [1]);
    assert.equal(calls, 1);
});

test('conversion functions retain captured built-ins after initialisation', () => {
    const result = spawnSync(process.execPath, ['-e', `
        const assert = require('node:assert/strict');
        const T = require('go-types');
        const symbol = Symbol('saved');
        const boxed = Object(symbol);
        const date = new Date(0);
        const fail = () => {throw Error('reassigned built-in');};
        Array.from = fail;
        Math.trunc = fail;
        Symbol.prototype.valueOf = fail;
        for (const name of ['Number','BigInt','String','Boolean','Object','Date','Symbol']) globalThis[name] = fail;
        assert.deepEqual(T.toArray('ab'), ['a', 'b']);
        assert.strictEqual(T.toNumber('12'), 12);
        assert.strictEqual(T.toInteger('-1.9'), -1);
        assert.strictEqual(T.toBigInt('12'), 12n);
        assert.strictEqual(T.toString(12), '12');
        assert.strictEqual(T.toBoolean(0), false);
        assert.strictEqual(T.toObject(12).valueOf(), 12);
        assert.strictEqual(T.toDate(date), date);
        assert.strictEqual(T.toDate(0).getTime(), 0);
        assert.strictEqual(T.toSymbol(boxed), symbol);
        assert.strictEqual(typeof T.toSymbol('x'), 'symbol');
    `], {cwd: require('node:path').join(__dirname, '..'), encoding: 'utf8'});
    assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('toArray uses function arity as array-like length without invoking the function', () => {
    function input(first, second) { throw Error('must not be called'); }
    assert.deepEqual(Types.toArray(input), [undefined, undefined]);
});
test('toArray does not invoke or await the asynchronous iterator protocol', () => {
    let reads = 0;
    const input = {get [Symbol.asyncIterator]() { reads++; throw Error('must not be read'); }};
    assert.deepEqual(Types.toArray(input), []);
    assert.equal(reads, 0);
});
test('toArray uses native truthy iterator completion without reading its final value', () => {
    const input = {[Symbol.iterator]() { return {next() { return {done: 'yes', get value() {throw Error('complete');}}; }}; }};
    assert.deepEqual(Types.toArray(input), []);
});
test('toArray propagates a Symbol.iterator getter error', () => {
    const error = new Error('iterator lookup failed');
    assert.throws(() => Types.toArray({get [Symbol.iterator]() {throw error;}}), e => e === error);
});
test('toArray rejects detached typed-array input with the native error', () => {
    const buffer = new ArrayBuffer(8);
    const input = new Uint8Array(buffer);
    structuredClone(buffer, {transfer: [buffer]});
    assert.throws(() => Types.toArray(input), TypeError);
});
test('conversions that need object properties reject revoked proxies', () => {
    const revocable = Proxy.revocable({}, {}); revocable.revoke();
    for (const name of ['toArray', 'toNumber', 'toInteger', 'toBigInt', 'toString', 'toDate', 'toSymbol']) {
        assert.throws(() => Types[name](revocable.proxy), TypeError);
    }
});
test('toString supports boxed bigint and boolean values', () => {
    assert.equal(Types.toString(Object(12n)), '12');
    assert.equal(Types.toString(new Boolean(false)), 'false');
});
test('a conditional conversion sees deliberate input mutation by its predicate', () => {
    const input = {number: 1, valueOf() {return this.number;}};
    const result = Types.toNumberIf(input, value => {value.number = 2; return true;});
    assert.equal(result, 2);
    assert.equal(input.number, 2);
});
test('invalid conditional results do not run conversion hooks', () => {
    let conversions = 0;
    const input = {valueOf() {conversions++; return 1;}};
    assert.throws(() => Types.toNumberIf(input, () => 'true'), TypeError);
    assert.equal(conversions, 0);
});
