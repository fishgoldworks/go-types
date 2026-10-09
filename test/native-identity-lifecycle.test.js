'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('..');
const sourceLoader = require('../scripts/source-test-loader');

// Use the same public contract in the current host and a separate realm without
// optional Node acceleration. Expected results are explicit, not backend-derived.
const portable = vm.createContext({});
vm.runInContext(sourceLoader(), portable);
const apis = [T, portable.Types];

function denyReads(value, keys, onRead) {
  for (const key of keys) {
    Object.defineProperty(value, key, {
      configurable: true,
      get() {
        onRead();
        throw new Error('Identity checks must not inspect this property');
      }
    });
  }
}

test('Date refinements follow timestamp mutations and TimeClip boundaries without reading overrides', () => {
  const value = vm.runInNewContext('new (class extends Date {})(0)');
  let reads = 0;
  denyReads(value, ['getTime', 'valueOf', 'toString', Symbol.toPrimitive], () => reads++);
  const states = [
    [0, true],
    [8640000000000000, true],
    [8640000000000001, false],
    [-8640000000000000, true],
    [-8640000000000001, false],
    [NaN, false],
    [1, true]
  ];
  for (const [timestamp, valid] of states) {
    Date.prototype.setTime.call(value, timestamp);
    const before = Date.prototype.getTime.call(value);
    for (const api of apis) {
      assert.equal(api.isDate(value), true);
      assert.equal(api.isValidDate(value), valid);
      assert.equal(api.isInvalidDate(value), !valid);
    }
    assert.equal(Date.prototype.getTime.call(value), before);
  }
  for (const api of apis) {
    assert.equal(api.isValidDate(Object.create(Date.prototype)), false);
    assert.equal(api.isInvalidDate(Object.create(Date.prototype)), false);
  }
  assert.equal(reads, 0);
});

test('RegExp identity neither coerces lastIndex nor follows match capability on frozen values', () => {
  let reads = 0;
  const cursor = {
    [Symbol.toPrimitive]() {
      reads++;
      throw Error('Do not coerce lastIndex');
    }
  };
  const value = vm.runInNewContext('/x/gy');
  value.lastIndex = cursor;
  denyReads(value, ['source', 'flags', 'exec', 'test', Symbol.match, Symbol.toStringTag], () => reads++);
  Object.freeze(value);
  const imitation = { [Symbol.match]: true };
  for (const api of apis) {
    assert.equal(api.isRegExp(value), true);
    assert.equal(api.isRegExp(imitation), false);
    assert.equal(api.isRegExp(RegExp.prototype), false);
    assert.equal(api.isRegExp(vm.runInContext('RegExp.prototype', portable)), false);
  }
  assert.equal(value.lastIndex, cursor);
  assert.equal(reads, 0);
});

for (const name of ['Map', 'Set', 'WeakMap', 'WeakSet']) {
  test(`${name} identity preserves entries even with frozen, inaccessible collection methods`, () => {
    const key = {};
    const Constructor = globalThis[name];
    const paired = name.endsWith('Map');
    const value = new Constructor(paired ? [[key, 42]] : [key]);
    const has = Constructor.prototype.has;
    const get = paired ? Constructor.prototype.get : undefined;
    let reads = 0;
    denyReads(value, ['has', 'get', 'size', 'entries', 'values', Symbol.iterator], () => reads++);
    Object.freeze(value);
    for (const api of apis) {
      assert.equal(api['is' + name](value), true);
      assert.equal(api['is' + name](Object.create(Constructor.prototype)), false);
    }
    assert.equal(has.call(value, key), true);
    if (paired) assert.equal(get.call(value, key), 42);
    assert.equal(reads, 0);
  });
}

test('native receiver predicates reject trapping and revoked proxies without touching their handlers', () => {
  const cases = [
    ['isDate', new Date(0)],
    ['isValidDate', new Date(0)],
    ['isInvalidDate', new Date(NaN)],
    ['isRegExp', /x/g],
    ['isMap', new Map()],
    ['isSet', new Set()],
    ['isWeakMap', new WeakMap()],
    ['isWeakSet', new WeakSet()],
    ['isArrayBuffer', new ArrayBuffer(8)],
    ['isSharedArrayBuffer', new SharedArrayBuffer(8)],
    ['isArrayBufferView', new Uint8Array(8)],
    ['isTypedArray', new Uint8Array(8)],
    ['isDataView', new DataView(new ArrayBuffer(8))]
  ];
  let traps = 0;
  const fail = () => {
    traps++;
    throw Error('Must not consult the proxy');
  };
  for (const [name, value] of cases) {
    const { proxy, revoke } = Proxy.revocable(value, {
      get: fail,
      has: fail,
      getPrototypeOf: fail,
      getOwnPropertyDescriptor: fail
    });
    for (const api of apis) {
      assert.equal(api[name](value), true, name + ' genuine control');
      assert.equal(api[name](proxy), false, name + ' live proxy');
    }
    revoke();
    for (const api of apis) assert.equal(api[name](proxy), false, name + ' revoked proxy');
  }
  assert.equal(traps, 0);
});

