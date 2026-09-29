# API reference

All public functions are available from the root and documented per-function subpaths. Examples assume imports from `go-types`. Conversion behaviour is also summarised in [conversions.md](conversions.md).

## Shared contracts

These checks and the checker factory are not a schema validator or a security boundary. Exceptions from application callbacks, input getters, proxy traps and iteration are not silently swallowed. Non-mutating intrinsic receiver probes catch incompatible-receiver errors deliberately. No checker guarantees that an object's methods/prototype have not been replaced.

Native identity checks, partial refinements and collection-content checks return `boolean` in TypeScript. A structural interface cannot prove native identity, so a failed check cannot safely exclude that type. Date conversion returns `Date` and does not promise to preserve extra input properties.

Fixed primitive names `number`, `string`, `boolean`, `bigint` and `symbol`, and strict null/undefined matchers can narrow. Dynamic names, all unions, predicate descriptors and instance matchers return `boolean`, as do the native typeof names `object`, `function` and `undefined`.

A failed collection check can still leave a typed sparse array; failure must not erase that possibility.

<a id="isundefined"></a>

## isUndefined(value)

**Primitive.** Checks for undefined.

```js
isUndefined(undefined); // => true
isUndefined("x");       // => false
```

<a id="isnull"></a>

## isNull(value)

**Primitive.** Checks for null.

```js
isNull(null); // => true
isNull("x");  // => false
```

<a id="isboolean"></a>

## isBoolean(value)

**Primitive.** Checks for a primitive boolean or genuine boxed Boolean.

Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.

```js
isBoolean(false);              // => true
isBoolean(new Boolean(false)); // => true
isBoolean(0);                  // => false
```

<a id="isnumber"></a>

## isNumber(value)

**Primitive.** Checks for a primitive number or genuine boxed Number, including NaN and infinities.

Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.

```js
isNumber(NaN);           // => true
isNumber(new Number(1)); // => true
isNumber("1");           // => false
```

<a id="isstring"></a>

## isString(value)

**Primitive.** Checks for a primitive string or genuine boxed String.

Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.

```js
isString("x");             // => true
isString(new String("x")); // => true
isString(1);               // => false
```

<a id="issymbol"></a>

## isSymbol(value)

**Primitive.** Checks for a primitive symbol.

Symbol and BigInt checks reject boxed values.

```js
isSymbol(Symbol("x")); // => true
isSymbol("x");         // => false
```

<a id="isbigint"></a>

## isBigInt(value)

**Primitive.** Checks for a primitive bigint.

Symbol and BigInt checks reject boxed values.

```js
isBigInt(1n);  // => true
isBigInt("x"); // => false
```

<a id="isprimitive"></a>

## isPrimitive(value)

**Primitive.** Checks for null, undefined, boolean, number, bigint, string or symbol primitives.

The complement of isObject, including browser document.all as non-primitive. This differs from blindly treating every typeof-undefined value as the undefined primitive.

```js
isPrimitive(null);          // => true
isPrimitive(1n);            // => true
isPrimitive(new Number(1)); // => false
```

<a id="isnullish"></a>

## isNullish(value)

**Utility.** Checks for null or undefined.

Uses strict null/undefined comparisons. Browser document.all is an object, not a nullish value, despite its historical loose-equality behaviour.

```js
isNullish(null);      // => true
isNullish(undefined); // => true
isNullish(0);         // => false
```

<a id="isempty"></a>

## isEmpty(value)

**Utility.** Non-consuming check for nullish values or empty strings, arrays/array-likes, Maps, Sets and plain dictionaries.

Checks strings, genuine Maps/Sets and validated array-like lengths before inspecting protocols. Unsized iterator/iterable capabilities take precedence over dictionary keys and throw TypeError without calling next or an iterator method. This also applies to plain objects that expose these capabilities. The consuming variants accept synchronous iterables only; next-only iterators need an adapter, and asynchronous iteration must be handled by the caller.

Remaining plain dictionaries use own enumerable string keys. Other unsupported values, such as numbers or Dates, return false. Length/property getters can run; this is non-consuming, not universally side-effect-free.

```js
isEmpty(null);                // => true
isEmpty([]);                  // => true
isEmpty(new Map());           // => true
isEmpty(Object.create(null)); // => true
isEmpty([null]);              // => false
```

<a id="isblank"></a>

