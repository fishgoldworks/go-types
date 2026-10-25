'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('..');
const sourceLoader = require('../scripts/source-test-loader.js');
const source = sourceLoader();
const fallback = {};
vm.runInNewContext(source, fallback);
const F = fallback.Types;
const constructors = {
  isBoolean: () => new Boolean(false),
  isNumber: () => new Number(NaN),
  isString: () => new String('x'),
  isDate: () => new Date(NaN),
  isMap: () => new Map([['x', null]]),
  isSet: () => new Set([null]),
  isWeakMap: () => new WeakMap(),
  isWeakSet: () => new WeakSet(),
  isRegExp: () => /x/g,
  isArrayBuffer: () => new ArrayBuffer(4),
  isSharedArrayBuffer: () => new SharedArrayBuffer(4),
  isDataView: () => new DataView(new ArrayBuffer(4))
};
const values = [
  undefined,
  null,
  false,
  true,
  0,
  -0,
  NaN,
  Infinity,
  1n,
  Symbol('x'),
  '',
  'x',
  {},
  Object.create(null),
  [],
  [null],
  () => {},
  Promise.resolve(1),
  /x/,
  new Date(),
  new Uint8Array(4),
  new Int32Array(0),
  Object(1n),
  Object(Symbol('x'))
];
for (const create of Object.values(constructors)) {
  for (const proto of [undefined, null, Object.prototype, { custom: true }]) {
    const value = create();
    if (proto !== undefined) Object.setPrototypeOf(value, proto);
    values.push(value, new Proxy(value, {}));
  }
  const original = create();
  values.push(Object.create(Object.getPrototypeOf(original)));
  const revocable = Proxy.revocable(original, {});
  revocable.revoke();
  values.push(revocable.proxy);
}
values.push(
  ...vm.runInNewContext(
    '[new String("x"), new Number(2), new Boolean(false), new Date(0), new Map(), new Set(), /x/, new WeakMap(), new WeakSet(), new ArrayBuffer(4), new SharedArrayBuffer(4), new DataView(new ArrayBuffer(4))]'
  )
);
const detached = new ArrayBuffer(4);
const detachedView = new DataView(detached);
structuredClone(detached, { transfer: [detached] });
values.push(detached, detachedView);
function observe(run) {
  try {
    return { value: run() };
  } catch (e) {
    return { error: e.name };
  }
}
for (const name of [
  ...Object.keys(constructors),
  'isArrayBufferView',
  'isTypedArray',
  'isFinite',
  'isInteger',
  'isNumeric',
  'isEmpty',
  'isBlank'
]) {
  test('native/fallback public result parity for ' + name, () => {
    for (let i = 0; i < values.length; i++) {
      assert.deepEqual(
        observe(() => T[name](values[i])),
        observe(() => F[name](values[i])),
        name + ' input ' + i
      );
    }
  });
}
for (const [name, create] of Object.entries(constructors)) {
  test(name + ' ignores replacement prototypes and hostile tag/coercion properties', () => {
    let reads = 0;
    const descriptors = {};
    for (const key of ['valueOf', 'constructor', 'toString', Symbol.toStringTag])
      descriptors[key] = {
        get() {
          reads++;
          throw new Error('not an identity signal');
        },
        configurable: true
      };
    const value = create();
    Object.setPrototypeOf(value, null);
    Object.defineProperties(value, descriptors);
    const imitation = Object.create(null);
    Object.defineProperties(imitation, descriptors);
    for (const api of [T, F]) {
      assert.equal(api[name](value), true);
      assert.equal(api[name](imitation), false);
      assert.equal(api[name](new Proxy(value, {})), false);
    }
    assert.equal(reads, 0);
  });
}
test('container precedence survives changed native prototypes and own length properties', () => {
  let reads = 0;
  for (const api of [T, F])
    for (const value of [new Map([['x', null]]), new Set([null]), new String(' ')]) {
      Object.setPrototypeOf(value, Object.prototype);
      if (!(value instanceof String)) {
        const length = Object.getOwnPropertyDescriptor(value, 'length');
        if (!length)
          Object.defineProperty(value, 'length', {
            get() {
              reads++;
              throw Error('do not read');
            }
          });
      }
      assert.equal(api.isEmpty(value), false);
      assert.equal(api.isBlank(value), true);
    }
  assert.equal(reads, 0);
});
test('boxed type names are rejected without inspecting descriptor-like getters', () => {
  for (const api of [T, F]) {
    const name = new String('number');
    Object.setPrototypeOf(name, null);
    Object.defineProperty(name, 'predicate', {
      get() {
        throw Error('not a descriptor');
      }
    });
    assert.throws(() => api.isArrayOf([1], name), { name: 'TypeError' });
    assert.throws(() => api.isArrayOf(['1'], name), { name: 'TypeError' });
  }
});
test('import works without process, with null process, or without optional getBuiltinModule', () => {
  for (const processValue of [null, {}, { getBuiltinModule: undefined }]) {
    const scope = { process: processValue };
    vm.runInNewContext(source, scope);
    assert.equal(scope.Types.isMap(new Map()), true);
    assert.equal(scope.Types.isMap({}), false);
    assert.equal(scope.Types.isEmpty({}), true);
  }
});
test(
  'native classifier references are captured before later reassignment',
  { skip: typeof process.getBuiltinModule !== 'function' },
  () => {
    const { spawnSync } = require('node:child_process');
    const result = spawnSync(
      process.execPath,
      [
        '-e',
        `
        const assert=require('node:assert/strict');
        const T=require(${JSON.stringify(require('node:path').join(__dirname, '..'))});
        const native=process.getBuiltinModule('node:util').types;
        const original={};
        const cases=[['isStringObject','isString',new String('x')],['isNumberObject','isNumber',new Number(1)],
          ['isBooleanObject','isBoolean',new Boolean(false)],['isMap','isMap',new Map()],['isSet','isSet',new Set()],
          ['isDate','isDate',new Date()],['isRegExp','isRegExp',/x/],['isDataView','isDataView',new DataView(new ArrayBuffer(4))]];
        try {
            for(const [name] of cases){original[name]=native[name];native[name]=()=>false;}
            for(const [,name,value] of cases){assert.equal(T[name](value),true);assert.equal(T[name]({}),false);}
            for (const name of ['isFinite','isInteger','isSafeInteger','isNumeric']) { assert.equal(T[name](new Number(1)),true); assert.equal(T[name]({}),false); }
        } finally {for(const [name,fn] of Object.entries(original))native[name]=fn;}
    `
      ],
      { encoding: 'utf8', timeout: 10000 }
    );
    assert.equal(result.status, 0, result.stderr);
  }
);
test('optional builtin resolver returning no util types falls back cleanly', () => {
  for (const util of [undefined, {}, { types: undefined }]) {
    const scope = {
      process: {
        getBuiltinModule() {
          return util;
        }
      }
    };
    vm.runInNewContext(source, scope);
    assert.equal(scope.Types.isNumber(new Number(1)), true);
    assert.equal(scope.Types.isNumber({}), false);
  }
});
test('optional SharedArrayBuffer feature absence agrees across native and fallback hosts', () => {
  const foreignValue = new SharedArrayBuffer(4);
  for (const processValue of [undefined, { getBuiltinModule: process.getBuiltinModule }]) {
    const scope = { SharedArrayBuffer: undefined, process: processValue };
    vm.runInNewContext(source, scope);
    assert.equal(scope.Types.isSharedArrayBuffer(foreignValue), false);
    assert.equal(scope.Types.isSharedArrayBuffer({}), false);
  }
});
test('real source imports retain intrinsic fallbacks without getBuiltinModule', () => {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync(
    process.execPath,
    [
      '-e',
      `
        const assert=require('node:assert/strict');
        const original=process.getBuiltinModule;
        process.getBuiltinModule=undefined;
        const T=require(${JSON.stringify(require('node:path').join(__dirname, '..'))});
        process.getBuiltinModule=original;
        const cases=[['isBoolean',new Boolean(false)],['isNumber',new Number(NaN)],['isString',new String('x')],
            ['isDate',new Date(NaN)],['isRegExp',/x/],['isMap',new Map()],['isSet',new Set()],
            ['isWeakMap',new WeakMap()],['isWeakSet',new WeakSet()],['isArrayBuffer',new ArrayBuffer(4)],
            ['isSharedArrayBuffer',new SharedArrayBuffer(4)],['isDataView',new DataView(new ArrayBuffer(4))]];
        for(const [name,value] of cases){
            assert.equal(T[name](value),true);assert.equal(T[name]({}),false);
            assert.equal(T[name](new Proxy(value,{})),false);
            Object.setPrototypeOf(value,null);assert.equal(T[name](value),true);
        }
        assert.equal(T.isEmpty({}),true);assert.equal(T.isBlank({x:null}),true);
        assert.equal(T.isArrayOf([1],T.isNumber),true);
    `
    ],
    { encoding: 'utf8', timeout: 10000 }
  );
  assert.equal(result.status, 0, result.stderr);
});
