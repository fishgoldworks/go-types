'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const T = require('..');
const sourceLoader = require('../scripts/source-test-loader');

const methods = [
  ['isIterable', Symbol.iterator],
  ['isAsyncIterable', Symbol.asyncIterator],
  ['isIteratorLike', 'next'],
  ['isPromiseLike', 'then']
];

for (const [name, key] of methods) {
  test(`${name} reads only its public method properties and never calls the result`, () => {
    const trace = [];
    const callable = new Proxy(function () {}, {
      apply() {
        assert.fail('Capability detection must not invoke the method');
      },
      get() {
        assert.fail('Capability detection must not inspect the method itself');
      }
    });
    const input = new Proxy(Object.create(null), {
      get(target, property) {
        trace.push(property);
        if (property === key) return callable;
        assert.fail('Unexpected property read');
      },
      has() {
        assert.fail('Capability detection must use the actual property value');
      },
      getPrototypeOf() {
        assert.fail('Capability detection must not inspect the prototype chain directly');
      }
    });
    assert.equal(T[name](input), true);
    assert.deepEqual(trace, [key]);
  });
}

test('capabilities are read afresh; class and revoked function methods are not execution guarantees', () => {
  const revoked = Proxy.revocable(function () {}, {});
  revoked.revoke();
  const nonCallable = {
    [Symbol.toPrimitive]() {
      assert.fail('Do not coerce a method');
    }
  };
  for (const [name, key] of methods) {
    const prototype = { [key]: function () {} };
    const input = Object.create(prototype);
    for (const [method, expected] of [
      [function () {}, true],
      [class Method {}, true],
      [revoked.proxy, true],
      [undefined, false],
      [null, false],
      [0, false],
      [nonCallable, false]
    ]) {
      prototype[key] = method;
      assert.equal(T[name](input), expected, name);
    }
    Object.defineProperty(prototype, key, {
      get() {
        throw nonCallable;
      }
    });
    assert.throws(
      () => T[name](input),
      (error) => error === nonCallable
    );
    assert.throws(
      () => T[name](Proxy.revocable(input, {}).proxy),
      (error) => error === nonCallable
    );
  }
});

test('promise-like detection reads then once without inspecting catch or finally', () => {
  const trace = [];
  let method = 0;
  const input = {
    get then() {
      trace.push('then');
      return method;
    },
    get catch() {
      return assert.fail('Do not read catch');
    },
    get finally() {
      return assert.fail('Do not read finally');
    }
  };
  assert.equal(T.isPromiseLike(input), false);
  assert.deepEqual(trace, ['then']);
  trace.length = 0;
  method = () => assert.fail('Do not invoke then');
  assert.equal(T.isPromiseLike(input), true);
  assert.deepEqual(trace, ['then']);
});

test('object-only capabilities ignore primitive prototype methods and accept boxed containers', () => {
  const realm = vm.createContext({});
  vm.runInContext(sourceLoader(), realm);
  // Set primitive prototype properties only in this isolated realm. Primitive
  // next/then shapes remain outside the object-only capability contracts.
  vm.runInContext(
    `
    Number.prototype.next = function () {};
    Number.prototype.then = function () {};
    globalThis.primitive = 7;
    globalThis.boxed = new Number(7);
  `,
    realm
  );
  for (const api of [T, realm.Types]) {
    for (const name of ['isIteratorLike', 'isPromiseLike']) {
      assert.equal(api[name](realm.primitive), false, name);
      assert.equal(api[name](realm.boxed), true, name);
    }
  }
});

test('Promise instance detection is realm-local, live and does not read payload properties', () => {
  const realm = vm.createContext({});
  vm.runInContext(sourceLoader(), realm);
  const Original = vm.runInContext('Promise', realm);
  const Replacement = vm.runInNewContext('Promise');
  const original = Original.resolve(1);
  const replacement = Replacement.resolve(2);
  for (const value of [original, replacement]) {
    for (const key of ['then', 'catch', 'constructor', Symbol.toStringTag]) {
      Object.defineProperty(value, key, {
        get() {
          return assert.fail('Do not inspect promise payloads');
        }
      });
    }
  }
  assert.equal(realm.Types.isPromise(original), true);
  assert.equal(realm.Types.isPromise(replacement), false);
  realm.Promise = Replacement;
  assert.equal(realm.Types.isPromise(original), false);
  assert.equal(realm.Types.isPromise(replacement), true);
  assert.equal(realm.Types.isPromise(Object.create(Replacement.prototype)), true);
  const sentinel = new Error('Prototype access failed');
  assert.throws(
    () =>
      realm.Types.isPromise(
        new Proxy(
          {},
          {
            getPrototypeOf() {
              throw sentinel;
            }
          }
        )
      ),
    (error) => error === sentinel
  );
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  realm.Promise = undefined;
  assert.equal(realm.Types.isPromise(revoked.proxy), false);
});

