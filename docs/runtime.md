# Runtime contract and native dependencies

## Supported environments and verification

CommonJS consumers, including public per-function imports, require Node.js 8.0.0 or later. Runtime source and the readable/minified UMD bundles support that baseline. Native default, named and per-function ES module imports require Node.js 14.0.0 or later, or Node.js 12.17.0 or later within the 12.x release line, without flags. The standalone ESM bundle targets Node 14; compatible bundlers can also consume the ESM entries. Browsers require ES2020 capabilities and the standard built-ins described here, with optional native features detected separately. Legacy ES3/ES5 browsers and arbitrary nonstandard JavaScript interpreters are not supported.

Development uses Node.js 22.16.0 or later, excluding Node.js 23; Node 24 is recommended. Development dependencies and the test runner do not raise the installed library's runtime requirement. CommonJS bundles target Node 8 and ES2017 minifier output; ESM bundles target Node 14.

The repository generates its publishable layout in `package/`. That directory becomes the installed package root, so consumer import paths are unchanged. Root/focused entry points, ESM wrappers, declaration redirects and browser bundles are generated together from the public inventory and canonical metadata.

Each function subpath provides default and named ESM exports and returns the function directly from CommonJS. Root and subpath imports share function identity; subpaths load only their implementation and dependencies.

All advertised CommonJS subpaths have physical forwarding files because Node 8 ignores package exports maps. These entries preserve function identity. Older Node can also resolve internal files on disk; those files remain unsupported implementation details, and export-map restrictions apply only on runtimes that implement them.

CI runs development verification on Node 22.16.0 and 24, and installed-consumer checks on Node 8.0.0, 8.17.0, 12.17.0, 13.0.0 and 14.0.0, on Linux and Windows. The Node 12.17 and Node 14 jobs also check native ESM imports and emitted TypeScript consumers. Chromium, Firefox and WebKit check the browser distributions. This matrix describes intended coverage, not completed verification; record actual results separately.

## Optional capabilities

An optional native API is optional across imports and operations, including the complete browser bundle. Missing collection constructors, binary-data constructors, `Symbol`, `Promise`, `Reflect`, BigInt or selected newer methods must not prevent unrelated functions from loading or working. This is capability isolation within the stated runtime contract; it does not establish support for older engine syntax or module loaders. ES5 foundations such as `Array.isArray`, array traversal methods, `Object.keys`, object reflection and `Object.freeze` remain required.

Native-type checks return `false` when their detection capability is unavailable. Binary-view checks reuse available native intrinsics without relying on spoofable tags; typed-array detection can use the native length getter without `Symbol` or `Reflect`. Missing `Symbol` makes synchronous and asynchronous iterable detection return `false`; actual iterable consumption still requires a working native iterator protocol. Collection conversion can recover the iterator key from array-prototype symbols using `Reflect.ownKeys` or `Object.getOwnPropertySymbols` when the Symbol global is absent, preserving iterable precedence. If the Symbol global and both reflection helpers are missing, supported synchronous iterables remain consumable through the language iterator protocol, but plain object and array-like source extensions throw because precedence cannot be established safely.

Object copying in `toArray`, `toSet`, `toMap` and `toPlainObject` needs `Reflect.ownKeys` or `Object.getOwnPropertySymbols` so symbol properties are never silently dropped. If both are missing, object copying throws. `toPlainObject` uses captured property-definition operations; array entries remain usable and skipped conditional calls preserve identity. Its iterator key can also be recovered from array-prototype symbols when the `Symbol` global is absent.

Rejecting boxed Symbol and BigInt collection sources depends on available captured native payload operations. Symbol unboxing can be recovered from an available iterator symbol when the Symbol global is absent. If the corresponding intrinsic is unavailable after globals or reflection helpers have been removed, a retained wrapper augmented with an iterator or indexed source may not be distinguishable portably from a supported custom object. This limitation also applies to plain-object conversion; missing capabilities do not add a tag-based identity guarantee.

