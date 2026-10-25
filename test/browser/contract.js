/* Browser black-box checks, shared by bundle verification and the explicit source-only run. */
globalThis.runGoTypesBrowserTests = async function (api, metadata, names, sourceExamples = []) {
  const failures = [];
  let passed = 0;
  let skipped = 0;
  function test(name, body) {
    try {
      body();
      passed++;
    } catch (error) {
      failures.push({ name, message: String(error.stack || error) });
    }
  }
  async function testAsync(name, body) {
    try {
      await body();
      passed++;
    } catch (error) {
      failures.push({ name, message: String(error.stack || error) });
    }
  }
  function equal(actual, expected) {
    if (!Object.is(actual, expected)) throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
  function exampleEqual(actual, expected) {
    if (expected && typeof expected === 'object') {
      equal(Array.isArray(actual), Array.isArray(expected));
      equal(Object.keys(actual).join(','), Object.keys(expected).join(','));
      for (const key of Object.keys(expected)) exampleEqual(actual[key], expected[key]);
    } else equal(actual, expected);
  }
  function throws(body) {
    try {
      body();
    } catch (error) {
      if (error instanceof TypeError) return;
      throw error;
    }
    throw new Error('Expected TypeError');
  }
  test('matcher compilation is internal to the browser API', () => {
    equal(Object.prototype.hasOwnProperty.call(api, 'isTypeOf'), false);
    equal(Object.prototype.hasOwnProperty.call(api, 'isInstanceOf'), false);
    equal(Object.prototype.hasOwnProperty.call(api, 'createTypeChecker'), false);
    equal(Object.prototype.hasOwnProperty.call(api, 'compileTypeMatcher'), false);
  });
  test('JSON parsing preserves revivers, safe keys and conditional identity', () => {
    equal(api.fromJson('null'), null);
    exampleEqual(api.fromJson('[1,2]'), [1, 2]);
    exampleEqual(
      api.fromJson('{"a":1,"b":2}', (key, value) => (key === 'a' ? undefined : value)),
      { b: 2 }
    );
    const own = api.fromJson('{"__proto__":{"polluted":true}}');
    equal(Object.getPrototypeOf(own), Object.prototype);
    equal(Object.prototype.hasOwnProperty.call(own, '__proto__'), true);
    equal({}.polluted, undefined);
    const visits = [];
    equal(
      api.fromJson('1', function (key, value) {
        equal(this[key], value);
        visits.push(key);
        return 2;
      }),
      2
    );
    exampleEqual(visits, ['']);
    const error = new Error('reviver');
    let caught;
    try {
      api.fromJson('1', () => {
        throw error;
      });
    } catch (failure) {
      caught = failure;
    }
    equal(caught, error);
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    equal(api.fromJsonIf(revoked.proxy, false, revoked.proxy), revoked.proxy);
    equal(api.fromJsonIf('invalid'), 'invalid');
    equal(
      api.fromJsonIf('2', true, (_key, value) => (typeof value === 'number' ? value * 2 : value)),
      4
    );
  });
  test('boxing and unboxing preserve brands and HTMLDDA identity', () => {
    for (const value of [false, 3, -0, NaN, 'text', Symbol('key'), BigInt('12')])
      equal(api.unbox(api.box(value)), value);
    equal(api.box(null), null);
    equal(api.box(), undefined);
    equal(api.box(document.all), document.all);
    equal(api.unbox(document.all), document.all);
    const input = {
      valueOf() {
        throw Error('must not run');
      }
    };
    equal(api.unbox(input), input);
    const proxy = Proxy.revocable({}, {});
    proxy.revoke();
    equal(api.box(proxy.proxy), proxy.proxy);
    equal(api.unbox(proxy.proxy), proxy.proxy);
    equal(api.boxIf(3, false), 3);
    equal(api.unboxIf(input, false), input);
  });
  test('RegExp conversion guarantees a brand and native flag semantics', () => {
    const value = /a/g;
    value.lastIndex = 2;
    equal(api.toRegExp(value), value);
    equal(value.lastIndex, 2);
    equal(api.toRegExp(value, 'i').lastIndex, 0);
    equal(api.toRegExpIf('a', true, 'i').test('A'), true);
    const fake = { [Symbol.match]: true, constructor: RegExp, source: 'a', flags: 'i' };
    const converted = api.toRegExp(fake);
    equal(api.isRegExp(converted), true);
    equal(converted.test('A'), true);
  });
  await testAsync('Promise conversion adopts values and propagates rejections', async () => {
    const promise = Promise.resolve(3);
    equal(api.toPromise(promise), promise);
    equal(await api.toPromise(4), 4);
    equal(
      await api.toPromise({
        then(resolve) {
          resolve(5);
        }
      }),
      5
    );
    const fn = () => {
      throw Error('must not call');
    };
    equal(await api.toPromise(fn), fn);
    const error = new Error('then');
    let caught;
    try {
      await api.toPromise({
        get then() {
          throw error;
        }
      });
    } catch (failure) {
      caught = failure;
    }
    equal(caught, error);
    equal(api.toPromiseIf(3, false), 3);
    equal(await api.toPromiseIf(3, true), 3);
  });
  test('collection conversions share record, symbol and strict entry rules', () => {
    const key = Symbol('value');
    const input = { a: 1, length: 2, [key]: 3 };
    exampleEqual(api.toArray(input), [1, 2, 3]);
    exampleEqual(Array.from(api.toSet(input)), [1, 2, 3]);
    equal(api.toMap(input).get(key), 3);
    for (const pair of [[], ['a'], ['a', 1, 2], Array(2), { 0: 'a', 1: 1, length: 2 }]) {
      let closed = false;
      function* entries() {
        try {
          yield pair;
        } finally {
          closed = true;
        }
      }
      throws(() => api.toMap(entries()));
      equal(closed, true);
    }
    equal(api.toMap([['a', undefined]]).has('a'), true);
    for (const value of [1, new Date(), /x/, Object('abc'), Promise.resolve(1), function () {}]) {
      throws(() => api.toArray(value));
      throws(() => api.toSet(value));
      throws(() => api.toMap(value));
    }
    const host = document.createElement('div');
    host.innerHTML = '<span></span><span></span>';
    equal(api.toSet(host.children).size, 2);
    equal(api.toArray(host.children)[1], host.lastChild);
  });
  test('array and Set conversion preserve document.all array-like contents', () => {
    const doc = document.implementation.createHTMLDocument('collection values');
    const input = doc.all;
    const array = api.toArray(input);
    const set = api.toSet(input);
    equal(array.length, input.length);
    equal(set.size, input.length);
    for (let i = 0; i < input.length; i++) {
      equal(array[i], input[i]);
      equal(set.has(input[i]), true);
    }
    equal(api.toArrayIf(input, false), input);
    equal(api.toSetIf(input, false), input);
  });
  test('JSON serialization preserves native options and unsupported-value rules', () => {
    equal(api.toJson({ a: 1, b: 2 }, ['a'], 2), '{\n  "a": 1\n}');
    equal(api.toJson('hello'), '"hello"');
    equal(api.toJson(undefined), undefined);
    equal(api.toJson({ a: undefined }), '{}');
    equal(api.toJson([undefined, NaN]), '[null,null]');
    equal(api.toJson(new Date(0)), '"1970-01-01T00:00:00.000Z"');
    equal(api.toJson(new Map([['a', 1]])), '{}');
    const failure = new Error('JSON getter');
    let observed;
    try {
      api.toJson({
        get a() {
          throw failure;
        }
      });
    } catch (error) {
      observed = error;
    }
    equal(observed, failure);
    const cycle = {};
    cycle.self = cycle;
    throws(() => api.toJson(cycle));
    throws(() => api.toJson(BigInt('1')));
  });
  test('JSON serialization preserves native hook order and replacer receiver', () => {
    const input = {
      toJSON() {
        return { a: 1 };
      }
    };
    let rootCalls = 0;
    equal(
      api.toJson(input, function (key, value) {
        if (key === '') {
          equal(this[key], input);
          rootCalls++;
        }
        return key === 'a' ? 2 : value;
      }),
      '{"a":2}'
    );
    equal(rootCalls, 1);
    equal(
      api.toJson(undefined, () => 42),
      '42'
    );
  });
  test('conditional JSON serialization skips all option inspection and forwards requested options', () => {
    const poison = new Proxy([], {
      get() {
        throw Error('unexpected inspection');
      }
    });
    equal(api.toJsonIf(poison, false, poison, poison), poison);
    equal(api.toJsonIf(poison), poison);
    let calls = 0;
    equal(
      api.toJsonIf(
        { a: 1, b: 2 },
        (value) => {
          calls++;
          return value.a === 1;
        },
        ['a'],
        2
      ),
      '{\n  "a": 1\n}'
    );
    equal(calls, 1);
    throws(() => api.toJsonIf(poison, async () => false));
    throws(() => api.toJsonIf(poison, () => 1));
  });
  test('public export names', () => equal(Object.keys(api).sort().join(','), [...names].sort().join(',')));
  test('cycle traversal recognises HTMLDDA vertices and does not retain prior graph state', () => {
    const isolated = document.implementation.createHTMLDocument('graph fixture');
    isolated.removeChild(isolated.documentElement);
    const value = isolated.all;
    equal(value.length, 0);
    equal(api.isCyclic(value), false);
    try {
      Object.defineProperty(value, '__goTypesGraphEdge', { value, enumerable: true, configurable: true });
      equal(api.isCyclic(value), true);
      Object.defineProperty(value, '__goTypesGraphEdge', { enumerable: false });
      equal(api.isCyclic(value), false);
    } finally {
      delete value.__goTypesGraphEdge;
    }
    equal(api.isCyclic(value), false);
  });
  test('cycle traversal follows foreign inherited getters but honours hidden own shadows', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    try {
      const value = new iframe.contentWindow.Object();
      const proto = new iframe.contentWindow.Object();
      let reads = 0;
      Object.defineProperty(proto, 'edge', {
        enumerable: true,
        get() {
          equal(this, value);
          reads++;
          return this.destination;
        }
      });
      Object.setPrototypeOf(value, proto);
      Object.defineProperty(value, 'destination', { value });
      equal(api.isCyclic(value), true);
      Object.defineProperty(value, 'edge', { value, configurable: true, enumerable: false });
      equal(api.isCyclic(value), false);
      equal(reads, 1);
      delete value.edge;
      equal(api.isCyclic(value), true);
      equal(reads, 2);
    } finally {
      iframe.remove();
    }
  });
  for (const item of metadata)
    for (const example of item.examples) {
      if ((example.requires || []).some((name) => typeof globalThis[name] === 'undefined')) {
        skipped++;
        continue;
      }
      test(`API example: ${example.expression}`, () => {
        const evaluate = Function('api', `const {${names.join(',')}} = api; return (${example.expression});`);
        exampleEqual(evaluate(api), example.expected);
      });
    }
  for (const example of sourceExamples) {
    if ((example.requires || []).some((name) => typeof globalThis[name] === 'undefined')) {
      skipped++;
      continue;
    }
    test(`Source JSDoc: ${example.expression}`, () => {
      const evaluate = Function(...names, `return (${example.expression});`);
      const expected = Function(`return (${example.expected});`)();
      exampleEqual(evaluate(...names.map((name) => api[name])), expected);
    });
  }
  for (const [name, expected] of [
    ['isNullish', false],
    ['isNonNullish', true],
    ['isUndefined', false],
    ['isObject', true],
    ['isObjectLike', true],
    ['isPrimitive', false],
    ['isArrayLike', true],
    ['isIterable', true],
    ['isEmpty', false],
    ['isBlank', false]
  ])
    test('HTMLDDA boundary: ' + name, () => equal(api[name](document.all), expected));
  for (const [label, prototype, expected] of [
    ['null', null, true],
    ['Object.prototype', Object.prototype, true],
    ['custom', {}, false]
  ]) {
    test('HTMLDDA plain-object current prototype: ' + label, () => {
      const value = document.all;
      const original = Object.getPrototypeOf(value);
      try {
        Object.setPrototypeOf(value, prototype);
        equal(api.isPlainObject(value), expected);
        equal(api.isObjectLike(value), true);
        equal(api.isPrimitive(value), false);
      } finally {
        Object.setPrototypeOf(value, original);
      }
      equal(api.isPlainObject(value), false);
    });
  }
  for (const input of [[document.all], new Set([document.all]), new Map([['x', document.all]]), { x: document.all }]) {
    test('HTMLDDA nested item is nonblank', () => equal(api.isBlank(input), false));
  }
  test('HTMLDDA iterable item is nonblank', () => equal(api.isBlankIterable([document.all]), false));
  test('HTMLDDA retains intentional native typeof and truthiness', () => {
    equal(api.isArrayOf([document.all], 'undefined'), true);
    throws(() => api.isArrayOf([document.all], undefined));
    equal(api.toBoolean(document.all), false);
    throws(() => api.toPlainObject(document.all));
  });
  test('promise-like detection ignores catch and finally without invoking then', () => {
    let reads = 0;
    const input = {
      get then() {
        reads++;
        return () => {
          throw Error('Do not invoke then');
        };
      },
      get catch() {
        throw Error('Do not read catch');
      },
      get finally() {
        throw Error('Do not read finally');
      }
    };
    equal(api.isPromiseLike(input), true);
    equal(reads, 1);
  });
  // A protocol method can have [[Call]] without reporting typeof "function".
  // Keep this separate from isFunction(), whose public contract is literal typeof.
  for (const [name, key] of [
    ['isIterable', Symbol.iterator],
    ['isAsyncIterable', Symbol.asyncIterator],
    ['isIteratorLike', 'next'],
    ['isPromiseLike', 'then']
  ]) {
    test('callable HTMLDDA protocol method: ' + name, () => {
      const prototype = { [key]: document.all };
      equal(api[name](Object.create(prototype)), true);
      prototype[key] = undefined;
      equal(api[name](Object.create(prototype)), false);
      prototype[key] = () => {};
      equal(api[name](Object.create(prototype)), true);
    });
  }
  for (const key of [Symbol.iterator, Symbol.asyncIterator, 'next']) {
    test('HTMLDDA unsized capability is rejected before dictionary inspection: ' + String(key), () => {
      const input = Object.create(null);
      Object.defineProperty(input, key, { value: document.all });
      throws(() => api.isEmpty(input));
      throws(() => api.isBlank(input));
      input.length = 0;
      // Supported size information still takes precedence over protocol checks.
      equal(api.isEmpty(input), true);
      equal(api.isBlank(input), true);
    });
  }
  test('HTMLDDA method callability is distinct from function typeof and successful iteration', () => {
    const element = document.createElement('span');
    element.id = 'go-types-a05-callable-control';
    document.body.appendChild(element);
    try {
      equal(Reflect.apply(document.all, null, [element.id]), element);
      equal(api.isFunction(document.all), false);
      // This method is callable, but its no-argument result is not an iterator.
      // A shape check does not promise successful consumption.
      const input = { [Symbol.iterator]: document.all };
      throws(() => api.isEmptyIterable(input));
      throws(() => api.isBlankIterable(input));
    } finally {
      element.remove();
    }
  });
  // Restore host properties even when a regression assertion fails.
  function withMatcherSelectors(value, selectors, body) {
    const original = ['predicate', 'instanceOf'].map((key) => [key, Object.getOwnPropertyDescriptor(value, key)]);
    try {
      for (const [key] of original) delete value[key];
      Object.defineProperties(value, selectors);
      body(value);
    } finally {
      for (const [key, descriptor] of original) {
        if (descriptor) Object.defineProperty(value, key, descriptor);
        else delete value[key];
      }
    }
  }
  test('HTMLDDA descriptor selectors still reject accessors, ambiguous and absent configurations', () => {
    let reads = 0;
    withMatcherSelectors(
      document.all,
      {
        predicate: {
          configurable: true,
          get() {
            reads++;
            return () => true;
          }
        }
      },
      (value) => throws(() => api.isArrayOf([undefined], value))
    );
    equal(reads, 0);
    withMatcherSelectors(
      document.all,
      {
        predicate: { configurable: true, value: () => true },
        instanceOf: { configurable: true, value: Object }
      },
      (value) => throws(() => api.isArrayOf([undefined], value))
    );
    withMatcherSelectors(document.all, {}, (value) => throws(() => api.isArrayOf([undefined], value)));
  });
  test('real DOM nodes', () => {
    equal(api.isNode(document), true);
    equal(api.isNode(document.createTextNode('x')), true);
    equal(api.isElement(document.body), true);
    equal(api.isElement(document), false);
    equal(api.isFragment(document.createDocumentFragment()), true);
    equal(api.isFragment(document.body), false);
    equal(api.isNode({ nodeType: 1 }), false);
  });
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  const realm = iframe.contentWindow;
  test('foreign arrays and objects', () => {
    equal(api.isArray(new realm.Array()), true);
    equal(api.isArrayOf(new realm.Array(1, 2), 'number'), true);
    equal(api.isPlainObject(new realm.Object()), true);
    equal(api.isObject(realm.Object.create(null)), true);
  });
  for (const [name, Constructor] of [
    ['isDate', 'Date'],
    ['isMap', 'Map'],
    ['isSet', 'Set'],
    ['isWeakMap', 'WeakMap'],
    ['isWeakSet', 'WeakSet'],
    ['isRegExp', 'RegExp'],
    ['isError', 'Error']
  ]) {
    test(`foreign ${Constructor}`, () => equal(api[name](new realm[Constructor]()), true));
  }
  test('foreign binary types', () => {
    const buffer = new realm.ArrayBuffer(8);
    equal(api.isArrayBuffer(buffer), true);
    equal(api.isDataView(new realm.DataView(buffer)), true);
    equal(api.isTypedArray(new realm.Uint8Array(buffer)), true);
  });
  test('foreign instance matching remains realm-sensitive', () => {
    equal(
      api.isArrayOf([new realm.Date()], (value) => value instanceof Date),
      false
    );
    equal(api.isArrayOf([new realm.Date()], api.isDate), true);
    equal(api.isPromise(realm.Promise.resolve()), false);
    equal(api.isNode(realm.document.body), false);
    equal(api.isElement(realm.document.body), false);
  });
  for (const [name, Constructor, make] of [
    ['isNode', Node, (doc) => doc.createTextNode('identity')],
    ['isElement', Element, (doc) => doc.createElement('div')],
    ['isFragment', DocumentFragment, (doc) => doc.createDocumentFragment()]
  ]) {
    test(`${name}: adoption preserves agreement with the native local instance check`, () => {
      const local = make(document);
      const foreign = make(realm.document);
      equal(api[name](local), true);
      equal(api[name](foreign), false);
      realm.document.adoptNode(local);
      document.adoptNode(foreign);
      equal(local.ownerDocument, realm.document);
      equal(foreign.ownerDocument, document);
      // Engines differ in whether adoption changes the object's realm/prototype.
      equal(api[name](local), local instanceof Constructor);
      equal(api[name](foreign), foreign instanceof Constructor);
      // These checks deliberately promise local instanceof, not DOM branding.
      equal(api[name](Object.create(Constructor.prototype)), true);
      const proxy = new Proxy(local, {});
      equal(api[name](proxy), proxy instanceof Constructor);
      const failure = new Error('prototype access failed');
      let observed;
      try {
        api[name](
          new Proxy(
            {},
            {
              getPrototypeOf() {
                throw failure;
              }
            }
          )
        );
      } catch (error) {
        observed = error;
      }
      equal(observed, failure);
      const revoked = Proxy.revocable(local, {});
      revoked.revoke();
      throws(() => api[name](revoked.proxy));
    });
  }
  test('conversion: real NodeList and HTMLCollection', () => {
    const host = document.createElement('div');
    host.innerHTML = '<span>a</span><span>b</span>';
    const nodes = api.toArray(host.querySelectorAll('span'));
    equal(nodes.length, 2);
    equal(nodes[0], host.firstChild);
    equal(api.toArray(host.children)[1], host.lastChild);
  });
  test('conversion: plain objects preserve symbols, shallow values and safe prototypes', () => {
    const symbol = Symbol('field');
    const nested = {};
    const input = new realm.Object();
    input.a = nested;
    input[symbol] = 2;
    Object.defineProperty(input, 'hidden', { value: 3 });
    const result = api.toPlainObject(input);
    equal(Object.getPrototypeOf(result), Object.prototype);
    equal(result === input, false);
    equal(result.a, nested);
    equal(result[symbol], 2);
    equal(Object.prototype.hasOwnProperty.call(result, 'hidden'), false);
    const special = api.toPlainObject([['__proto__', { injected: true }]]);
    equal(Object.getPrototypeOf(special), Object.prototype);
    equal(special.injected, undefined);
    equal(special.__proto__.injected, true);
    equal(api.toPlainObject(new realm.Map([['a', 1]])).a, 1);
    equal(api.toPlainObjectIf(null, false), null);
    throws(() => api.toPlainObjectIf('{"a":1}', true));
    throws(() => api.toPlainObjectIf('{"a":1}', () => true));
    equal(api.toPlainObjectIf('{"a":1}', false), '{"a":1}');
    equal(api.toPlainObjectIf('{"a":1}'), '{"a":1}');
    equal(
      api.toPlainObjectIf('{"a":1}', () => false),
      '{"a":1}'
    );
    for (const value of [
      null,
      undefined,
      new realm.String(''),
      new realm.Date(),
      [[1, 2]],
      [['a']],
      [['a', 1, 2]],
      '[]',
      '{"a":1}',
      '[["a",1]]',
      '{',
      'ordinary text',
      ''
    ])
      throws(() => api.toPlainObject(value));
    equal('toObject' in api, false);
  });
  test('conversion: plain entry validation closes iterators and propagates errors', () => {
    let closed = false;
    throws(() =>
      api.toPlainObject(
        (function* () {
          try {
            yield ['a', 1];
            yield ['bad'];
          } finally {
            closed = true;
          }
        })()
      )
    );
    equal(closed, true);
    const failure = new Error('getter');
    let caught;
    try {
      api.toPlainObject({
        get value() {
          throw failure;
        }
      });
    } catch (error) {
      caught = error;
    }
    equal(caught, failure);
  });
  test('conversion: document.all retains truthiness and skipped identity', () => {
    equal(api.toBoolean(document.all), false);
    throws(() => api.toPlainObject(document.all));
    equal(api.toPlainObjectIf(document.all, false), document.all);
  });
  test('conversion: foreign Date and Symbol identity', () => {
    const date = new realm.Date(0);
    equal(api.toDate(date), date);
    const symbol = realm.Symbol('key');
    equal(api.toSymbol(realm.Object(symbol)), symbol);
  });
  test('conversion: foreign collections become local arrays', () => {
    const result = api.toArray(new realm.Set([1, 2]));
    equal(Object.getPrototypeOf(result), Array.prototype);
    equal(result.join(','), '1,2');
  });
  test('conversion: explicit numeric, text and boolean semantics', () => {
    equal(api.toNumber('0x10'), 16);
    equal(api.toInteger('-1.9'), -1);
    equal(api.toInteger(-0.5), -0);
    equal(api.toBigInt('9007199254740993'), 9007199254740993n);
    equal(api.toString(Symbol('key')), 'Symbol(key)');
    equal(api.toBoolean('false'), true);
  });
  test('conversion: conditional skipping preserves input and rejects async results', () => {
    const input = {
      get valueOf() {
        throw Error('input was inspected');
      }
    };
    equal(api.toNumberIf(input, false), input);
    equal(api.toNumberIf('2', true), 2);
    throws(() => api.toNumberIf('2', async () => true));
  });
  test('conversion: Map and Set copy foreign collections into local collections', () => {
    const key = {},
      value = {};
    const map = api.toMap(new realm.Map([[key, value]]));
    const set = api.toSet(new realm.Set([value, value]));
    equal(Object.getPrototypeOf(map), Map.prototype);
    equal(Object.getPrototypeOf(set), Set.prototype);
    equal(map.get(key), value);
    equal(set.has(value), true);
    equal(set.size, 1);
    equal(api.toMap().size, 0);
    equal(api.toSet(null).size, 0);
    equal(
      api
        .toMap([
          ['key', 1],
          ['key', 2]
        ])
        .get('key'),
      2
    );
    equal(Array.from(api.toSet('A😀A')).join(''), 'A😀');
    equal(api.toMap({ key: 1 }).get('key'), 1);
    equal(api.toMap(Object.assign(Object.create(null), { key: value })).get('key'), value);
    const foreignRecord = new realm.Object();
    foreignRecord.key = value;
    equal(api.toMap(foreignRecord).get('key'), value);
    equal(api.toMapIf({ key: 1 }, true).get('key'), 1);
    equal(api.toSet({ 0: 1, length: 1 }).size, 1);
    const revoked = realm.Proxy.revocable({}, {});
    revoked.revoke();
    equal(api.toMapIf(revoked.proxy, false), revoked.proxy);
    equal(
      api.toSetIf(revoked.proxy, () => false),
      revoked.proxy
    );
    equal(api.toMapIf([['key', 1]], true).get('key'), 1);
    equal(api.toSetIf([1, 1], true).size, 1);
    throws(() => api.toMapIf([], async () => true));
    throws(() => api.toSetIf([], () => 1));
  });
  test('numeric text and JSON retain distinct grammar and finite-result policies', () => {
    for (const [text, numeric, json] of [
      ['1e400', false, true],
      ['1e-400', true, true],
      ['9007199254740993', true, true],
      ['0x10', true, false],
      ['01', true, false],
      ['\ufeff1', true, false],
      ['\t1\r', true, true],
      ['\u200b1', false, false],
      ['"\n"', false, false],
      ['"\\n"', false, true]
    ]) {
      for (const value of [text, new realm.String(text)]) {
        equal(api.isNumeric(value), numeric);
        equal(api.isJson(value), json);
      }
    }
  });
  test('foreign Number refinements retain stored-value and safe-range boundaries', () => {
    for (const [value, integer, safe, fractional] of [
      [2 ** 52 - 0.5, false, false, true],
      [2 ** 52, true, true, false],
      [2 ** 53 - 1, true, true, false],
      [2 ** 53, true, false, false],
      [-Number.MIN_VALUE, false, false, true],
      [Number.MAX_VALUE, true, false, false],
      [-0, true, true, false],
      [NaN, false, false, false]
    ]) {
      equal(api.isInteger(new realm.Number(value)), integer);
      equal(api.isSafeInteger(new realm.Number(value)), safe);
      equal(api.isFloat(new realm.Number(value)), fractional);
    }
  });
  iframe.remove();
  test('native Error.isError branch or conservative fallback', () => {
    const error = new Error('x');
    error[Symbol.toStringTag] = 'CustomError';
    equal(api.isError(error), typeof Error.isError === 'function');
    equal(api.isError({ [Symbol.toStringTag]: 'Error' }), false);
    equal(
      api.isError(new DOMException('x')),
      typeof Error.isError === 'function' ? Error.isError(new DOMException('x')) : false
    );
  });
  test('Error recognition ignores application payload getters', () => {
    const error = new Error('payload');
    let reads = 0;
    delete error.stack;
    for (const key of ['name', 'message', 'stack', 'cause', 'toString']) {
      Object.defineProperty(error, key, {
        get() {
          reads++;
          throw Error('Do not inspect error payload');
        }
      });
    }
    equal(api.isError(error), true);
    equal(reads, 0);
    equal(api.isError(Object.create(Error.prototype)), false);
  });
  for (const [name, check] of [
    ['array', (matcher) => api.isArrayOf([1], matcher)],
    ['array-like', (matcher) => api.isArrayLikeOf({ 0: 1, length: 1 }, matcher)],
    ['Set', (matcher) => api.isSetOf(new Set([1]), matcher)],
    ['Map key', (matcher) => api.isMapOf(new Map([[1, 1]]), matcher, 'number')],
    ['Map value', (matcher) => api.isMapOf(new Map([[1, 1]]), 'number', matcher)]
  ]) {
    test(name + ': direct predicates and required string-or-predicate matchers', () => {
      let calls = 0;
      equal(
        check(function (value) {
          'use strict';
          calls++;
          equal(this, undefined);
          equal(arguments.length, 1);
          return value === 1;
        }),
        true
      );
      equal(calls, 1);
      equal(
        check(() => false),
        false
      );
      for (const matcher of [undefined, null, new String('number'), ['number'], { predicate: api.isNumber }]) {
        throws(() => check(matcher));
      }
      for (const result of [1, new Boolean(true), Promise.resolve(true)]) throws(() => check(() => result));
      const failure = {};
      let observed;
      try {
        check(() => {
          throw failure;
        });
      } catch (error) {
        observed = error;
      }
      equal(observed, failure);
    });
  }
  test('empty containers still require matchers without probing callbacks', () => {
    const predicate = () => {
      throw Error('must not execute');
    };
    equal(api.isArrayOf([], predicate), true);
    equal(api.isMapOf(new Map(), predicate, predicate), true);
    throws(() => api.isArrayOf([]));
    throws(() => api.isMapOf(new Map(), predicate));
    equal(api.isArrayOf([new Number(1)], 'number'), false);
    equal(api.isArrayOf([new Number(1)], api.isNumber), true);
  });
  test('matcher validation is independent of value', () => {
    throws(() => api.isArrayOf([1], ['number', 42]));
    const cycle = [];
    cycle.push(cycle);
    throws(() => api.isArrayOf([undefined], cycle));
    equal(
      api.isArrayOf(['x'], (value) => typeof value === 'string' || value === null),
      true
    );
  });
  test('empty checks do not consume a generator', () => {
    function* values() {
      yield 1;
      yield 2;
    }
    const iterator = values();
    throws(() => api.isEmpty(iterator));
    equal(iterator.next().value, 1);
  });
  test('explicit consuming helper closes on early return', () => {
    let closed = false;
    function* values() {
      try {
        yield 1;
        yield 2;
      } finally {
        closed = true;
      }
    }
    equal(api.isEmptyIterable(values()), false);
    equal(closed, true);
  });
  for (const name of [
    'Int8Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Int16Array',
    'Uint16Array',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array',
    'BigInt64Array',
    'BigUint64Array',
    'Float16Array'
  ]) {
    if (typeof globalThis[name] !== 'function') {
      skipped++;
      continue;
    }
    test(name, () => {
      const value = new globalThis[name](2);
      equal(api.isTypedArray(value), true);
      equal(api.isArrayBufferView(value), true);
      equal(api.isDataView(value), false);
      equal(api.isArray(value), false);
    });
  }
  if (typeof SharedArrayBuffer === 'function')
    test('SharedArrayBuffer identity', () => {
      const value = new SharedArrayBuffer(8);
      equal(api.isSharedArrayBuffer(value), true);
      equal(api.isArrayBuffer(value), false);
    });
  else {
    skipped++;
    test('absent SharedArrayBuffer is safe', () => equal(api.isSharedArrayBuffer({}), false));
  }
  test('detached buffers retain native identity', () => {
    const buffer = new ArrayBuffer(8),
      data = new DataView(buffer),
      typed = new Uint8Array(buffer);
    structuredClone(buffer, { transfer: [buffer] });
    equal(api.isArrayBuffer(buffer), true);
    equal(api.isDataView(data), true);
    equal(api.isTypedArray(typed), true);
  });
  if (typeof ArrayBuffer.prototype.resize === 'function')
    test('out-of-bounds views retain identity', () => {
      const buffer = new ArrayBuffer(8, { maxByteLength: 16 });
      const data = new DataView(buffer, 4, 4),
        typed = new Uint8Array(buffer, 4, 4);
      buffer.resize(0);
      equal(api.isDataView(data), true);
      equal(api.isTypedArray(typed), true);
    });
  else skipped++;
  if (typeof ArrayBuffer.prototype.resize === 'function')
    test('fixed and tracking views retain identity through shrink, regrowth and transfer', () => {
      const buffer = new ArrayBuffer(32, { maxByteLength: 64 });
      const typed = [];
      for (const name of ['Uint8Array', 'BigInt64Array', 'Float16Array']) {
        const Constructor = globalThis[name];
        if (typeof Constructor !== 'function') continue;
        typed.push(new Constructor(buffer, 8, 2), new Constructor(buffer, 8));
      }
      const data = [new DataView(buffer, 8, 16), new DataView(buffer, 8)];
      function identities() {
        equal(api.isArrayBuffer(buffer), true);
        equal(api.isArrayBufferView(buffer), false);
        for (const view of typed) {
          equal(api.isTypedArray(view), true);
          equal(api.isArrayBufferView(view), true);
          equal(api.isDataView(view), false);
        }
        for (const view of data) {
          equal(api.isDataView(view), true);
          equal(api.isArrayBufferView(view), true);
          equal(api.isTypedArray(view), false);
        }
      }
      for (const length of [32, 4, 64, 0, 32]) {
        buffer.resize(length);
        identities();
        equal(buffer.byteLength, length);
      }
      new Uint8Array(buffer)[8] = 41;
      identities();
      const moved = structuredClone(buffer, { transfer: [buffer] });
      identities();
      equal(buffer.byteLength, 0);
      equal(new Uint8Array(moved)[8], 41);
      throws(() => data[0].byteLength);
    });
  else skipped++;
  return {
    passed,
    failed: failures.length,
    skipped,
    failures,
    features: {
      nativeErrorCheck: typeof Error.isError === 'function',
      sharedArrayBuffer: typeof SharedArrayBuffer === 'function',
      float16Array: typeof Float16Array === 'function',
      resize: typeof ArrayBuffer.prototype.resize === 'function'
    }
  };
};