for (const name of ['isEmptyIterable', 'isBlankIterable']) {
  test(`${name} captures next once, reads return at close time and preserves exact receivers`, () => {
    const trace = [];
    const iterator = {
      get next() {
        trace.push('get next');
        return function () {
          assert.equal(this, iterator);
          assert.equal(arguments.length, 0);
          trace.push('next');
          Object.defineProperty(iterator, 'next', {
            value() {
              assert.fail('Must keep captured next');
            }
          });
          Object.defineProperty(iterator, 'return', {
            get() {
              trace.push('get return');
              return function () {
                assert.equal(this, iterator);
                assert.equal(arguments.length, 0);
                trace.push('return');
                return {
                  get done() {
                    return assert.fail('Do not read close-result done');
                  },
                  get value() {
                    return assert.fail('Do not read close-result value');
                  },
                  get then() {
                    return assert.fail('Do not assimilate the close result');
                  }
                };
              };
            }
          });
          return { done: false, value: 1 };
        };
      }
    };
    const input = {
      get [Symbol.iterator]() {
        trace.push('get iterator');
        return function () {
          assert.equal(this, input);
          assert.equal(arguments.length, 0);
          trace.push('iterator');
          return iterator;
        };
      }
    };
    assert.equal(T[name](input), false);
    assert.deepEqual(trace, ['get iterator', 'iterator', 'get next', 'next', 'get return', 'return']);
  });

  test(`${name} ignores completed record values and never requests return on normal completion`, () => {
    const trace = [];
    const input = {
      [Symbol.iterator]() {
        return {
          next() {
            trace.push('next');
            return {
              get done() {
                trace.push('done');
                return {};
              },
              get value() {
                return assert.fail('Completed records do not expose a yielded value');
              }
            };
          },
          get return() {
            return assert.fail('No close on normal completion');
          }
        };
      }
    };
    assert.equal(T[name](input), true);
    assert.deepEqual(trace, ['next', 'done']);
  });

  test(`${name} preserves done/value getter failures without attempting iterator close`, () => {
    for (const stage of ['done', 'value']) {
      const sentinel = { stage };
      const trace = [];
      const input = {
        [Symbol.iterator]() {
          return {
            next() {
              trace.push('next');
              return {
                get done() {
                  trace.push('done');
                  if (stage === 'done') throw sentinel;
                  return false;
                },
                get value() {
                  trace.push('value');
                  throw sentinel;
                }
              };
            },
            get return() {
              return assert.fail('Failed stepping does not request IteratorClose');
            }
          };
        }
      };
      assert.throws(
        () => T[name](input),
        (error) => error === sentinel
      );
      assert.deepEqual(trace, stage === 'done' ? ['next', 'done'] : ['next', 'done', 'value']);
    }
  });

  test(`${name} propagates a return getter failure and accepts an absent close method`, () => {
    for (const close of [undefined, null, 42]) {
      let reads = 0;
      const input = {
        [Symbol.iterator]() {
          return {
            next() {
              return { value: 1, done: false };
            },
            get return() {
              reads++;
              return close;
            }
          };
        }
      };
      if (close === 42) assert.throws(() => T[name](input), TypeError);
      else assert.equal(T[name](input), false);
      assert.equal(reads, 1);
    }
    const sentinel = Symbol('close failure');
    assert.throws(
      () =>
        T[name]({
          [Symbol.iterator]() {
            return {
              next() {
                return { value: 1, done: false };
              },
              get return() {
                throw sentinel;
              }
            };
          }
        }),
      (error) => error === sentinel
    );
  });

  test(`${name} does not await yielded values or inspect the asynchronous iterator protocol`, () => {
    let steps = 0;
    const payload = {
      get then() {
        return assert.fail('Do not await a yielded item');
      }
    };
    const input = {
      get [Symbol.asyncIterator]() {
        return assert.fail('Do not inspect the async protocol');
      },
      [Symbol.iterator]() {
        return {
          next() {
            steps++;
            return { done: false, value: payload };
          }
        };
      }
    };
    assert.equal(T[name](input), false);
    assert.equal(steps, 1);
    let calls = 0;
    const asyncOnly = {
      [Symbol.asyncIterator]() {
        calls++;
        return this;
      },
      next() {
        calls++;
      }
    };
    assert.throws(() => T[name](asyncOnly), TypeError);
    assert.equal(calls, 0);
  });

  test(`${name} requests cleanup once but does not drain a generator that yields from finally`, () => {
    const trace = [];
    const input = (function* () {
      try {
        yield 1;
      } finally {
        trace.push('cleanup started');
        yield 2;
        trace.push('cleanup finished');
      }
    })();
    assert.equal(T[name](input), false);
    assert.deepEqual(trace, ['cleanup started']);
    // Only this test resumes a consumed iterator to observe the boundary. It is
    // not a recommendation that callers reuse inspected one-shot iterators.
    assert.deepEqual(input.next(), { done: true, value: undefined });
    assert.deepEqual(trace, ['cleanup started', 'cleanup finished']);
  });
}

test('blank iterable snapshots next while continuing past nullish values', () => {
  const trace = [];
  let count = 0;
  const iterator = {
    get next() {
      trace.push('get next');
      return function () {
        assert.equal(this, iterator);
        trace.push('next ' + count);
        Object.defineProperty(iterator, 'next', {
          value() {
            assert.fail('Do not look up next again');
          }
        });
        return count++ < 2 ? { done: false, value: null } : { done: true };
      };
    }
  };
  assert.equal(
    T.isBlankIterable({
      [Symbol.iterator]() {
        return iterator;
      }
    }),
    true
  );
  assert.deepEqual(trace, ['get next', 'next 0', 'next 1', 'next 2']);
});

test('consuming checks recover from nested calls and retain no cross-call traversal state', () => {
  const trace = [];
  const iterable = {
    [Symbol.iterator]() {
      return {
        next() {
          return { done: false, value: 1 };
        },
        return() {
          trace.push(T.isBlankIterable([null, undefined]));
          trace.push(T.isEmptyIterable([]));
          return { done: true };
        }
      };
    }
  };
  assert.equal(T.isBlankIterable(iterable), false);
  assert.equal(T.isEmptyIterable(iterable), false);
  assert.deepEqual(trace, [true, true, true, true]);
});
