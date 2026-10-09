'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('../');
const pred = (predicate) => ({ predicate });
for (const invalid of [
  42,
  true,
  false,
  Symbol(),
  1n,
  'nubmer',
  '',
  'Number',
  'null',
  {},
  { predicate: 1 },
  { instanceOf: {} },
  { predicate: () => true, instanceOf: Object }
]) {
  for (const [name, run] of [
    ['direct', (m) => T.isTypeOf(1, m)],
    ['factory', (m) => T.createTypeChecker(m)],
    ['empty array', (m) => T.isArrayOf([], m)],
    ['non-array', (m) => T.isArrayOf(null, m)],
    ['empty arraylike', (m) => T.isArrayLikeOf('', m)],
    ['set', (m) => T.isSetOf(new Set(), m)],
    ['map key', (m) => T.isMapOf(new Map(), m, 'number')],
    ['map value', (m) => T.isMapOf(new Map(), 'number', m)]
  ])
    test('invalid matcher rejected before ' + name + ': ' + String(invalid), () =>
      assert.throws(() => run(invalid), TypeError)
    );
}
test('unreachable invalid alternatives are still rejected before callbacks run', () => {
  let calls = 0;
  assert.throws(
    () =>
      T.isTypeOf(1, [
        pred(() => {
          calls++;
          return true;
        }),
        42
      ]),
    TypeError
  );
  assert.equal(calls, 0);
});
test('cyclic unions fail deterministically rather than overflowing', () => {
  const a = [];
  a.push(a);
  assert.throws(() => T.createTypeChecker(a), TypeError);
  assert.throws(() => T.isTypeOf(1, ['number', a]), TypeError);
  const x = [],
    y = [x];
  x.push(y);
  assert.throws(() => T.createTypeChecker(x), TypeError);
});
test('deep valid unions do not overflow', () => {
  let type = 'number';
  for (let i = 0; i < 20000; i++) type = [type];
  const check = T.createTypeChecker(type);
  assert.equal(check(1), true);
  assert.equal(check('1'), false);
});
test('shared acyclic unions remain valid and ordered', () => {
  const leaf = ['number'];
  assert.equal(T.isTypeOf(1, [leaf, leaf]), true);
  assert.equal(T.isTypeOf('x', [leaf, leaf]), false);
});
test('checker snapshots union structure and descriptors but not callback closure state', () => {
  let answer = true;
  const p = pred(() => answer),
    nested = ['number'],
    union = [nested, p];
  const check = T.createTypeChecker(union);
  nested[0] = 'string';
  union.length = 0;
  p.predicate = () => false;
  assert.equal(check(1), true);
  assert.equal(check('x'), true);
  answer = false;
  assert.equal(check('x'), false);
});
test('compilation does not call predicates, constructors, or custom instance hooks', () => {
  let calls = 0;
  function Constructor() {
    calls++;
  }
  Object.defineProperty(Constructor, Symbol.hasInstance, {
    value(v) {
      calls++;
      return v === 7;
    }
  });
  const check = T.createTypeChecker([
    pred(() => {
      calls++;
      return false;
    }),
    Constructor
  ]);
  assert.equal(calls, 0);
  assert.equal(check(7), true);
  assert.equal(calls, 2);
});
test('empty unions match nothing while empty collection element constraints are vacuously true', () => {
  assert.equal(T.createTypeChecker([])(undefined), false);
  assert.equal(T.isArrayOf([], []), true);
  assert.equal(T.isArrayOf([1], []), false);
  assert.equal(T.isSetOf(new Set(), []), true);
  assert.equal(T.isSetOf(new Set([1]), []), false);
});
test('union alternatives short-circuit during evaluation, not validation', () => {
  let calls = 0;
  const check = T.createTypeChecker([
    'number',
    pred(() => {
      calls++;
      return true;
    })
  ]);
  assert.equal(check(1), true);
  assert.equal(calls, 0);
  assert.equal(check('x'), true);
  assert.equal(calls, 1);
});
test('matcher accessors and inherited selector properties are rejected without execution', () => {
  let calls = 0;
  const x = {
    get predicate() {
      calls++;
      return () => true;
    }
  };
  assert.throws(() => T.createTypeChecker(x), TypeError);
  assert.equal(calls, 0);
  assert.throws(() => T.createTypeChecker(Object.create({ predicate: () => true })), TypeError);
  const a = [];
  Object.defineProperty(a, 0, {
    get() {
      calls++;
      return 'number';
    }
  });
  assert.throws(() => T.createTypeChecker(a), TypeError);
  assert.equal(calls, 0);
});
test('foreign nested arrays and boxed type names compile', () => {
  const type = vm.runInNewContext('[new String("number"), [null]]');
  assert.equal(T.createTypeChecker(type)(1), true);
  assert.equal(T.createTypeChecker(type)(null), true);
});
test('sparse matcher union slots mean undefined, never inherited configuration', () => {
  const union = new Array(1);
  const proto = [];
  proto[0] = 'number';
  Object.setPrototypeOf(union, proto);
  const check = T.createTypeChecker(union);
  assert.equal(check(undefined), true);
  assert.equal(check(1), false);
});
test('instance prototype errors occur on evaluation, without a constructibility preflight', () => {
  function Wrong() {}
  Wrong.prototype = null;
  const check = T.createTypeChecker(Wrong);
  assert.equal(check(1), false);
  assert.throws(() => check({}), TypeError);
  assert.equal(T.isArrayOf([], Wrong), true);
});
test('bound constructors and generator function instance matchers preserve native meaning', () => {
  class A {}
  const Bound = A.bind(null);
  assert.equal(T.isTypeOf(new A(), Bound), true);
  function* G() {}
  assert.equal(T.isTypeOf(G(), G), true);
});
test('valid typeof names retain exact semantics including null and classes', () => {
  for (const v of [null, undefined, 1, 'x', false, 1n, Symbol(), function () {}, class A {}, {}]) {
    assert.equal(T.isTypeOf(v, typeof v), true);
  }
});
for (const result of [undefined, null, 0, 1, '', 'yes', {}, [], Promise.resolve(true)]) {
  test('predicate must return primitive boolean: ' + String(result), () =>
    assert.throws(
      () =>
        T.isTypeOf(
          1,
          pred(() => result)
        ),
      TypeError
    )
  );
}
test('predicates run without an accidental receiver and errors propagate unchanged', () => {
  let receiver = 'unset';
  assert.equal(
    T.isTypeOf(
      1,
      pred(function () {
        receiver = this;
        return true;
      })
    ),
    true
  );
  assert.equal(receiver, undefined);
  const error = Error('sentinel');
  assert.throws(
    () =>
      T.createTypeChecker(
        pred(() => {
          throw error;
        })
      )(1),
    (e) => e === error
  );
});
for (const [name, build, check] of [
  ['Set', (items) => new Set(items), (v, m) => T.isSetOf(v, m)],
  ['Array', (items) => items, (v, m) => T.isArrayOf(v, m)]
]) {
  test(name + ' Of empty, valid, invalid and mixed values', () => {
    assert.equal(check(build([]), 'number'), true);
    assert.equal(check(build([1, 2]), 'number'), true);
    assert.equal(check(build([1, 'x']), 'number'), false);
    assert.equal(check(build([null, 1]), ['number', null]), true);
  });
}
test('Map Of validates keys and values independently', () => {
  assert.equal(T.isMapOf(new Map(), 'string', 'number'), true);
  assert.equal(T.isMapOf(new Map([['x', 1]]), 'string', 'number'), true);
  assert.equal(T.isMapOf(new Map([[1, 1]]), 'string', 'number'), false);
  assert.equal(T.isMapOf(new Map([['x', '1']]), 'string', 'number'), false);
  assert.equal(T.isMapOf({}, 'string', 'number'), false);
});
test('Map/Set Of accept foreign collections and ignore overridden iteration', () => {
  assert.equal(T.isSetOf(vm.runInNewContext('new Set([1,2])'), 'number'), true);
  assert.equal(T.isMapOf(vm.runInNewContext('new Map([["a",1]])'), 'string', 'number'), true);
  const m = new Map([['a', 1]]),
    s = new Set([1]);
  for (const x of [m, s])
    x[Symbol.iterator] = () => {
      throw Error('must not run');
    };
  assert.equal(T.isMapOf(m, 'string', 'number'), true);
  assert.equal(T.isSetOf(s, 'number'), true);
});
test('Map/Set Of reject prototype and proxy imitations without running predicates', () => {
  let calls = 0;
  const p = pred(() => {
    calls++;
    return true;
  });
  for (const m of [{}, Object.create(Map.prototype), new Proxy(new Map(), {})]) assert.equal(T.isMapOf(m, p, p), false);
  for (const s of [{}, Object.create(Set.prototype), new Proxy(new Set(), {})]) assert.equal(T.isSetOf(s, p), false);
  assert.equal(calls, 0);
});
