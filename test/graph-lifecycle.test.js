'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('../index.js');

// This oracle uses reachable-vertex indegrees, not the library's depth-first
// active-path algorithm. It reads only the separately specified adjacency list.
function hasReachableCycle(edges, start) {
  const reached = new Set([start]);
  const pending = [start];
  for (let index = 0; index < pending.length; index++) {
    for (const child of edges[pending[index]]) {
      if (!reached.has(child)) {
        reached.add(child);
        pending.push(child);
      }
    }
  }
  const indegrees = edges.map(() => 0);
  for (const parent of reached) for (const child of edges[parent]) indegrees[child]++;
  const ready = [...reached].filter((index) => indegrees[index] === 0);
  for (let index = 0; index < ready.length; index++) {
    for (const child of edges[ready[index]]) if (--indegrees[child] === 0) ready.push(child);
  }
  return ready.length !== reached.size;
}

function buildGraph(edges, inherited, reverse) {
  // Functions and null-prototype objects are vertices too; no conversion occurs.
  const nodes = [Object.create(null), function vertex() {}, []];
  for (let parent = 0; parent < nodes.length; parent++) {
    const node = nodes[parent];
    const proto = Object.create(null);
    if (inherited) Object.setPrototypeOf(node, proto);
    const indices = reverse ? [2, 1, 0] : [0, 1, 2];
    for (const child of indices) {
      const key = 'edge' + child;
      const visible = edges[parent].includes(child);
      if (inherited) {
        proto[key] = nodes[child];
        // A hidden own property shadows even an enumerable inherited edge.
        if (!visible) Object.defineProperty(node, key, { value: nodes[child], enumerable: false });
        else if ((parent + child) % 2 === 0) node[key] = nodes[child];
      } else if (visible) node[key] = nodes[child];
    }
    Object.defineProperty(node, 'hidden', { value: node, enumerable: false });
    node[Symbol('hidden')] = node;
    node.scalar = parent;
  }
  return nodes;
}

test('cycle detection agrees with a reachable topological oracle across property layouts', () => {
  assert.equal(hasReachableCycle([[1], [], [2]], 0), false, 'unreachable cycles do not count');
  assert.equal(hasReachableCycle([[1], [2], [1]], 0), true, 'a reachable non-root cycle counts');
  assert.equal(hasReachableCycle([[1, 2], [2], []], 0), false, 'shared acyclic descendants do not count');
  let comparisons = 0;
  for (let mask = 0; mask < 512; mask++) {
    const edges = [[], [], []];
    for (let parent = 0; parent < 3; parent++) {
      for (let child = 0; child < 3; child++) if (mask & (1 << (parent * 3 + child))) edges[parent].push(child);
    }
    for (const inherited of [false, true]) {
      for (const reverse of [false, true]) {
        const nodes = buildGraph(edges, inherited, reverse);
        for (let start = 0; start < 3; start++) {
          assert.equal(
            T.isCyclic(nodes[start]),
            hasReachableCycle(edges, start),
            JSON.stringify({ mask, inherited, reverse, start })
          );
          comparisons++;
        }
      }
    }
  }
  assert.equal(comparisons, 6144);
});

test('inherited edge getters use the original receiver and hidden shadows are not evaluated', () => {
  const receivers = [];
  const proto = Object.create(null, {
    edge: {
      enumerable: true,
      get() {
        receivers.push(this);
        return this.destination;
      }
    }
  });
  const cycle = Object.create(proto);
  Object.defineProperty(cycle, 'destination', { value: cycle });
  assert.equal(T.isCyclic(cycle), true);
  assert.deepEqual(receivers, [cycle]);

  const acyclic = Object.create(proto);
  Object.defineProperty(acyclic, 'destination', { value: 0 });
  assert.equal(T.isCyclic(acyclic), false);
  assert.deepEqual(receivers, [cycle, acyclic]);

  const masked = Object.create(proto, {
    edge: {
      get() {
        throw new Error('hidden edge must not be read');
      }
    },
    destination: { value: cycle }
  });
  assert.equal(T.isCyclic(masked), false);
  assert.deepEqual(receivers, [cycle, acyclic]);
});

test('collection membership is excluded but enumerable string expandos remain graph edges', () => {
  const map = new Map();
  const set = new Set();
  const weakMap = new WeakMap();
  const weakSet = new WeakSet();
  map.set(map, map);
  set.add(set);
  weakMap.set(weakMap, weakMap);
  weakSet.add(weakSet);
  for (const value of [map, set, weakMap, weakSet]) {
    assert.equal(T.isCyclic(value), false);
    Object.defineProperty(value, '__proto__', { value, configurable: true, enumerable: true });
    assert.equal(T.isCyclic(value), true, 'special property names are still edges');
    Object.defineProperty(value, '__proto__', { enumerable: false });
    assert.equal(T.isCyclic(value), false);
  }
});

test('completed descendants are read once per traversal, not cached between calls', () => {
  let destination;
  let reads = 0;
  const leaf = Object.freeze({
    get edge() {
      reads++;
      return destination;
    }
  });
  const root = Object.freeze({ a: leaf, b: leaf, branch: Object.freeze({ leaf }) });
  for (const [next, expected] of [
    [undefined, false],
    [root, true],
    [undefined, false]
  ]) {
    destination = next; // Only changes between checks: each traversed graph is stable.
    reads = 0;
    assert.equal(T.isCyclic(root), expected);
    assert.equal(reads, 1);
  }
});

