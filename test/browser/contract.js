/* Browser black-box checks, shared by bundle verification and the explicit source-only run. */
globalThis.runGoTypesBrowserTests = function (api, metadata, names, sourceExamples = []) {
    const failures = [];
    let passed = 0;
    let skipped = 0;
    function test(name, body) {
        try {body(); passed++;} catch(error) {failures.push({name,message:String(error.stack||error)});}
    }
    function equal(actual,expected) {
        if (!Object.is(actual,expected)) throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
    }
    function exampleEqual(actual, expected) {
        if (expected && typeof expected === 'object') {
            equal(Array.isArray(actual), Array.isArray(expected));
            equal(Object.keys(actual).join(','), Object.keys(expected).join(','));
            for (const key of Object.keys(expected)) exampleEqual(actual[key], expected[key]);
        } else equal(actual, expected);
    }
    function throws(body) {
        try {body();} catch (error) {if (error instanceof TypeError) return; throw error;}
        throw new Error('Expected TypeError');
    }
    test('public export names',()=>equal(Object.keys(api).sort().join(','),[...names].sort().join(',')));
    for (const item of metadata) for (const example of item.examples) {
        if ((example.requires || []).some(name => typeof globalThis[name] === 'undefined')) {skipped++; continue;}
        test(`API example: ${example.expression}`,()=>{
            const evaluate = Function('api',`const {${names.join(',')}} = api; return (${example.expression});`);
            exampleEqual(evaluate(api),example.expected);
        });
    }
    for (const example of sourceExamples) {
        if ((example.requires || []).some(name => typeof globalThis[name] === 'undefined')) {skipped++; continue;}
        test(`Source JSDoc: ${example.expression}`, () => {
            const evaluate = Function(...names, `return (${example.expression});`);
            const expected = Function(`return (${example.expected});`)();
            exampleEqual(evaluate(...names.map(name => api[name])), expected);
        });
    }
    for (const [name, expected] of [
        ['isNullish',false],['isNonNullish',true],['isUndefined',false],
        ['isObject',true],['isObjectLike',true],['isPrimitive',false],
        ['isArrayLike',true],['isIterable',true],['isEmpty',false],['isBlank',false]
    ]) test('HTMLDDA boundary: '+name,()=>equal(api[name](document.all),expected));
    for(const input of [[document.all],new Set([document.all]),new Map([['x',document.all]]),{x:document.all}]) {
        test('HTMLDDA nested item is nonblank',()=>equal(api.isBlank(input),false));
    }
    test('HTMLDDA iterable item is nonblank',()=>equal(api.isBlankIterable([document.all]),false));
    test('HTMLDDA retains intentional native typeof and truthiness',()=>{
        equal(api.isTypeOf(document.all,'undefined'),true);
        equal(api.isTypeOf(document.all,undefined),false);
        equal(api.toBoolean(document.all),false);
        equal(api.toObject(document.all),document.all);
    });
    test('shared pure matcher graph stays compact',()=>{
        let spec=['number']; for(let i=0;i<2000;i++) spec=[spec,spec];
        const check=api.createTypeChecker(spec);equal(check(1),true);equal(check('x'),false);
    });
    test('bound custom instance hooks are valid targets',()=>{
        const f=()=>{};Object.defineProperty(f,Symbol.hasInstance,{value:x=>x===7});
        const bound=f.bind(null);equal(api.isTypeOf(7,bound),true);equal(api.isTypeOf(8,{instanceOf:bound}),false);
    });
    test('real DOM nodes',()=>{
        equal(api.isNode(document),true); equal(api.isNode(document.createTextNode('x')),true);
        equal(api.isElement(document.body),true); equal(api.isElement(document),false);
        equal(api.isFragment(document.createDocumentFragment()),true);
        equal(api.isFragment(document.body),false); equal(api.isNode({nodeType:1}),false);
    });
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const realm = iframe.contentWindow;
    test('foreign arrays and objects',()=>{
        equal(api.isArray(new realm.Array()),true);
        equal(api.isArrayOf(new realm.Array(1,2),'number'),true);
        equal(api.isPlainObject(new realm.Object()),true);
        equal(api.isObject(realm.Object.create(null)),true);
    });
    for (const [name,Constructor] of [['isDate','Date'],['isMap','Map'],['isSet','Set'],['isWeakMap','WeakMap'],['isWeakSet','WeakSet'],['isRegExp','RegExp'],['isError','Error']]) {
        test(`foreign ${Constructor}`,()=>equal(api[name](new realm[Constructor]()),true));
    }
    test('foreign binary types',()=>{
        const buffer = new realm.ArrayBuffer(8);
        equal(api.isArrayBuffer(buffer),true);
        equal(api.isDataView(new realm.DataView(buffer)),true);
        equal(api.isTypedArray(new realm.Uint8Array(buffer)),true);
    });
    test('foreign instance matching remains realm-sensitive',()=>{
        equal(api.isTypeOf(new realm.Date(),Date),false);
        equal(api.isTypeOf(new realm.Date(),{predicate:api.isDate}),true);
        equal(api.isPromise(realm.Promise.resolve()),false);
        equal(api.isNode(realm.document.body),false);
        equal(api.isElement(realm.document.body),false);
    });
    test('foreign arrow defers native instanceof errors',()=>{const check=api.createTypeChecker(realm.eval('(x => true)'));equal(check(1),false);let failure;try{check({});}catch(error){failure=error;}equal(failure instanceof realm.TypeError,true);});
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
        const input = {get valueOf() {throw Error('input was inspected');}};
        equal(api.toNumberIf(input, false), input);
        equal(api.toNumberIf('2', true), 2);
        throws(() => api.toNumberIf('2', async () => true));
    });
    iframe.remove();
    test('native Error.isError branch or conservative fallback',()=>{
        const error = new Error('x'); error[Symbol.toStringTag]='CustomError';
        equal(api.isError(error), typeof Error.isError==='function');
        equal(api.isError({[Symbol.toStringTag]:'Error'}),false);
        equal(api.isError(new DOMException('x')), typeof Error.isError==='function' ? Error.isError(new DOMException('x')) : false);
    });
    test('matcher validation is independent of value',()=>{
        throws(()=>api.isTypeOf(1,['number',42]));
        const cycle=[]; cycle.push(cycle); throws(()=>api.createTypeChecker(cycle));
        equal(api.createTypeChecker(['string',null])('x'),true);
    });
    test('empty checks do not consume a generator',()=>{
        function* values(){yield 1;yield 2;}
        const iterator=values(); throws(()=>api.isEmpty(iterator)); equal(iterator.next().value,1);
    });
    test('explicit consuming helper closes on early return',()=>{
        let closed=false;
        function* values(){try{yield 1;yield 2;}finally{closed=true;}}
        equal(api.isEmptyIterable(values()),false); equal(closed,true);
    });
    for (const name of ['Int8Array','Uint8Array','Uint8ClampedArray','Int16Array','Uint16Array','Int32Array','Uint32Array','Float32Array','Float64Array','BigInt64Array','BigUint64Array','Float16Array']) {
        if (typeof globalThis[name] !== 'function') {skipped++; continue;}
        test(name,()=>{
            const value = new globalThis[name](2);
            equal(api.isTypedArray(value),true); equal(api.isArrayBufferView(value),true);
            equal(api.isDataView(value),false); equal(api.isArray(value),false);
        });
    }
    if (typeof SharedArrayBuffer === 'function') test('SharedArrayBuffer identity',()=>{
        const value=new SharedArrayBuffer(8); equal(api.isSharedArrayBuffer(value),true); equal(api.isArrayBuffer(value),false);
    }); else {skipped++; test('absent SharedArrayBuffer is safe',()=>equal(api.isSharedArrayBuffer({}),false));}
    test('detached buffers retain native identity',()=>{
        const buffer=new ArrayBuffer(8), data=new DataView(buffer), typed=new Uint8Array(buffer);
        structuredClone(buffer,{transfer:[buffer]});
        equal(api.isArrayBuffer(buffer),true);equal(api.isDataView(data),true);equal(api.isTypedArray(typed),true);
    });
    if(typeof ArrayBuffer.prototype.resize==='function') test('out-of-bounds views retain identity',()=>{
        const buffer=new ArrayBuffer(8,{maxByteLength:16});
        const data=new DataView(buffer,4,4), typed=new Uint8Array(buffer,4,4);
        buffer.resize(0); equal(api.isDataView(data),true);equal(api.isTypedArray(typed),true);
    }); else skipped++;
    return {passed,failed:failures.length,skipped,failures,
        features:{nativeErrorCheck:typeof Error.isError==='function',sharedArrayBuffer:typeof SharedArrayBuffer==='function',float16Array:typeof Float16Array==='function',resize:typeof ArrayBuffer.prototype.resize==='function'}};
};
