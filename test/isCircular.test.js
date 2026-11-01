'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const T = require('..');
const { moduleLoader } = require('./fixtures/verify-optional-apis.cjs');

for (const [name, build] of [
  [
    'Map key',
    () => {
      const value = new Map();
      value.set(value, 1);
      return value;
    }
  ],
  [
    'Map value',
    () => {
      const value = new Map();
      value.set('self', value);
      return value;
    }
  ],
  [
    'Set member',
    () => {
      const value = new Set();
      value.add(value);
      return value;
    }
  ],
  [
    'object through Map key',
    () => {
      const value = {};
      value.map = new Map([[value, 1]]);
      return value;
    }
  ],
  [
    'object through Map value',
    () => {
      const value = {};
      value.map = new Map([['self', value]]);
      return value;
    }
  ],
  [
    'object through Set',
    () => {
      const value = {};
      value.set = new Set([value]);
      return value;
    }
  ],
  [
    'mixed non-root cycle',
    () => {
      const map = new Map(),
        set = new Set(),
        child = { map };
      map.set('child', set);
      set.add(child);
      return { map };
    }
  ]
]) {
  test('isCircular follows ' + name, () => assert.equal(T.isCircular(build()), true));
}

test('isCircular allows shared keys, values and members across different collections', () => {
  let reads = 0;
  const shared = {
    get leaf() {
      reads++;
      return 1;
    }
  };
  const root = {
    map: new Map([
      [shared, shared],
      ['again', shared]
    ]),
    set: new Set([shared]),
    shared
  };
  assert.equal(T.isCircular(root), false);
  assert.equal(reads, 1);
  assert.equal(T.isCircular(root), false);
  assert.equal(reads, 2);
});

for (const Constructor of [Map, Set]) {
  test('isCircular preserves ordinary property rules on ' + Constructor.name, () => {
    const value = new Constructor();
    value[Symbol('hidden')] = value;
    Object.defineProperty(value, 'hidden', { value });
    assert.equal(T.isCircular(value), false);
    Object.defineProperty(value, 'loop', { value, configurable: true, enumerable: true });
    assert.equal(T.isCircular(value), true);
    Object.defineProperty(value, 'loop', { enumerable: false });
    assert.equal(T.isCircular(value), false);
    const prototype = Object.create(Object.getPrototypeOf(value), { inherited: { value, enumerable: true } });
    Object.setPrototypeOf(value, prototype);
    assert.equal(T.isCircular(value), true);
    Object.defineProperty(value, 'inherited', { value, enumerable: false });
    assert.equal(T.isCircular(value), false);
  });

  test('isCircular ignores overridden native content methods and iterators on ' + Constructor.name, () => {
    const value = new Constructor();
    if (Constructor === Map) Map.prototype.set.call(value, 'self', value);
    else Set.prototype.add.call(value, value);
    const fail = () => {
      throw new Error('Application iteration must not run');
    };
    for (const key of [Symbol.iterator, Symbol.toStringTag, 'forEach', 'entries', 'values', 'size']) {
      Object.defineProperty(value, key, { get: fail });
    }
    assert.equal(T.isCircular(value), true);
  });

  test('isCircular visits ' + Constructor.name + ' ordinary properties before stored references', () => {
    const failure = { reason: 'do not inspect later contents' };
    const child = {
      get edge() {
        throw failure;
      }
    };
    const value = Constructor === Map ? new Map([['child', child]]) : new Set([child]);
    value.self = value;
    assert.equal(T.isCircular(value), true);
    delete value.self;
    assert.throws(
      () => T.isCircular(value),
      (error) => error === failure
    );
    assert.equal(T.isCircular({}), false);
  });

  test('isCircular propagates an earlier property error before a ' + Constructor.name + ' content cycle', () => {
    const failure = new Error('ordinary property');
    const value = new Constructor();
    if (Constructor === Map) value.set(value, value);
    else value.add(value);
    Object.defineProperty(value, 'first', {
      enumerable: true,
      get() {
        throw failure;
      }
    });
    assert.throws(
      () => T.isCircular(value),
      (error) => error === failure
    );
  });
}

for (const [name, build] of [
  ['key', (child) => new Map([[child, 1]])],
  ['value', (child) => new Map([['child', child]])],
  ['member', (child) => new Set([child])]
]) {
  test('isCircular propagates ' + name + ' getter errors and recovers after failure', () => {
    const failure = new Error(name);
    let broken = true;
    const child = {
      get leaf() {
        if (broken) throw failure;
        return null;
      }
    };
    const value = build(child);
    assert.throws(
      () => T.isCircular(value),
      (error) => error === failure
    );
    broken = false;
    assert.equal(T.isCircular(value), false);
  });
}

test('isCircular traverses Map keys before values without visiting synthetic entry arrays', () => {
  const trace = [];
  const key = {
    get edge() {
      trace.push('key');
      return 0;
    }
  };
  const value = {
    get edge() {
      trace.push('value');
      return 0;
    }
  };
  assert.equal(T.isCircular(new Map([[key, value]])), false);
  assert.deepEqual(trace, ['key', 'value']);
});