Internal cycle reference tracking uses local array stores if weak collections or their required methods are absent. Numeric refinements and integer truncation retain their semantics using arithmetic fallbacks when the newer native methods are absent. Fallback reference lookup can cost more on large graphs. No globals are polyfilled.

`toMap`, `toSet`, `toSymbol`, `toBigInt`, `toPromise` and `toArray` require their native conversion capability (`Array.from` for arrays and `Promise.resolve` for promises). Missing support produces a descriptive `TypeError` only when conversion is requested, before inspecting or coercing the input. The `toSet` source adapter does not depend on `Array.from`; missing that array capability does not disable Set conversion. Conditional variants still return the original value when skipped and preserve invalid-condition and predicate errors. Detected Map/Set values with an unavailable required size/iteration operation produce an explicit `TypeError`; unrelated dictionary, string and array operations remain usable.

`box` uses captured `Object` boxing, preserving nullish input. `unbox` reads primitive values from wrapper objects using captured native intrinsics and preserves other values without custom hooks. Missing Symbol/BigInt constructors or their own payload methods leave retained wrappers unchanged. `toRegExp` constructs native expressions, with syntax/flag support determined by the host; its identity shortcut is restricted to RegExp objects.

Capabilities captured during initialization are selected once. Install any application-owned polyfills before importing the library. Modern runtimes remain the normal path. Verification removes capabilities before fresh source, installed root/focused imports, and readable/minified/ESM browser loads, both independently and together. Those absence tests supplement actual runtime and browser checks; they do not prove complete compatibility with historical browsers.

`ensureSet` requires native `Set` when called. It preserves Sets using captured, non-consuming size/has/values/entries/keys receiver checks. If none survive, opaque non-array object inputs fail clearly; primitive and array creation remain available where native construction permits. Missing `Set.prototype.add` prevents creation from members but does not prevent preserving a recognised Set or creating an empty Set. Imports and unrelated functions remain usable.

## Native-first policy

Use native operations when they match the contract. A captured reference continues to use the same function after its original property is reassigned. It does not authenticate earlier replacements, protect all invocation machinery or isolate the runtime from hostile code. Some globals and methods remain uncaptured. The library does not promise comprehensive protection against monkey-patching or include speculative polyfills.

| Dependency group        | Uses                                                                                                                                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Array identity          | Captured `Array.isArray`, including its specified revoked-Proxy exception.                                                                                                                                                                                                                            |
| Primitive wrappers      | Captured Boolean/Number/String `valueOf` methods for native internal data; ordinary overridden conversion properties are ignored.                                                                                                                                                                     |
| Date and RegExp         | Captured Date `getTime` and RegExp `source` getter, without executing a regular expression or mutating `lastIndex`.                                                                                                                                                                                   |
| Collections             | Native Map/Set/WeakMap/WeakSet receiver checks; captured size/values/entries operations for collection checks and native `forEach` for cycle traversal. WeakSet tracks active paths during cycle checks, with a local array fallback. Collection matcher validation needs no optional collection API. |
| Binary values           | Optional ArrayBuffer `isView` and byteLength getter; SharedArrayBuffer byteLength getter; DataView buffer getter; TypedArray tag/length getters. Detached/out-of-bounds values keep their type identity.                                                                                              |
| Error                   | Prefer captured `Error.isError` where available; otherwise conservative Object `toString` fallback rejecting customisable tags.                                                                                                                                                                       |
| Object inspection       | Object `keys`, `getPrototypeOf`, `getOwnPropertyDescriptor`, `freeze`; Function `toString`.                                                                                                                                                                                                           |
| Numeric and string work | Captured Number `isFinite`/`isInteger`/`isSafeInteger`, Math `floor`, RegExp `test`, String/Number payloads, and ordinary numeric conversion. Numeric refinements extract a boxed payload once; primitive numbers avoid intrinsic receiver calls.                                                     |
| Matcher validation      | Required primitive type-name strings or direct function predicates. Uses a frozen table of native typeof checks; validates primitive boolean callback results when reached. No constructor or instance-hook probing.                                                                                  |
| Protocols               | Symbol `iterator`, `hasInstance`, `toStringTag`, optional `asyncIterator`, normal `for...of` iterator closing and language operators. Without `Symbol.asyncIterator`, async-iterable detection returns `false` without reading the input.                                                             |
| Conversion              | Captured Array.from, Number, optional BigInt, Boolean, String, Object, Date and Symbol operations, Symbol valueOf and Math.trunc. Date/Symbol identity preservation and conditional execution follow the conversion guide.                                                                            |
| JSON                    | Captured `JSON.parse` and `JSON.stringify`. `isJson` checks whether string text parses; it does not establish arbitrary-object serialisability. `toJson` follows native serialisation rules, including `undefined` results and exceptions.                                                            |
| Host/native instances   | Promise and guarded DOM Node/Element/DocumentFragment constructors.                                                                                                                                                                                                                                   |

