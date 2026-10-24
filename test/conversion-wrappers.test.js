'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('../index');

for (const value of [false, true, 0, -0, NaN, Infinity, '', 'text', Symbol('key'), 12n]) {
  test('box and unbox preserve the primitive payload: ' + String(value), () => {
    const boxed = T.box(value);
    assert.equal(typeof boxed, 'object');
    assert.equal(T.unbox(boxed), value);
    assert.equal(T.unbox(value), value);
    assert.equal(T.box(boxed), boxed);
  });
}
test('boxing and unboxing preserve nullish and omitted values', () => {
  for (const fn of [T.box, T.unbox]) {
    assert.equal(fn(), undefined);
    assert.equal(fn(undefined), undefined);
    assert.equal(fn(null), null);
  }
});
test('objects, functions and proxies are preserved without observable inspection', () => {
  const hostile = new Proxy(
    {},
    {
      get() {
        throw Error('get');
      },
      getPrototypeOf() {
        throw Error('prototype');
      }
    }
  );
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  for (const value of [
    {
      valueOf() {
        throw Error('valueOf');
      }
    },
    new Date(0),
    /a/,
    () => 1,
    hostile,
    revoked.proxy,
    Object.create(Number.prototype),
    new Proxy(new Number(3), {})
  ]) {
    assert.equal(T.box(value), value);
    assert.equal(T.unbox(value), value);
  }
});
test('unbox accepts foreign wrappers, subclasses and ignores overridden hooks', () => {
  for (const [code, expected] of [
    ['new Number(3)', 3],
    ['new String("a")', 'a'],
    ['new Boolean(false)', false],
    ['Object(12n)', 12n]
  ]) {
    const value = vm.runInNewContext(code);
    for (const key of ['valueOf', 'toString', Symbol.toPrimitive, Symbol.toStringTag]) {
      Object.defineProperty(value, key, {
        get() {
          throw Error('hook');
        }
      });
    }
    assert.equal(T.unbox(value), expected);
  }
  assert.equal(T.unbox(new (class extends Number {})(4)), 4);
  const symbol = Symbol('key');
  const boxed = Object(symbol);
  boxed.valueOf = () => {
    throw Error('hook');
  };
  assert.equal(T.unbox(boxed), symbol);
});
test('toRegExp uses native patterns and flags, without slash parsing or escaping', () => {
  assert.equal(T.toRegExp().source, '(?:)');
  assert.equal(T.toRegExp(null).source, 'null');
  assert.equal(T.toRegExp(12).source, '12');
  assert.equal(T.toRegExp('a.b', 'i').test('AxB'), true);
  assert.equal(T.toRegExp('/a/i').test('a'), false);
  assert.throws(() => T.toRegExp('['), SyntaxError);
  assert.throws(() => T.toRegExp('a', 'gg'), SyntaxError);
  assert.throws(() => T.toRegExp(Symbol()), TypeError);
});
test('toRegExp preserves native identity and copy/lastIndex behaviour', () => {
  const value = /a/g;
  value.lastIndex = 2;
  assert.equal(T.toRegExp(value), value);
  assert.equal(T.toRegExp(value).lastIndex, 2);
  const copy = T.toRegExp(value, 'i');
  assert.notEqual(copy, value);
  assert.equal(copy.source, 'a');
  assert.equal(copy.flags, 'i');
  assert.equal(copy.lastIndex, 0);
  const foreign = vm.runInNewContext('/a/g');
  assert.notEqual(T.toRegExp(foreign), foreign);
  assert.equal(T.toRegExp(foreign).source, 'a');
  assert.equal(T.toRegExp(new (class extends RegExp {})('a')).constructor, RegExp);
});
test('toRegExp never returns a regex-shaped ordinary object', () => {
  const fake = { [Symbol.match]: true, constructor: RegExp, source: 'a', flags: 'i' };
  const result = T.toRegExp(fake);
  assert.notEqual(result, fake);
  assert.equal(T.isRegExp(result), true);
  assert.equal(result.test('A'), true);
});
test('toRegExp propagates native coercion errors unchanged', () => {
  const error = new Error('coercion');
  assert.throws(
    () =>
      T.toRegExp({
        toString() {
          throw error;
        }
      }),
    (e) => e === error
  );
  const value = /a/;
  Object.defineProperty(value, 'constructor', {
    get() {
      throw error;
    }
  });
  assert.throws(
    () => T.toRegExp(value),
    (e) => e === error
  );
});
test('toPromise resolves values, preserves native promises and does not invoke functions', async () => {
  assert.equal(await T.toPromise(), undefined);
  assert.equal(await T.toPromise(3), 3);
  const input = { a: 1 };
  assert.equal(await T.toPromise(input), input);
  const fn = () => {
    throw Error('called');
  };
  assert.equal(await T.toPromise(fn), fn);
  const promise = Promise.resolve(2);
  assert.equal(T.toPromise(promise), promise);
});
test('toPromise adopts foreign promises and nested thenables', async () => {
  const foreign = vm.runInNewContext('Promise.resolve(4)');
  const result = T.toPromise(foreign);
  assert.notEqual(result, foreign);
  assert.equal(await result, 4);
  let calls = 0;
  const thenable = {
    then(resolve) {
      assert.equal(this, thenable);
      calls++;
      resolve({
        then(done) {
          done(5);
        }
      });
    }
  };
  const adopted = T.toPromise(thenable);
  assert.equal(calls, 0);
  assert.equal(await adopted, 5);
  assert.equal(calls, 1);
});
test('toPromise retains native rejection and synchronous error distinctions', async () => {
  const error = new Error('rejection');
  const rejected = Promise.reject(error);
  assert.equal(T.toPromise(rejected), rejected);
  await assert.rejects(rejected, (e) => e === error);
  await assert.rejects(
    T.toPromise({
      get then() {
        throw error;
      }
    }),
    (e) => e === error
  );
  await assert.rejects(
    T.toPromise({
      then() {
        throw error;
      }
    }),
    (e) => e === error
  );
  const value = Promise.resolve(1);
  Object.defineProperty(value, 'constructor', {
    get() {
      throw error;
    }
  });
  assert.throws(
    () => T.toPromise(value),
    (e) => e === error
  );
});
for (const [name, input, expected] of [
  ['box', 3, 3],
  ['unbox', new Number(3), 3],
  ['toRegExp', 'a', 'a'],
  ['toPromise', 3, 3]
]) {
  test(name + 'If obeys strict, synchronous conditions and skips without inspection', async () => {
    const fn = T[name + 'If'];
    const normalize = (value) =>
      name === 'box' ? Number.prototype.valueOf.call(value) : name === 'toRegExp' ? value.source : value;
    assert.equal(normalize(await fn(input, true)), expected);
    let calls = 0;
    assert.equal(
      normalize(
        await fn(input, function (value) {
          assert.equal(this, undefined);
          assert.equal(value, input);
          calls++;
          return true;
        })
      ),
      expected
    );
    assert.equal(calls, 1);
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    for (const condition of [false, undefined, () => false]) assert.equal(fn(revoked.proxy, condition), revoked.proxy);
    for (const condition of [null, 1, 'true', new Boolean(true), () => undefined, async () => true])
      assert.throws(() => fn(input, condition), TypeError);
    const error = new Error('predicate');
    assert.throws(
      () =>
        fn(input, () => {
          throw error;
        }),
      (e) => e === error
    );
  });
}
test('toRegExpIf puts flags after the condition and skips invalid flags', () => {
  assert.equal(T.toRegExpIf('a', true, 'i').test('A'), true);
  assert.equal(T.toRegExpIf('[', false, 'gg'), '[');
});