## isBlank(value)

**Utility.** Non-consuming shallow blankness check: nullish, whitespace-only string, or supported container holding only nullish values.

Uses the same dispatch order and unsized-input errors as isEmpty. Map blankness concerns values, Set blankness concerns items, and dictionary blankness concerns own enumerable string-keyed values. Unsized protocol capabilities take precedence over plain-dictionary handling. Not recursive: an empty string or object inside a container is not nullish.

```js
isBlank(" \t\n");                 // => true
isBlank([null,undefined]);        // => true
isBlank(new Map([["key",null]])); // => true
isBlank([""]);                    // => false
isBlank(0);                       // => false
```

<a id="istruthy"></a>

## isTruthy(value)

**Utility.** Applies JavaScript boolean coercion.

```js
isTruthy([]);                 // => true
isTruthy(new Boolean(false)); // => true
isTruthy(0n);                 // => false
```

<a id="isfalsy"></a>

## isFalsy(value)

**Utility.** Returns the complement of JavaScript boolean coercion.

```js
isFalsy(NaN); // => true
isFalsy("");  // => true
isFalsy([]);  // => false
```

<a id="isinteger"></a>

## isInteger(value)

**Number.** Checks for a finite integral number.

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

```js
isInteger(1);             // => true
isInteger(new Number(1)); // => true
isInteger(1.5);           // => false
```

<a id="issafeinteger"></a>

## isSafeInteger(value)

**Number.** Checks for an integer in [-9007199254740991, 9007199254740991].

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

```js
isSafeInteger(Number.MAX_SAFE_INTEGER);             // => true
isSafeInteger(new Number(Number.MAX_SAFE_INTEGER)); // => true
isSafeInteger(Number.MAX_SAFE_INTEGER + 1);         // => false
```

<a id="isfloat"></a>

## isFloat(value)

**Number.** Checks for a finite non-integer number.

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

```js
isFloat(0.5);             // => true
isFloat(new Number(0.5)); // => true
isFloat(1);               // => false
```

<a id="isfinite"></a>

## isFinite(value)

**Number.** Checks for a finite number.

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

```js
isFinite(1);             // => true
isFinite(new Number(1)); // => true
isFinite(Infinity);      // => false
```

<a id="isinfinite"></a>

## isInfinite(value)

**Number.** Checks for positive or negative infinity.

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

```js
isInfinite(-Infinity);             // => true
isInfinite(new Number(-Infinity)); // => true
isInfinite(NaN);                   // => false
```

<a id="isnan"></a>

## isNaN(value)

**Number.** Checks for NaN.

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

```js
isNaN(NaN);             // => true
isNaN(new Number(NaN)); // => true
isNaN("NaN");           // => false
```

<a id="isnumeric"></a>

## isNumeric(value)

**Number.** Accepts finite primitive/boxed numbers, primitive bigint values and non-whitespace strings that convert to finite numbers.

Uses standard numeric conversion syntax, not a decimal-only grammar. It rejects NaN, Infinity, empty/whitespace-only strings, boolean values, boxed BigInt values and arbitrary coercible objects.

```js
isNumeric(" 1e3 ");  // => true
isNumeric("0x10");   // => true
isNumeric(1n);       // => true
isNumeric("   ");    // => false
isNumeric(Infinity); // => false
```

<a id="istypeof"></a>

## isTypeOf(value, type)

**Matching.** Validates a type specification and checks a value against it.

See Type specifications for the matcher contract. No constructor coercion. Invalid type names, descriptors, union arrays and non-callable instance hooks are rejected before value matching. Callable instance targets are evaluated with native instanceof: prototype errors can occur at evaluation time. Omitted type means strict undefined, unlike the native typeof name "undefined", which also matches browser document.all.

```js
isTypeOf(1,"number");                    // => true
isTypeOf(null,"object");                 // => true
isTypeOf("12",Number);                   // => false
isTypeOf([], {predicate:Array.isArray}); // => true
```

<a id="isobject"></a>

## isObject(value)

**Object.** Accepts all non-null objects and functions.

Uses the object/function boundary rather than realm-specific instanceof Object. Includes the browser document.all object despite its legacy typeof-undefined behaviour.

```js
isObject(Object.create(null)); // => true
isObject(() => {});            // => true
isObject(null);                // => false
```

<a id="isplainobject"></a>