test('a confirmed cycle short-circuits later value reads but earlier getter failures propagate', () => {
  const error = { reason: 'edge access failed' };
  const loopFirst = {};
  loopFirst.loop = loopFirst;
  Object.defineProperty(loopFirst, 'later', {
    enumerable: true,
    get() {
      throw error;
    }
  });
  assert.equal(T.isCyclic(loopFirst), true);

  const errorFirst = {};
  let broken = true;
  Object.defineProperty(errorFirst, 'first', {
    enumerable: true,
    get() {
      if (broken) throw error;
      return null;
    }
  });
  errorFirst.loop = errorFirst;
  assert.throws(
    () => T.isCyclic(errorFirst),
    (caught) => caught === error
  );
  broken = false;
  assert.equal(T.isCyclic(errorFirst), true);
  delete errorFirst.loop;
  assert.equal(T.isCyclic(errorFirst), false, 'abrupt exits do not retain traversal state');
});

test('enumeration and read failures propagate without poisoning later checks of the same proxy', () => {
  for (const method of ['ownKeys', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'get']) {
    const error = { method };
    const target = Object.assign(Object.create(null), { edge: 1 });
    let broken = true;
    const value = new Proxy(target, {
      [method](...args) {
        if (broken) throw error;
        return Reflect[method](...args);
      }
    });
    assert.throws(
      () => T.isCyclic(value),
      (caught) => caught === error,
      method
    );
    broken = false;
    assert.equal(T.isCyclic(value), false, method);
    target.edge = value;
    assert.equal(T.isCyclic(value), true, method);
    target.edge = undefined;
    assert.equal(T.isCyclic(value), false, method);
  }
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  assert.throws(() => T.isCyclic(revoked.proxy), TypeError);
});

test('reentrant checks and caught inner errors keep the outer traversal independent', () => {
  const innerError = new Error('inner getter');
  const broken = {
    get edge() {
      throw innerError;
    }
  };
  let checkingInner = false;
  let reads = 0;
  const shared = {
    get edge() {
      reads++;
      if (!checkingInner) {
        checkingInner = true;
        try {
          assert.equal(T.isCyclic(root), false);
          assert.throws(
            () => T.isCyclic(broken),
            (caught) => caught === innerError
          );
        } finally {
          checkingInner = false;
        }
      }
      return 0;
    }
  };
  const root = Object.freeze({ left: shared, right: shared });
  assert.equal(T.isCyclic(root), false);
  assert.equal(reads, 2);
  assert.equal(T.isCyclic(root), false);
  assert.equal(reads, 4);
});

test('different proxies over the same target remain distinct graph vertices', () => {
  const target = Object.create(null);
  let backEdge = false;
  const first = new Proxy(target, {
    ownKeys: () => ['edge'],
    getOwnPropertyDescriptor: () => ({ configurable: true, enumerable: true }),
    get: () => second
  });
  const second = new Proxy(target, {
    ownKeys: () => (backEdge ? ['edge'] : []),
    getOwnPropertyDescriptor: () => ({ configurable: true, enumerable: true }),
    get: () => first
  });
  assert.equal(T.isCyclic(first), false);
  backEdge = true;
  assert.equal(T.isCyclic(first), true);
  backEdge = false;
  assert.equal(T.isCyclic(first), false);
});

test('cross-realm frozen graphs are inspected without marking or coercing their objects', () => {
  const foreign = vm.runInNewContext(`(() => {
    const leaf = Object.create(null);
    const root = { left: leaf, right: leaf };
    return { root, leaf };
  })()`);
  const failure = () => {
    throw new Error('inspection must not mark or coerce input');
  };
  const guarded = new Proxy(foreign.root, {
    set: failure,
    defineProperty: failure,
    deleteProperty: failure,
    setPrototypeOf: failure,
    preventExtensions: failure
  });
  Object.defineProperty(foreign.leaf, Symbol.toPrimitive, { value: failure });
  Object.freeze(foreign.leaf);
  Object.freeze(foreign.root);
  assert.equal(T.isCyclic(guarded), false);

  const cycle = vm.runInNewContext('(() => { const x = {}; x.edge = x; return Object.freeze(x); })()');
  assert.equal(T.isCyclic(cycle), true);
  const primitive = Symbol('not a graph');
  assert.equal(T.isCyclic(primitive), false);
});

test('hidden own data and getter shadows remain excluded on dictionary objects', () => {
  for (const nullPrototype of [true, false]) {
    for (const accessor of [false, true]) {
      const value = nullPrototype ? Object.create(null) : { temporary: 1 };
      delete value.temporary;
      Object.setPrototypeOf(value, { edge: value });
      assert.equal(T.isCyclic(value), true, 'visible inherited edge');
      let reads = 0;
      const descriptor = accessor
        ? {
            get() {
              reads++;
              return value;
            }
          }
        : { value };
      Object.defineProperty(value, 'edge', { ...descriptor, configurable: true, enumerable: false });
      assert.equal(T.isCyclic(value), false, 'hidden own edge shadows inherited edge');
      assert.equal(reads, 0);
      Object.defineProperty(value, 'edge', { enumerable: true });
      assert.equal(T.isCyclic(value), true, 'visible own edge');
      assert.equal(reads, accessor ? 1 : 0);
    }
  }
});
