/* Browser black-box checks, shared by bundle verification and the explicit source-only run. */
globalThis.runGoTypesBrowserTests = function (api, metadata, names, sourceExamples = []) {
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
    equal(api.isTypeOf(document.all, 'undefined'), true);
    equal(api.isTypeOf(document.all, undefined), false);
    equal(api.toBoolean(document.all), false);
    equal(api.toObject(document.all), document.all);
  });
  // A protocol method can have [[Call]] without reporting typeof "function".
  // Keep this separate from isFunction(), whose public contract is literal typeof.
  for (const [name, key] of [
    ['isIterable', Symbol.iterator],
    ['isAsyncIterable', Symbol.asyncIterator],
    ['isIteratorLike', 'next'],
    ['isThenable', 'then'],
    ['isPromiseLike', 'then']
  ]) {
    test('callable HTMLDDA protocol method: ' + name, () => {
      const prototype = { [key]: document.all };
      if (name === 'isPromiseLike') prototype.catch = document.all;
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
  for (const mode of ['predicate', 'instanceOf']) {
    test('HTMLDDA matcher descriptor: ' + mode, () => {
      let calls = 0;
      const callback = (value) => {
        calls++;
        return value === 7;
      };
      function Target() {}
      Object.defineProperty(Target, Symbol.hasInstance, { value: callback });
      const selectors = {
        [mode]: { configurable: true, value: mode === 'predicate' ? callback : Target }
      };
      withMatcherSelectors(document.all, selectors, (descriptor) => {
        const shared = [descriptor];
        const check = api.createTypeChecker([shared, shared]);
        equal(calls, 0);
        equal(check(7), true);
        equal(check(8), false);
        equal(calls, 3);
        equal(api.isTypeOf(7, descriptor), true);
        equal(api.isTypeOf(8, descriptor), false);
        equal(api.isArrayOf([7], descriptor), true);
        equal(api.isArrayOf([8], descriptor), false);
        equal(api.isTypeOf(document.all, 'undefined'), true);
        equal(api.isTypeOf(document.all, undefined), false);
      });
    });
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
      (value) => throws(() => api.createTypeChecker(value))
    );
    equal(reads, 0);
    withMatcherSelectors(
      document.all,
      {
        predicate: { configurable: true, value: () => true },
        instanceOf: { configurable: true, value: Object }
      },
      (value) => throws(() => api.createTypeChecker(value))
    );
    withMatcherSelectors(document.all, {}, (value) => throws(() => api.createTypeChecker(value)));
  });
  test('shared pure matcher graph stays compact', () => {
    let spec = ['number'];
    for (let i = 0; i < 2000; i++) spec = [spec, spec];
    const check = api.createTypeChecker(spec);
    equal(check(1), true);
    equal(check('x'), false);
  });
  test('bound custom instance hooks are valid targets', () => {
    const f = () => {};
    Object.defineProperty(f, Symbol.hasInstance, { value: (x) => x === 7 });
    const bound = f.bind(null);
    equal(api.isTypeOf(7, bound), true);
    equal(api.isTypeOf(8, { instanceOf: bound }), false);
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
    equal(api.isTypeOf(new realm.Date(), Date), false);
    equal(api.isTypeOf(new realm.Date(), { predicate: api.isDate }), true);
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
  test('foreign arrow defers native instanceof errors', () => {
    const check = api.createTypeChecker(realm.eval('(x => true)'));
    equal(check(1), false);
    let failure;
    try {
      check({});
    } catch (error) {
      failure = error;
    }
    equal(failure instanceof realm.TypeError, true);
  });
  test('conversion: real NodeList and HTMLCollection', () => {
    const host = document.createElement('div');
    host.innerHTML = '<span>a</span><span>b</span>';
    const nodes = api.toArray(host.querySelectorAll('span'));
    equal(nodes.length, 2);
    equal(nodes[0], host.firstChild);
    equal(api.toArray(host.children)[1], host.lastChild);
  });
  test('conversion: document.all keeps native truthiness and object identity', () => {
    equal(api.toBoolean(document.all), false);
    equal(api.toObject(document.all), document.all);
    equal(api.toObjectIf(document.all, false), document.all);
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
    throws(() => api.toMap({ key: 1 }));
    throws(() => api.toSet({ 0: 1, length: 1 }));
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
  test('instance matchers accept callable HTMLDDA hooks', () => {
    function Target() {}
    Object.defineProperty(Target, Symbol.hasInstance, { value: document.all });
    equal({} instanceof Target, false);
    equal(api.createTypeChecker(Target)({}), false);
    equal(api.createTypeChecker({ instanceOf: Target })({}), false);
    equal(api.isTypeOf({}, Target), false);
    equal(api.isArrayOf([{}], Target), false);
  });
  test('matcher validation is independent of value', () => {
    throws(() => api.isTypeOf(1, ['number', 42]));
    const cycle = [];
    cycle.push(cycle);
    throws(() => api.createTypeChecker(cycle));
    equal(api.createTypeChecker(['string', null])('x'), true);
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