The supported Node baseline provides the required foundational built-ins; there is no dependency on third-party runtime packages. Browser host constructors are checked only when present. `SharedArrayBuffer` detection returns `false` when the feature is absent. Type-name strings retain native `typeof` semantics; explicit instance predicates retain native `instanceof` semantics.

Native BigInt conversion requires BigInt support (Node.js 10.4 or later). Without it, `toBigInt` throws `TypeError` with the message `Native BigInt conversion is unavailable in this runtime.` before coercing input. `toBigIntIf` still returns the original value when its condition is `false`, `undefined` or omitted, and preserves condition-validation and predicate errors. Requested conversions throw the same unsupported-feature error. No replacement object or global polyfill is substituted for a native bigint. BigInt literals, BigInt typed arrays and async-generator examples require their respective native features.

## Optional Node native classifiers

At module initialisation, a guarded `process.getBuiltinModule('node:util')` selects non-throwing classifiers for Boolean/Number/String wrappers, Dates, RegExps, Map/Set/weak collections, ArrayBuffers, SharedArrayBuffers and DataViews. Selected functions are captured; later reassignment of `util.types` properties does not replace those references.

These classifiers avoid using incompatible-receiver exceptions for ordinary negative results on Node. Browser consumers need no static `node:util` import, Node shim or third-party dependency. Browsers and Node versions without `getBuiltinModule` retain the intrinsic receiver checks. The lookup happens once, not on each check.

Numeric checks use a captured native Number-object classifier when available, then read the payload with the native `valueOf` method. Hosts without the classifier use the direct intrinsic receiver probe.

If optional resolver or namespace access fails during initialisation, the library uses its portable implementation. Supported classifier properties are read once into an internal snapshot, with each lookup guarded separately. An inaccessible or non-function property falls back for that capability without disabling other usable classifiers. This recovery does not catch errors from invoking a selected classifier or application callbacks.

Tests compare public native/fallback results across ordinary, foreign, detached, proxy-wrapped, altered-prototype and tag-spoofed values. Both paths preserve the same identity contract; neither authenticates a platform modified before library initialisation.

## Identity versus capability

Native receiver checks accept actual native values/subclasses across realms and reject ordinary prototype/tag imitations. Proxy wrappers around most native receiver-based types do not carry the receiver's internal data and are rejected. `Array.isArray` is different: it follows a live proxy's target and throws for a revoked proxy. Do not expect all type checks to have identical Proxy behaviour.

`isIterable`, `isAsyncIterable`, `isIteratorLike` and `isPromiseLike` check callable property presence without invoking those methods. A getter/proxy trap can still run or throw, and a present method can subsequently misbehave. `isPromiseLike` reads only `then`; it does not require a native Promise constructor, `catch` or `finally`. Callability includes `document.all` used as a method value; unlike `isFunction`, these checks are not restricted to values whose `typeof` is `"function"`. Classes and revoked callable proxies still pass method-presence checks but can fail when invoked.

`isPromise` uses the local constructor’s native `instanceof` rules. A promise from another realm can return `false`; an object inheriting `Promise.prototype` can return `true`. It does not prove native Promise identity. `isNode`, `isElement`, and `isDocumentFragment` have corresponding local-realm/prototype limitations. Use these only for that documented contract. Browser tests use real DOM nodes, not fake global constructors.

