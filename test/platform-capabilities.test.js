'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Change host capabilities before importing the real public modules. Separate
// processes keep globals and module caches isolated and retain source coverage.
function inHost(body, ...args) {
  const result = spawnSync(
    process.execPath,
    [
      '-e',
      `
        const assert = require('node:assert/strict');
        (${body.toString()})(...${JSON.stringify(args)});
    `
    ],
    { cwd: path.resolve(__dirname, '..'), encoding: 'utf8', timeout: 10000 }
  );
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stdout + result.stderr);
}

test('Error checks capture an available native classifier before later reassignment', () => {
  inHost(() => {
    // Node's genuine native classifier exercises this capability even on
    // supported runtimes that do not yet expose Error.isError itself.
    Error.isError = require('node:util').types.isNativeError;
    const isError = require('./src/isError');
    Error.isError = () => false;
    const tagged = new Error('native brand');
    tagged[Symbol.toStringTag] = 'CustomError';
    for (const value of [
      new Error(),
      new TypeError(),
      tagged,
      require('node:vm').runInNewContext('new Error("foreign")')
    ]) {
      assert.equal(isError(value), true);
    }
    for (const value of [null, {}, Object.create(Error.prototype), { [Symbol.toStringTag]: 'Error' }]) {
      assert.equal(isError(value), false);
    }
  });
});

test('Error fallback recognises genuine errors and rejects imitations across realms', () => {
  inHost(() => {
    const nativeIsError = Error.isError;
    Error.isError = undefined;
    const isError = require('./src/isError');
    Error.isError = nativeIsError;
    class CustomError extends Error {}
    const detachedPrototype = new Error('no prototype');
    Object.setPrototypeOf(detachedPrototype, null);
    for (const value of [
      new Error('local'),
      new TypeError('typed'),
      new CustomError(),
      detachedPrototype,
      require('node:vm').runInNewContext('new Error("foreign")')
    ]) {
      assert.equal(isError(value), true);
    }
    for (const value of [
      undefined,
      null,
      false,
      0,
      NaN,
      1n,
      'error',
      Symbol('error'),
      () => {},
      [],
      {},
      Object.create(Error.prototype),
      { name: 'Error', message: 'x' }
    ]) {
      assert.equal(isError(value), false);
    }
    // Restoring the host feature must not change the backend already captured.
    const taggedError = new Error('custom tag');
    taggedError[Symbol.toStringTag] = 'CustomError';
    assert.equal(isError(taggedError), false);
  });
});

test('Error fallback refuses own and inherited tags without invoking their getters', () => {
  inHost(() => {
    Error.isError = undefined;
    const isError = require('./src/isError');
    let reads = 0;
    const tagged = Object.defineProperty({}, Symbol.toStringTag, {
      get() {
        reads++;
        throw new Error('tag getter must not run');
      }
    });
    for (const value of [tagged, Object.create(tagged), { [Symbol.toStringTag]: 'Error' }]) {
      assert.equal(isError(value), false);
    }
    assert.equal(reads, 0);
    const failure = new Error('application proxy trap');
    assert.throws(
      () =>
        isError(
          new Proxy(
            {},
            {
              has() {
                throw failure;
              }
            }
          )
        ),
      (error) => error === failure
    );
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    assert.throws(() => isError(revoked.proxy), TypeError);
  });
});

test('Error fallback retains its captured string intrinsic after reassignment', () => {
  inHost(() => {
    Error.isError = undefined;
    const isError = require('./src/isError');
    const original = Object.prototype.toString;
    let genuine, imitation;
    try {
      Object.prototype.toString = () => '[object Error]';
      genuine = isError(new Error('real'));
      imitation = isError({});
    } finally {
      Object.prototype.toString = original;
    }
    assert.equal(genuine, true);
    assert.equal(imitation, false);
  });
});

for (const [name, constructorName] of [
  ['isNode', 'Node'],
  ['isElement', 'Element'],
  ['isFragment', 'DocumentFragment']
]) {
  test(`${name} follows the currently available local constructor and propagates instance-hook errors`, () => {
    inHost(
      (name, constructorName) => {
        // These are constructor-contract checks; real DOM objects are tested
        // separately by test:browser against the distributed bundles.
        class Local {}
        class Child extends Local {}
        globalThis[constructorName] = Local;
        const check = require('./src/' + name);
        assert.equal(check(new Local()), true);
        assert.equal(check(new Child()), true);
        for (const value of [
          null,
          {},
          { nodeType: 1 },
          () => {},
          require('node:vm').runInNewContext('new (class Local {})()')
        ]) {
          assert.equal(check(value), false);
        }
        const previous = new Local();
        globalThis[constructorName] = class Replacement {};
        assert.equal(check(previous), false);
        assert.equal(check(new globalThis[constructorName]()), true);
        const failure = new Error('custom instance hook');
        Object.defineProperty(globalThis[constructorName], Symbol.hasInstance, {
          value() {
            throw failure;
          }
        });
        assert.throws(
          () => check({}),
          (error) => error === failure
        );
        globalThis[constructorName] = undefined;
        assert.equal(check(previous), false);
        globalThis[constructorName] = {};
        assert.equal(check(previous), false);
      },
      name,
      constructorName
    );
  });
}

for (const [name, constructorName] of [
  ['isMap', 'Map'],
  ['isSet', 'Set'],
  ['isWeakMap', 'WeakMap'],
  ['isWeakSet', 'WeakSet'],
  ['isSharedArrayBuffer', 'SharedArrayBuffer']
]) {
  test(`${name} focused import rejects values when its constructor and native backend are absent`, () => {
    inHost(
      (name, constructorName) => {
        const Constructor = globalThis[constructorName];
        const genuine = constructorName === 'SharedArrayBuffer' ? new Constructor(4) : new Constructor();
        globalThis[constructorName] = undefined;
        process.getBuiltinModule = undefined;
        const check = require('./src/' + name);
        for (const value of [genuine, {}, Object.create(null), null, undefined, () => {}]) {
          assert.equal(check(value), false);
        }
      },
      name,
      constructorName
    );
  });
}

test('Error fallback declines foreign tagged objects when the local tag key is unavailable', () => {
  inHost(() => {
    const foreign = require('node:vm').runInNewContext(`({
      spoof: { [Symbol.toStringTag]: 'Error' },
      getter: Object.defineProperty({}, Symbol.toStringTag, {
        get() { throw Error('Foreign tag getter must not run'); }
      }),
      error: new Error('foreign')
    })`);
    Error.isError = undefined;
    globalThis.Symbol = undefined;
    const isError = require('./src/isError');
    assert.equal(isError(foreign.spoof), false);
    assert.equal(isError(foreign.getter), false);
    assert.equal(isError(foreign.error), false);
    assert.equal(isError({}), false);
  });
});