test('isCircular keeps nested checks independent while reading collection contents', () => {
  let nested = false;
  let expectedNested = false;
  const root = new Map();
  const child = {
    get edge() {
      if (!nested) {
        nested = true;
        try {
          assert.equal(T.isCircular(root), expectedNested);
        } finally {
          nested = false;
        }
      }
      return 0;
    }
  };
  root.set('child', child);
  assert.equal(T.isCircular(root), false);
  child.back = root;
  expectedNested = true;
  assert.equal(T.isCircular(root), true);
  delete child.back;
  expectedNested = false;
  assert.equal(T.isCircular(root), false);
});

test('isCircular supports foreign and subclassed native collections', () => {
  for (const expression of [
    '(() => { const m = new Map(); m.set(m, 1); return m; })()',
    '(() => { const s = new Set(); s.add(s); return s; })()',
    '(() => { class M extends Map {} const m = new M(); m.set(1, m); return m; })()',
    '(() => { class S extends Set {} const s = new S(); s.add(s); return s; })()'
  ]) {
    const value = vm.runInNewContext(expression);
    Object.freeze(value);
    assert.equal(T.isCircular(value), true);
  }
});

test('isCircular does not brand prototype imitations, proxies or custom tags as native contents', () => {
  for (const Constructor of [Map, Set]) {
    const input = new Constructor();
    if (Constructor === Map) input.set(input, input);
    else input.add(input);
    for (const value of [
      Object.create(Constructor.prototype),
      new Proxy(input, {}),
      { [Symbol.toStringTag]: Constructor.name }
    ]) {
      assert.equal(T.isCircular(value), false);
      value.edge = value;
      assert.equal(T.isCircular(value), true);
    }
  }
});

test('isCircular never consumes arbitrary iterable or weak-collection entries', () => {
  let calls = 0;
  const iterable = {
    [Symbol.iterator]() {
      calls++;
      throw Error('not a content edge');
    }
  };
  const weakMap = new WeakMap(),
    weakSet = new WeakSet();
  weakMap.set(weakMap, weakMap);
  weakSet.add(weakSet);
  for (const value of [iterable, weakMap, weakSet]) {
    assert.equal(T.isCircular(value), false);
    value.edge = value;
    assert.equal(T.isCircular(value), true);
  }
  assert.equal(calls, 0);
});

test('isCircular uses captured native collection operations after later reassignment', () => {
  const context = vm.createContext({});
  vm.runInContext(
    'globalThis.held = new Map(); held.set(held, held); globalThis.heldSet = new Set(); heldSet.add(heldSet);',
    context
  );
  const check = moduleLoader(path.resolve(__dirname, '..'), context)('src/isCircular.js');
  vm.runInContext(
    'Map.prototype.forEach = Set.prototype.forEach = function () { throw Error("replacement"); };',
    context
  );
  assert.equal(check(context.held), true);
  assert.equal(check(context.heldSet), true);
});

test('isCircular handles deep mixed collection graphs without recursive traversal', () => {
  const root = {};
  let tail = root;
  for (let index = 0; index < 10000; index++) {
    const next = index % 2 ? new Set() : new Map();
    if (tail instanceof Map) tail.set('next', next);
    else if (tail instanceof Set) tail.add(next);
    else tail.next = next;
    tail = next;
  }
  assert.equal(T.isCircular(root), false);
  tail.add(root);
  assert.equal(T.isCircular(root), true);
});

for (const [family, missing, result] of [
  ['Map', ['Map.prototype.has', 'Map.prototype.size'], true],
  ['Map', ['Map.prototype.has', 'Map.prototype.size', 'Map.prototype.entries'], true],
  ['Set', ['Set.prototype.has', 'Set.prototype.size'], true],
  ['Set', ['Set.prototype.has', 'Set.prototype.size', 'Set.prototype.values'], true],
  ['Map', ['Map.prototype.forEach'], 'unsupported'],
  ['Set', ['Set.prototype.forEach'], 'unsupported'],
  ['Map', ['Map'], false],
  ['Set', ['Set'], false]
]) {
  test('isCircular handles foreign ' + family + ' with missing local ' + missing.join(', '), () => {
    const { environment } = require('./fixtures/verify-optional-apis.cjs');
    const { context } = environment(missing);
    const check = moduleLoader(path.resolve(__dirname, '..'), context)('src/isCircular.js');
    const value = family === 'Map' ? new Map() : new Set();
    if (family === 'Map') value.set(value, 0);
    else value.add(value);
    if (result === 'unsupported') {
      assert.throws(
        () => check(value),
        (error) =>
          error.name === 'TypeError' &&
          error.message === 'Native ' + family + ' traversal is unavailable in this runtime.'
      );
    } else {
      assert.equal(check(value), result);
      value.ordinary = value;
      assert.equal(check(value), true, 'ordinary properties still establish cycles');
    }
  });
}