Without native `Error.isError`, errors with an own or inherited `Symbol.toStringTag`, and some DOMExceptions, can return `false`. The fallback refuses customisable tags without evaluating their getter, rather than claiming reliable branding from spoofable text. If `Symbol.toStringTag` is also unavailable, it returns `false` without inspecting the object, including for errors. The tag key is captured at initialization. Proxy `has` traps may still run when that key is available.

## Size, properties and graph boundaries

Array-like lengths are read once per collection check and must be primitive numeric safe integers >=0. Element values are then read live. Avoid mutating inputs from callbacks/getters. Length-based operations can be expensive for very large sparse values.

Plain dictionary empty/blank operations use own enumerable **string** keys; they exclude symbols and inherited properties. Strings, native Maps/Sets and valid array-like lengths are handled before unsized protocol checks. Unsized synchronous/async iterable and next-only capabilities take precedence over plain-dictionary handling, even when exposed by a plain object.

Handle iteration explicitly when consumption is intended. Native Map/Set collection checks ignore overridden iteration and size methods.

Cycle detection follows enumerable string properties, including inherited ones, plus Map keys and values and Set members. Ordinary properties are inspected first. Symbols, non-enumerable properties, weak collection entries and arbitrary iterable contents remain excluded. Captured native `forEach` operations inspect collection contents without using application iterators. Reusing a completed node is safe only for a stable graph. No graph or iterator operation guarantees termination on input that grows indefinitely through application code.

Native collection recognition can use captured receiver-checking methods, size getters or `forEach`. If local detection support is unavailable, such as when the corresponding constructor is absent before import, only ordinary properties are inspected. Recognised Maps/Sets without native `forEach` support throw `TypeError` when content traversal is needed. Missing capabilities do not prevent unrelated cycle checks or package loading.

## Browser nullish boundaries

Nullish means exactly `null` or `undefined`, not values loosely equal to `null`. `document.all` is non-nullish and non-primitive, and ordinary sized/iterable checks inspect its actual contents. Literal typeof-name matching and boolean conversion retain the browser's special `document.all` behaviour, known as HTMLDDA.

The supplied minified bundle uses Terser with comparison/typeof rewrites and pure-getter assumptions disabled. This preserves the distinctions above and observable property access. When bundling or minifying source in an application, preserve `document.all` semantics: rewriting strict null/undefined comparisons to `== null` changes this contract.

## Conversion boundaries

`parseJson` and requested `parseJsonIf` use captured native `JSON.parse`. JSON is a required foundational capability. Non-string input follows native string coercion; syntax, coercion and reviver errors propagate. Newer reviver source context is passed through when the host supplies it; no context is added on Node 8.

Scalar conversions retain native JavaScript coercion. `toBoolean` uses truthiness, not text parsing; `toString` uses string conversion, not JSON serialisation. Number conversion can round, underflow to zero, lose bigint precision, or return `NaN` and infinities. Integer conversion truncates that numeric result towards zero. Date conversion can return an invalid Date and follows native date-string parsing: explicit timezones are preferred for portable date-time text. Existing Date objects and primitive symbols retain identity as described in the [conversion guide](conversions.md).

Collection conversion validates its source shape. After unsupported-category guards, `toArray` and `toSet` use synchronous iterable values first, own enumerable string and symbol values from plain objects second, and supported non-plain array-like indices third. A plain object's `length` is data. Indexed fallback snapshots a primitive numeric safe-integer length at least zero, matching `isArrayLike`, then reads live indexed values; missing indices yield `undefined` and inherited indices may supply values. `toArray` rejects nullish input; `toSet` creates an empty Set.

`toMap` copies entries from enumerable string and symbol properties or consumes synchronous exact two-element array pairs with both own indices; explicit `undefined` is valid and any key type is allowed. Nullish input creates an empty Map. It has no array-like source fallback. `toPlainObject` copies plain objects or consumes strict pairs with primitive string/symbol keys; it creates a fresh ordinary object and does not box primitives.