## isPlainObject(value)

**Object.** Checks for a null prototype or an ordinary Object prototype, including across realms.

Prototype-based classification, not proof of allocation history. An own constructor field is ordinary data and is not read. Deliberately assigning null/Object.prototype to another value can change this classification. It is not a schema or security check.

```js
isPlainObject({constructor:null});  // => true
isPlainObject(Object.create(null)); // => true
isPlainObject(new (class A {})());  // => false
```

<a id="iscyclic"></a>

## isCyclic(value)

**Object.** Detects a cycle through enumerable string-keyed properties, including inherited properties.

An active-ancestor edge is a cycle; repeated primitives or shared acyclic children are not. Traversal is iterative and completed shared nodes are visited once. Ignores symbols, non-enumerables and Map/Set entries. Assumes a stable graph; getters and proxy traps can run, mutate the graph or throw.

```js
isCyclic({a:1,b:{c:1}});                           // => false
isCyclic((()=>{const x={};x.self=x;return x;})()); // => true
```

<a id="isiterable"></a>

## isIterable(value)

**Protocol.** Checks for a callable Symbol.iterator method.

Does not invoke the iterator method. Method presence does not prove it returns a valid iterator. A property getter/proxy trap may run or throw.

```js
isIterable([]);         // => true
isIterable("");         // => true
isIterable({next(){}}); // => false
```

<a id="isarray"></a>

## isArray(value)

**Array.** Checks native array identity.

Uses a captured Array.isArray reference. Supports foreign arrays and non-revoked proxies around arrays. A revoked proxy throws TypeError, preserving native behaviour.

```js
isArray([]);                             // => true
isArray(new Uint8Array(2));              // => false
isArray(Object.create(Array.prototype)); // => false
```

<a id="isarrayof"></a>

## isArrayOf(value, type)

**Collection.** Checks whether every element of the array matches the supplied type specification.

Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Snapshots length once; reads values live through ordinary numeric property access. Missing indices read undefined unless inherited numeric properties provide values. Appends beyond the original length are ignored. An invalid exposed array length (for example from a Proxy) returns false.

```js
isArrayOf([1,2], "number");   // => true
isArrayOf([1,"x"], "number"); // => false
isArrayOf([], "number");      // => true
```

<a id="isarraylike"></a>

## isArrayLike(value)

**Array.** Checks for a non-function value whose numeric length is an integer from zero through Number.MAX_SAFE_INTEGER.

Reads length once and does not require every index to exist. Boxed length numbers, negative lengths, fractions, NaN and infinities are invalid. Accessors/proxy traps can run and throw.

```js
isArrayLike("");           // => true
isArrayLike({length:0});   // => true
isArrayLike({length:0.5}); // => false
isArrayLike(() => {});     // => false
```

<a id="isarraylikeof"></a>

## isArrayLikeOf(value, type)

**Collection.** Checks whether every element of the array-like value matches the supplied type specification.

Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Snapshots length once; reads values live through ordinary numeric property access. Missing indices read undefined unless inherited numeric properties provide values. Appends beyond the original length are ignored.

```js
isArrayLikeOf({0:1,length:1}, "number");   // => true
isArrayLikeOf({0:"x",length:1}, "number"); // => false
isArrayLikeOf({length:0}, "number");       // => true
```

<a id="ispair"></a>

## isPair(value)

**Array.** Checks actual array identity and length exactly two.

```js
isPair([1,2]);        // => true
isPair(new Array(2)); // => true
isPair([1]);          // => false
```

<a id="ismap"></a>

## isMap(value)

**Collection.** Checks genuine Map identity using captured, non-mutating native checks.

Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.

```js
isMap(new Map());                    // => true
isMap(Object.create(Map.prototype)); // => false
```

<a id="isset"></a>

## isSet(value)

**Collection.** Checks genuine Set identity using captured, non-mutating native checks.

Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.

```js
isSet(new Set());                    // => true
isSet(Object.create(Set.prototype)); // => false
```

<a id="isweakmap"></a>

## isWeakMap(value)

**Collection.** Checks genuine WeakMap identity using captured, non-mutating native checks.

Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.

```js
isWeakMap(new WeakMap());                    // => true
isWeakMap(Object.create(WeakMap.prototype)); // => false
```

<a id="isweakset"></a>

## isWeakSet(value)