function checkViews(buffer, typed, data, shared) {
  for (const api of apis) {
    assert.equal(api.isArrayBuffer(buffer), !shared);
    assert.equal(api.isSharedArrayBuffer(buffer), shared);
    assert.equal(api.isArrayBufferView(buffer), false);
    for (const view of typed) {
      assert.equal(api.isTypedArray(view), true);
      assert.equal(api.isArrayBufferView(view), true);
      assert.equal(api.isDataView(view), false);
    }
    for (const view of data) {
      assert.equal(api.isDataView(view), true);
      assert.equal(api.isArrayBufferView(view), true);
      assert.equal(api.isTypedArray(view), false);
    }
  }
}

for (const foreign of [false, true]) {
  test(`binary identity survives shrink, regrowth and transfer (${foreign ? 'foreign' : 'local'} allocation)`, () => {
    const realm = foreign ? vm.runInNewContext('({ArrayBuffer, Uint8Array, DataView, TypeError})') : globalThis;
    const buffer = new realm.ArrayBuffer(8, { maxByteLength: 16 });
    const typed = [new realm.Uint8Array(buffer, 4, 4), new realm.Uint8Array(buffer, 4)];
    const data = [new realm.DataView(buffer, 4, 4), new realm.DataView(buffer, 4)];
    for (const length of [8, 2, 16, 0, 8]) {
      buffer.resize(length);
      checkViews(buffer, typed, data, false);
      assert.equal(buffer.byteLength, length, 'checks must not resize the buffer');
    }
    typed[0][0] = 73;
    checkViews(buffer, typed, data, false);
    assert.equal(typed[0][0], 73, 'checks must not write buffer contents');
    const transferred = structuredClone(buffer, { transfer: [buffer] });
    assert.equal(buffer.byteLength, 0);
    checkViews(buffer, typed, data, false);
    assert.equal(new Uint8Array(transferred)[4], 73);
    assert.throws(() => data[0].byteLength, realm.TypeError);
  });
}

test('growable shared buffers and fixed/tracking views retain identity without mutation', () => {
  const buffer = new SharedArrayBuffer(8, { maxByteLength: 16 });
  const typed = [new Uint8Array(buffer, 4, 4), new Uint8Array(buffer, 4)];
  const data = [new DataView(buffer, 4, 4), new DataView(buffer, 4)];
  typed[0][0] = 57;
  for (const length of [8, 12, 16]) {
    buffer.grow(length);
    checkViews(buffer, typed, data, true);
    assert.equal(buffer.byteLength, length);
    assert.equal(typed[0].length, 4);
    assert.equal(typed[1].length, length - 4);
    assert.equal(data[0].byteLength, 4);
    assert.equal(data[1].byteLength, length - 4);
    assert.equal(typed[0][0], 57);
  }
});

test('swapped view prototypes and misleading tags cannot exchange typed-array and DataView identity', () => {
  const buffer = new ArrayBuffer(8);
  const typed = new Uint8Array(buffer);
  const data = new DataView(buffer);
  Object.setPrototypeOf(typed, DataView.prototype);
  Object.setPrototypeOf(data, Uint8Array.prototype);
  Object.defineProperty(typed, Symbol.toStringTag, { value: 'DataView' });
  Object.defineProperty(data, Symbol.toStringTag, { value: 'Uint8Array' });
  checkViews(buffer, [typed], [data], false);
  structuredClone(buffer, { transfer: [buffer] });
  checkViews(buffer, [typed], [data], false);
});

test('genuine error recognition does not inspect application error payloads', () => {
  const value = new AggregateError([], 'aggregate', { cause: null });
  let reads = 0;
  // Replacing V8's lazy stack accessor can itself materialise the stack and
  // consult name/message. Remove it before installing the trapped properties.
  delete value.stack;
  denyReads(value, ['name', 'message', 'stack', 'cause', 'errors', 'toString'], () => reads++);
  Object.setPrototypeOf(value, null);
  for (const api of apis) {
    assert.equal(api.isError(value), true);
    assert.equal(api.isError(Object.create(Error.prototype)), false);
  }
  assert.equal(reads, 0);
});