for (const backend of [false, true]) {
  for (const constructor of ['Symbol', 'BigInt']) {
    for (const mode of ['deleted', 'undefined']) {
      test('unbox preserves wrappers without ' + constructor + '.valueOf: ' + mode + ', backend=' + backend, () => {
        const { moduleLoader, environment } = require('./fixtures/verify-optional-apis.cjs');
        const { context } = environment([], backend);
        const wrapper = vm.runInContext('Object(' + constructor + '("12"))', context);
        vm.runInContext(
          mode === 'deleted'
            ? 'delete ' + constructor + '.prototype.valueOf'
            : constructor + '.prototype.valueOf = undefined',
          context
        );
        const unbox = moduleLoader(require('node:path').resolve(__dirname, '..'), context)('src/conversion/unbox.js');
        assert.equal(unbox(wrapper), wrapper);
        const ordinary = {};
        assert.equal(unbox(ordinary), ordinary);
      });
    }
  }
}
test('converters retain captured built-ins and payload methods after initialisation', async () => {
  const { moduleLoader, environment } = require('./fixtures/verify-optional-apis.cjs');
  const { context } = environment([]);
  const load = moduleLoader(require('node:path').resolve(__dirname, '..'), context);
  const box = load('src/conversion/box.js'),
    unbox = load('src/conversion/unbox.js');
  const regexp = load('src/conversion/toRegExp.js'),
    promise = load('src/conversion/toPromise.js');
  const input = vm.runInContext('Object(Symbol("held"))', context);
  const primitive = vm.runInContext('Symbol.prototype.valueOf', context).call(input);
  vm.runInContext(
    'Object = RegExp = function(){throw Error("replaced")}; Symbol.prototype.valueOf = function(){throw Error("replaced")}; Promise.resolve = function(){throw Error("replaced")}; Promise = undefined;',
    context
  );
  assert.equal(unbox(box(3)), 3);
  assert.equal(unbox(input), primitive);
  assert.equal(regexp('a', 'i').test('A'), true);
  assert.equal(await promise(4), 4);
});