**Collection.** Checks genuine WeakSet identity using captured, non-mutating native checks.

Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.

```js
isWeakSet(new WeakSet());                    // => true
isWeakSet(Object.create(WeakSet.prototype)); // => false
```

<a id="isfunction"></a>

## isFunction(value)

**Object.** Checks typeof value === "function".

Includes classes, generators and callable proxies. It does not guarantee that calling the value will succeed; a class cannot be invoked without new.

```js
isFunction(() => {});   // => true
isFunction(class A {}); // => true
isFunction({call(){}}); // => false
```

<a id="isdate"></a>

## isDate(value)

**Native object.** Checks genuine Date identity, regardless of timestamp validity.

Uses native identity checks across realms, not local instanceof. Ignores overridden getTime methods.

```js
isDate(new Date(NaN)); // => true
isDate("2026-01-01");  // => false
```

<a id="isvaliddate"></a>

## isValidDate(value)

**Native object.** Checks Date identity and finite timestamp validity.

Foreign dates are supported; overridden instance getTime methods are ignored. Non-Dates return false.

```js
isValidDate(new Date(0));   // => true
isValidDate(new Date(NaN)); // => false
isValidDate(0);             // => false
```

<a id="isinvaliddate"></a>

## isInvalidDate(value)

**Native object.** Checks Date identity and NaN timestamp invalidity.

Foreign dates are supported; overridden instance getTime methods are ignored. Non-Dates return false.

```js
isInvalidDate(new Date(NaN)); // => true
isInvalidDate(new Date(0));   // => false
isInvalidDate(0);             // => false
```

<a id="isregexp"></a>

## isRegExp(value)

**Native object.** Checks RegExp identity without executing the expression or changing lastIndex.

The browser fallback uses the intrinsic source getter; supports foreign instances, rejects RegExp.prototype and prototype/tag imitations.

```js
isRegExp(/x/g);             // => true
isRegExp(RegExp.prototype); // => false
isRegExp("/x/");            // => false
```

<a id="ispromise"></a>

## isPromise(value)

**Protocol.** Performs a local-realm native Promise instanceof check.

This is not an unforgeable native-brand check. Foreign promises can return false and objects inheriting Promise.prototype can return true. Does not subscribe, call then, or create a derived promise. Returns boolean in declarations.

```js
isPromise(Promise.resolve(1));   // => true
isPromise({then(){},catch(){}}); // => false
```

<a id="ispromiselike"></a>

## isPromiseLike(value)

**Protocol.** Checks for callable then and catch methods on a non-null object/function.

Retains the library-specific then-and-catch contract, which is stricter than JavaScript thenable detection and differs from TypeScript PromiseLike. Does not invoke either method.

```js
isPromiseLike({then(){},catch(){}}); // => true
isPromiseLike({then(){}});           // => false
```

<a id="isthenable"></a>

## isThenable(value)

**Protocol.** Checks for a non-null object/function with a callable then method.

Includes foreign/null-prototype objects. Does not invoke then. Shape detection is not proof of Promise/A+ behaviour.

```js
isThenable({then(){}}); // => true
isThenable({then:1});   // => false
```

<a id="iserror"></a>

## isError(value)

**Native object.** Uses captured Error.isError when available; otherwise checks ordinary untagged Error objects conservatively.

Fallback refuses custom/inherited Symbol.toStringTag without reading its getter, so genuine tagged errors/DOMExceptions may return false on older runtimes. Native branch follows the runtime. Not a security boundary; proxy traps may run.

```js
isError(new Error("x"));                 // => true
isError(Object.create(Error.prototype)); // => false
isError({name:"Error",message:"x"});     // => false
```

<a id="isnode"></a>

## isNode(value)

**DOM.** Checks instanceof the available local Node constructor.

Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.

```js
isNode(document);     // => true
isNode({nodeType:1}); // => false
```

<a id="iselement"></a>

## isElement(value)

**DOM.** Checks instanceof the available local Element constructor.

Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.

```js
isElement(document.createElement("div")); // => true
isElement({nodeType:1});                  // => false
```

<a id="isfragment"></a>

## isFragment(value)

**DOM.** Checks instanceof the available local DocumentFragment constructor.

Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.

```js
isFragment(document.createDocumentFragment()); // => true
isFragment({nodeType:1});                      // => false
```

<a id="isarraybuffer"></a>

## isArrayBuffer(value)