Functions, boxed primitives, Dates and RegExps are rejected as collection sources before iterator inspection. Ordinary promises and native async-only collections without a supported synchronous source are rejected. Plain async-only objects are copied as data, including their enumerable symbol properties; no input is awaited. Getters, proxies and iterator methods may run or throw. Finite one-shot iterables are consumed and infinite inputs do not terminate.

Conditional converters evaluate a boolean condition or synchronous predicate once. A false, omitted or undefined condition returns the exact original input without inspection. Other condition values and non-boolean predicate results throw. Runtime support remains Node 8 for CommonJS with no third-party runtime dependencies.

## TypeScript boundaries

Root and focused CommonJS imports support strict consumers with `target: ES2017`, `lib: ["ES2017"]` and `skipLibCheck: false`. Legacy `moduleResolution: node` uses generated `typesVersions` redirects; modern Node16/NodeNext resolution uses the conditional export map. Default imports compiled to CommonJS require `esModuleInterop`. Named function subpath imports use native ESM with Node16, NodeNext or Bundler resolution; legacy resolution uses default subpath imports or named root imports. CommonJS subpath declarations describe the direct callable, without a named function property. The installed-package checks compile every public CommonJS alias and both CommonJS bundles with legacy and Node16 resolution and execute the emitted code on the requested runtime. Native ESM consumers receive default-only declarations for the readable and minified CommonJS bundles, and default plus named declarations for `go-types/dist/go-types.mjs`. Compiled ESM bundle imports execute on runtimes supported by each format; the standalone ESM bundle requires Node 14 or later.

Legacy CommonJS consumers require TypeScript 4.5 or later (verified with 4.5.2). Node16/NodeNext consumers require TypeScript 4.9 or later (verified with 4.9.5), and Bundler consumers require 5.0 or later (verified with 5.0.2). TypeScript 4.7.4 and 4.8.4 select legacy CommonJS declarations for native ESM imports of the readable and minified bundles, accepting invalid named imports. The compatibility suite therefore checks these bundle rejections alongside all public aliases at each supported module minimum. Use the documented default imports for those bundle paths; their named properties are available on the imported API object. The pinned contributor compiler also checks all module modes.

Importing ordinary checks does not require the ES2020 global `BigInt` interface. Boxed-bigint conversion uses the consumer's native wrapper declaration when available, or a self-contained structural result otherwise. Runtime BigInt availability remains a separate requirement; selecting newer compiler libraries does not add that feature to Node 8.

Declarations must reflect both true and false branches. Native/object-identity checks, including primitive-plus-boxed checks, return `boolean`: structural interfaces can be satisfied by values lacking native identity. This prevents unsafe failure-branch exclusion. `toDate` returns `Date` without claiming to preserve a structural subtype. Partial validators such as `isInteger` return `boolean`; `false` does not imply “not a number.” Capability, local-instance and prototype checks use conservative `boolean` declarations where a sound general narrowing cannot be guaranteed.

Collection predicates must accept an undefined receiver. Bind callbacks that depend on an object before supplying them; the library calls predicates directly. General `TypeGuard` annotations describe a narrowing result and cannot recover receiver requirements erased by a caller's type annotation.

Use native `typeof` checks for primitive narrowing. All four collection-content checks return `boolean`, including when passed a type guard: a sparse `number[]` can fail numeric validation, so a failed check cannot eliminate that structural type. The native `typeof` name `"undefined"` includes browser `document.all`.

## References

These platform references explain the native identity, conversion, iteration, module and type-system rules used by the implementation:

- https://tc39.es/ecma262/multipage/structured-data.html
- https://tc39.es/ecma262/multipage/abstract-operations.html
- https://tc39.es/ecma262/multipage/control-abstraction-objects.html
- https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html
- https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#the-htmlallcollection-interface
- https://nodejs.org/api/packages.html
- https://esbuild.github.io/api/
- https://nodejs.org/api/process.html#processgetbuiltinmoduleid
- https://nodejs.org/api/util.html#utiltypes
- https://www.typescriptlang.org/docs/handbook/type-compatibility.html

Platform documentation explains semantics; recorded test results establish which environments and cases were actually verified.