**Binary.** Checks genuine ArrayBuffer identity.

Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory.

```js
isArrayBuffer(new ArrayBuffer(8)); // => true
isArrayBuffer(new Uint8Array(8));  // => false
```

<a id="issharedarraybuffer"></a>

## isSharedArrayBuffer(value)

**Binary.** Checks genuine SharedArrayBuffer identity.

Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory. Returns false if SharedArrayBuffer is unavailable.

```js
isSharedArrayBuffer(new SharedArrayBuffer(8)); // => true
isSharedArrayBuffer(new Uint8Array(8));        // => false
```

<a id="isarraybufferview"></a>

## isArrayBufferView(value)

**Binary.** Uses captured ArrayBuffer.isView: typed arrays and DataView are views.

Supports foreign and detached views, rejects proxies and prototype imitations.

```js
isArrayBufferView(new Uint8Array(2));                // => true
isArrayBufferView(new DataView(new ArrayBuffer(8))); // => true
isArrayBufferView(new ArrayBuffer(8));               // => false
```

<a id="istypedarray"></a>

## isTypedArray(value)

**Binary.** Checks any native typed-array identity, excluding DataView and ordinary arrays.

Includes subclasses, foreign instances, detached/out-of-bounds views and Node Buffers. Uses native view identity plus an intrinsic typed-array tag getter, never an exposed custom tag. The declaration exposes a common structural surface rather than a particular element type.

```js
isTypedArray(new Uint8Array(2));                // => true
isTypedArray(new BigInt64Array(2));             // => true
isTypedArray(new DataView(new ArrayBuffer(8))); // => false
```

<a id="isdataview"></a>

## isDataView(value)

**Binary.** Checks genuine DataView identity.

Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory.

```js
isDataView(new DataView(new ArrayBuffer(8))); // => true
isDataView(new Uint8Array(8));                // => false
```

<a id="isasynciterable"></a>

## isAsyncIterable(value)

**Protocol.** Checks for a callable Symbol.asyncIterator method.

Does not invoke the method. Checks only the explicit async protocol, not synchronous iterables that for-await-of can adapt. Method presence does not prove valid iteration.

```js
isAsyncIterable((async function*(){})()); // => true
isAsyncIterable([]);                      // => false
```

<a id="isiteratorlike"></a>

## isIteratorLike(value)

**Protocol.** Checks for a non-null object/function with a callable next method.

Does not call next and cannot distinguish synchronous from asynchronous iteration. Does not assert a correct IteratorResult return shape.

```js
isIteratorLike({next(){}}); // => true
isIteratorLike([]);         // => false
isIteratorLike({next:1});   // => false
```

<a id="isnonnullish"></a>

## isNonNullish(value)

**Utility.** Checks for neither null nor undefined; useful with Array.filter.

The generic declaration narrows to NonNullable<T> without discarding 0, false, empty strings, NaN or 0n.

```js
isNonNullish(0);     // => true
isNonNullish(false); // => true
isNonNullish(null);  // => false
```

<a id="isobjectlike"></a>

## isObjectLike(value)

**Object.** Accepts non-null objects but excludes functions.

This is not a plain-object or dictionary check. Includes browser document.all as an object. Returns boolean in declarations because TypeScript object also includes functions.

```js
isObjectLike([]);       // => true
isObjectLike(() => {}); // => false
isObjectLike(null);     // => false
```

<a id="isnonemptyarray"></a>

## isNonEmptyArray(value)

**Array.** Checks actual array identity and length greater than zero.

A hole still contributes to array length. This is separate from element-type validation. An invalid exposed array length (for example from a Proxy) returns false.

```js
isNonEmptyArray([null]);       // => true
isNonEmptyArray(new Array(1)); // => true
isNonEmptyArray([]);           // => false
```

<a id="isjson"></a>

## isJson(value)

**Utility.** Checks whether primitive/boxed string text parses as JSON.

Accepts JSON scalars as well as objects/arrays. Does not validate a schema or serialisability of arbitrary JS values. Calls captured JSON.parse and ignores boxed-string coercion overrides. Parse once directly when the parsed value is needed.

```js
isJson("null");     // => true
isJson("[1,null]"); // => true
isJson("{bad}");    // => false
isJson({});         // => false
```

<a id="createtypechecker"></a>

## createTypeChecker(type)

**Matching.** Validates and snapshots a matcher structure once, returning a reusable synchronous checker.

Validates and snapshots each distinct union array once per compilation. Shared arrays stay shared, so repeated branches do not expand into a large tree. Only pure built-in checks are deduplicated; application predicates and instance hooks keep their order, repeat count and live state.

Compilation and evaluation are iterative. They do not use eval or generated source, and no cache is retained across separate calls. Prepare reusable checkers outside hot loops. An omitted type means undefined. Instance-target prototype errors are deferred to native evaluation; compilation does not probe whether a target can be constructed.

```js
createTypeChecker(["number",null])(1);   // => true
createTypeChecker(["number",null])("1"); // => false
createTypeChecker([])(undefined);        // => false
```

<a id="issetof"></a>

## isSetOf(value, type)

**Collection.** Checks whether every element of the Set matches the supplied type specification.

Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Uses captured native Set iteration, ignoring overridden iterator methods. Predicates must not mutate the collection: iteration is live and mutation can affect termination.

```js
isSetOf(new Set([1,2]), "number");   // => true
isSetOf(new Set([1,"x"]), "number"); // => false
isSetOf(new Set(), "number");        // => true
```

<a id="ismapof"></a>

## isMapOf(value, keyType, valueType)

**Collection.** Checks all Map keys and values using separate matchers.

Validates both matcher configurations before inspecting the input. Checks each key before its associated value. Uses native live entry iteration, ignores overridden iterator methods, and supports foreign Maps. Predicates must not mutate the collection.

```js
isMapOf(new Map([["x",1]]), "string", "number"); // => true
isMapOf(new Map(), "string", "number");          // => true
isMapOf(new Map([[1,1]]), "string", "number");   // => false
```

<a id="isemptyiterable"></a>

## isEmptyIterable(value)

**Protocol.** Explicitly consuming emptiness check for a synchronous iterable.

Advances until the first item or completion. Early false closes the iterator through native for-of semantics. May execute iterator return()/generator finally blocks. Rejects non-iterables. Do not reuse a one-shot iterator after the check.

```js
isEmptyIterable([]);                        // => true
isEmptyIterable((function*(){yield 1;})()); // => false
```

<a id="isblankiterable"></a>

## isBlankIterable(value)

**Protocol.** Explicitly consuming shallow blankness check for a synchronous iterable.

Checks raw yielded items, so a non-empty Map yields non-nullish entry arrays and is not blank, unlike isBlank(map), which checks values. Early false closes the iterator. A nullish-only infinite iterable never completes. Iteration/closing exceptions propagate.

```js
isBlankIterable((function*(){yield null;yield undefined;})()); // => true
isBlankIterable([0]);                                          // => false
```

<a id="toarray"></a>

## toArray(value)

**Conversion.** Creates a new shallow array from iterable or array-like input using Array.from.

Iterable input takes precedence over length. Strings are read as Unicode code points; sparse arrays become dense. Null and undefined throw TypeError. Values with neither an iterator nor a usable length produce an empty array. Native length coercion applies, unlike the stricter isArrayLike validator.

Conversion reads properties and consumes finite iterables; infinite iterables do not finish and large inputs can exhaust memory. No clone of nested values, object-entry conversion or scalar wrapping is performed.

```js
toArray(new Set([1, 2]));     // => [1,2]
toArray('A😀B');              // => ["A","😀","B"]
toArray({0: 'x', length: 1}); // => ["x"]
toArray(42);                  // => []
```

<a id="toarrayif"></a>

## toArrayIf(value, condition)

**Conditional conversion.** Applies toArray only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toArray contract.

```js
toArrayIf('ab', true);  // => ["a","b"]
toArrayIf('ab', false); // => "ab"
```

<a id="tobigint"></a>

## toBigInt(value)

**Conversion.** Converts a value to a primitive bigint with native BigInt conversion.

Accepts booleans, integral numbers and integer text, including hexadecimal, binary and octal forms. Fractional/non-finite numbers throw RangeError; invalid integer text throws SyntaxError; null, undefined and symbols throw TypeError. Empty/whitespace text becomes 0n. Already-rounded Number inputs cannot regain lost precision: pass bigint or integer text when exactness matters.

```js
toBigInt('9007199254740993') === 9007199254740993n; // => true
toBigInt(true) === 1n;                              // => true
toBigInt('0xff') === 255n;                          // => true
```

<a id="tobigintif"></a>

## toBigIntIf(value, condition)

**Conditional conversion.** Applies toBigInt only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toBigInt contract.

```js
toBigIntIf('42', true) === 42n; // => true
toBigIntIf('42', false);        // => "42"
```

<a id="toboolean"></a>

## toBoolean(value)

**Conversion.** Converts a value to a primitive boolean using JavaScript truthiness.

This is not a boolean-text parser. Nonempty strings such as 'false' and '0', arrays, and boxed false values are truthy. Object conversion hooks are not invoked. Browser document.all retains its platform-defined falsy behaviour.

```js
toBoolean(0);                  // => false
toBoolean('false');            // => true
toBoolean(new Boolean(false)); // => true
```

<a id="tobooleanif"></a>

## toBooleanIf(value, condition)

**Conditional conversion.** Applies toBoolean only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toBoolean contract.

```js
toBooleanIf(0, true);        // => false
toBooleanIf('false', false); // => "false"
```

<a id="todate"></a>

## toDate(value)

**Conversion.** Preserves genuine Date instances; otherwise constructs a Date from the input.

Genuine local, foreign, subclass and invalid Date instances are returned unchanged, not cloned. Other values use new Date(value): numbers are millisecond timestamps and strings use native date parsing. Invalid input can produce an invalid Date; symbols, bigint and coercion failures can throw. Omitted/undefined input produces an invalid Date rather than the current time.

Prefer ISO date-time strings with an explicit timezone for portable results; validate with isValidDate when required. The TypeScript return type is Date, not the input subtype: structurally Date-compatible inputs can require construction of a new Date without extra input properties.

```js
toDate(0).toISOString();                                               // => "1970-01-01T00:00:00.000Z"
toDate('2024-01-01T00:00:00.000Z').getTime();                          // => 1704067200000
isInvalidDate(toDate('not a date'));                                   // => true
(() => { const date = new Date(0); return toDate(date) === date; })(); // => true
```

<a id="todateif"></a>

## toDateIf(value, condition)

**Conditional conversion.** Applies toDate only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toDate contract.

```js
toDateIf(0, true).getTime(); // => 0
toDateIf(0, false);          // => 0
```

<a id="tointeger"></a>

## toInteger(value)

**Conversion.** Converts with Number, then truncates toward zero with Math.trunc.

Converts the entire value, not a numeric prefix: '12px' becomes NaN. Negative fractions truncate toward zero, not toward negative infinity. NaN, infinities and signed zero retain Math.trunc behaviour; this function does not guarantee a finite or safe integer. It does not clamp or substitute defaults. Use isInteger/isSafeInteger to validate the result. Symbols and failed object conversions can throw.

```js
toInteger('12.9');               // => 12
toInteger(-12.9);                // => -12
Number.isNaN(toInteger('12px')); // => true
Object.is(toInteger(-0.5), -0);  // => true
toInteger('1e3');                // => 1000
```

<a id="tointegerif"></a>

## toIntegerIf(value, condition)

**Conditional conversion.** Applies toInteger only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toInteger contract.

```js
toIntegerIf('4.8', true);  // => 4
toIntegerIf('4.8', false); // => "4.8"
```

<a id="tonumber"></a>

## toNumber(value)

**Conversion.** Converts a value to a primitive number using Number.

Native coercion is intentional: null, false and empty/whitespace strings become 0; true becomes 1; invalid numeric text becomes NaN. Unlike isNumeric, whitespace is not rejected. Symbols throw; object coercion hooks may run and throw. Bigints may lose precision or overflow to infinity. No locale parsing or safe-number guarantee is provided. Omitted/undefined input produces NaN.

```js
toNumber('12.5');               // => 12.5
toNumber('0x10');               // => 16
toNumber(null);                 // => 0
Number.isNaN(toNumber('12px')); // => true
```

<a id="tonumberif"></a>

## toNumberIf(value, condition)

**Conditional conversion.** Applies toNumber only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toNumber contract.

```js
toNumberIf('12', value => typeof value === 'string'); // => 12
toNumberIf('12', false);                              // => "12"
```

<a id="toobject"></a>

## toObject(value)

**Conversion.** Preserves objects and functions, boxes primitives, and creates an empty object for nullish input.

Uses native Object conversion; this is neither JSON parsing nor cloning. Non-nullish primitives become wrapper objects. Objects, arrays, functions and even revoked proxies are returned with their existing identity. Each null/undefined conversion creates a fresh ordinary object. Object-conversion hooks are not invoked.

```js
toObject(42).valueOf();                                                   // => 42
typeof toObject(42);                                                      // => "object"
toObject(null);                                                           // => {}
(() => { const object = {x: 1}; return toObject(object) === object; })(); // => true
```

<a id="toobjectif"></a>

## toObjectIf(value, condition)

**Conditional conversion.** Applies toObject only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toObject contract.

```js
typeof toObjectIf(42, true); // => "object"
toObjectIf(42, false);       // => 42
```

<a id="tostring"></a>

## toString(value)

**Conversion.** Converts a value to a primitive string using String.

Null becomes 'null' and undefined becomes 'undefined', not an empty string. Primitive symbols use their descriptive string. Arrays use native string conversion; objects may invoke coercion hooks. This is not JSON serialisation. Native exceptions propagate, including conversion of boxed symbols and objects that cannot produce a primitive.

```js
toString(42);            // => "42"
toString(null);          // => "null"
toString(Symbol('key')); // => "Symbol(key)"
toString([1, 2]);        // => "1,2"
```

<a id="tostringif"></a>

## toStringIf(value, condition)

**Conditional conversion.** Applies toString only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toString contract.

```js
toStringIf(42, true);  // => "42"
toStringIf(42, false); // => 42
```

<a id="tosymbol"></a>

## toSymbol(value)

**Conversion.** Preserves primitive symbols, unboxes genuine Symbol wrappers, or creates a new symbol from a description.

Genuine boxed symbols are unboxed intrinsically, including across realms; their overridden conversion hooks are not called. Other values follow native Symbol(description) conversion and may throw. Identical descriptions create distinct symbols; Symbol.for is not used. Omitted/undefined input creates a symbol without a description.

```js
toSymbol('key').description;                                                             // => "key"
toSymbol('key') !== toSymbol('key');                                                     // => true
(() => { const symbol = Symbol('key'); return toSymbol(Object(symbol)) === symbol; })(); // => true
```

<a id="tosymbolif"></a>

## toSymbolIf(value, condition)

**Conditional conversion.** Applies toSymbol only when a boolean condition or synchronous predicate returns true.

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toSymbol contract.

```js
typeof toSymbolIf('key', true); // => "symbol"
toSymbolIf('key', false);       // => "key"
```

## Matcher specification contract

| Specification | Meaning |
|---|---|
| A valid typeof name | Exact, case-sensitive typeof comparison; "object" includes null. |
| A boxed valid type-name string | Same comparison; unboxed intrinsically. |
| null / undefined | Strict identity; omitted type means undefined. |
| Function or {instanceOf: Function} | Native instanceof only; no constructor body is invoked. |
| {predicate: fn} | Synchronous primitive-boolean result; invoked without a descriptor receiver. |
| Nested arrays | Ordered unions, short-circuited during evaluation after complete validation. |
| Empty union [] | Matches no value. Empty Of collections still pass valid element constraints. |

Unknown type names, unsupported leaves, cyclic unions, selector accessors/inherited selectors, ambiguous descriptors and non-callable instance hooks throw TypeError.

Union element accessors are rejected rather than executed. Sparse union positions mean undefined; inherited numeric configuration is ignored. Repeated acyclic subarrays are compiled once per array identity. Pure built-in subunions are compacted without executing application code.

Configuration inspection can trigger proxy/prototype traps. Custom Symbol.hasInstance methods are not executed until matching and their exceptions propagate.

Callable instance targets are not preflighted for constructibility/prototype validity: native evaluation decides, including for bound functions. A primitive may return false where an object input throws a native TypeError.

Mutable constructors, instance hooks and callback closures are not frozen; only the descriptor/union structure is snapshotted. Application callbacks must be synchronous and must not mutate Map/Set inputs. Infinite or very large user-supplied structures have no built-in work budget.

Instances retain native realm/prototype semantics. Use {predicate: isDate} for cross-realm Date branding rather than a local Date instance matcher.

Composite matchers and collection validators return boolean in TypeScript; only fixed exact primitive/null/undefined overloads promise narrowing. Use normal control-flow checks when a dynamic validation result needs further refinement.
