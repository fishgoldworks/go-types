# Runtime contract and native dependencies

## Supported environments and verification

The package declares Node >=22. Runtime source and browser builds target ES2020 syntax plus the standard built-ins described here. Optional features are feature-detected. Legacy ES3/ES5 browsers and arbitrary nonstandard JavaScript interpreters are not supported.

The CI configuration targets Node 22 and 24 on Linux and Windows, plus Chromium. This matrix describes intended coverage, not completed verification. Record the environments and results of each run separately, and test generated artefacts as well as source.

## Native-first policy

Use native operations when they match the contract. A captured reference continues to use the same function after its original property is reassigned. It does not authenticate earlier replacements, protect all invocation machinery or isolate the runtime from hostile code. Some globals and methods remain uncaptured. The library does not promise comprehensive protection against monkey-patching or include speculative polyfills.

| Dependency group | Uses |
|---|---|
| Array identity | Captured `Array.isArray`, including its specified revoked-Proxy exception. |
| Primitive wrappers | Captured Boolean/Number/String `valueOf` methods for native internal data; ordinary overridden conversion properties are ignored. |
| Date and RegExp | Captured Date `getTime` and RegExp `source` getter, without executing a regular expression or mutating `lastIndex`. |
| Collections | Native Map/Set/WeakMap/WeakSet receiver checks; captured size/values/entries operations for container checks. WeakSet tracks active paths and a per-compilation WeakMap reuses shared union nodes. Pure subunions use Set-based deduplication. |
| Binary values | ArrayBuffer `isView` and byteLength getter; optional SharedArrayBuffer byteLength getter; DataView buffer getter; TypedArray tag getter. Detached/out-of-bounds values keep their type identity. |
| Error | Prefer captured `Error.isError` where available; otherwise conservative Object `toString` fallback rejecting customisable tags. |
| Object inspection | Object `keys`, `getPrototypeOf`, `getOwnPropertyDescriptor`, `freeze`; Function `toString`. |
| Numeric and string work | Captured Number `isFinite`/`isInteger`/`isSafeInteger`, Math `floor`, RegExp `test`, String/Number payloads, and ordinary numeric conversion. Numeric refinements extract a boxed payload once; primitive numbers avoid intrinsic receiver calls. |
| Compilation/invocation | Function `call`, TypeError construction, array traversal methods, WeakMap/WeakSet and Set. No constructibility probe. Instance errors are decided by native evaluation, not by calling a target during compilation. |
| Protocols | Symbol `iterator`, `asyncIterator`, `hasInstance`, `toStringTag`, normal `for...of` iterator closing and language operators. |
| Conversion | Captured Array.from, Number, BigInt, Boolean, String, Object, Date and Symbol operations, Symbol valueOf and Math.trunc. Date/Symbol identity preservation and conditional execution follow the conversion guide. |
| JSON | Captured JSON `parse`. There is no stringify/serialisability promise. |
| Host/native instances | Promise and guarded DOM Node/Element/DocumentFragment constructors. |

The supported Node baseline provides the required foundational built-ins; there is no dependency on third-party runtime packages. Browser host constructors are checked only when present. SharedArrayBuffer detection returns false when the feature is absent. Constructors/type-name matchers are caller-configured and retain native semantics.

## Optional Node native classifiers

At module initialisation, a guarded `process.getBuiltinModule('node:util')` selects non-throwing classifiers for Boolean/Number/String wrappers, Dates, RegExps, Map/Set/weak collections, ArrayBuffers, SharedArrayBuffers and DataViews. Selected functions are captured; later reassignment of util.types properties does not replace those references.

These classifiers avoid using incompatible-receiver exceptions for ordinary negative results on Node. Browser consumers need no static `node:util` import, Node shim or third-party dependency. Browsers, Node 22 versions without `getBuiltinModule`, and other hosts without that optional API retain the intrinsic receiver checks. The lookup happens once, not on each check.

Numeric checks use a captured native Number-object classifier when available, then read the payload with the native `valueOf` method. Hosts without the classifier use the direct intrinsic receiver probe.

If optional resolver or namespace access fails during initialisation, the library uses its portable implementation. This recovery does not catch application callback errors or change public error propagation.

Tests compare public native/fallback results across ordinary, foreign, detached, proxy-wrapped, altered-prototype and tag-spoofed values. Both paths preserve the same identity contract; neither authenticates a platform modified before library initialisation.

## Identity versus capability

Native receiver checks accept actual native values/subclasses across realms and reject ordinary prototype/tag imitations. Proxy wrappers around most native receiver-based types do not carry the receiver's internal data and are rejected. Array.isArray is different: it follows a live proxy's target and throws for a revoked proxy. Do not expect all type checks to have identical Proxy behaviour.

`isIterable`, `isAsyncIterable`, `isIteratorLike`, `isThenable` and `isPromiseLike` check callable property presence without invoking those methods. A getter/proxy trap can still run or throw, and a present method can subsequently misbehave. `isPromiseLike` deliberately requires both callable `then` and `catch`; `isThenable` only requires `then`.

`isPromise` remains native local-constructor instanceof, not an unspoofable Promise brand test. Foreign promises can return false; an object inheriting from Promise.prototype can return true. `isNode`, `isElement`, and `isFragment` have corresponding local-realm/prototype limitations. Use these only for that documented contract. Browser tests use real DOM nodes, not fake global constructors.

Without native Error.isError, genuine errors with custom/inherited Symbol.toStringTag and some DOMExceptions can return false. The fallback refuses customisable tags without evaluating their getter, rather than claiming reliable branding from spoofable text. Proxy `has` traps may still run.

## Size, properties and graph boundaries

Array-like lengths are read once per collection check and must be primitive numeric safe integers >=0. Element values are then read live. Avoid mutating inputs from callbacks/getters. Length-based operations can be expensive for very large sparse values.

Plain dictionary empty/blank operations use own enumerable **string** keys; they exclude symbols and inherited properties. Strings, native Maps/Sets and valid array-like lengths are handled before unsized protocol checks. Unsized synchronous/async iterable and next-only capabilities take precedence over plain-dictionary handling, even when exposed by a plain object.

The consuming helpers require synchronous iterables. Adapt a next-only iterator or handle asynchronous iteration outside these synchronous APIs. Native Map/Set container checks ignore overridden iteration and size methods. The generic iterable variants use the supplied public iterator protocol.

Cycle detection follows enumerable string properties, including inherited ones. It does not traverse Map/Set entries or symbol/non-enumerable properties. Reusing a completed node is safe only for a stable graph. No graph or iterator operation guarantees termination on input that grows indefinitely through application code.

## Browser nullish boundaries

Nullish means exactly `null` or `undefined`, not values loosely equal to null. `document.all` is non-nullish and non-primitive, and ordinary sized/iterable checks inspect its actual contents. Literal typeof-name matching and boolean conversion retain the browser's special `document.all` behaviour, known as HTMLDDA.

The supplied minified bundle uses Terser with comparison/typeof rewrites and pure-getter assumptions disabled. This preserves the distinctions above and observable property access. When bundling or minifying source in an application, preserve `document.all` semantics: rewriting strict null/undefined comparisons to `== null` changes this contract.

## Conversion boundaries

Conversions deliberately apply native coercion rather than type-checking first. This means object hooks can run, precision can be lost during bigint-to-number conversion, and results can be NaN, infinite or invalid Dates. Conditional converters evaluate a boolean condition or synchronous predicate once; a skipped conversion returns the untouched input. See [conversions.md](conversions.md).

Array conversion uses native Array.from length coercion and iterable precedence, unlike strict array-like validation. It consumes finite iterables; infinite inputs do not terminate. Date and Symbol conversions preserve genuine native identities; object conversion boxes primitives but does not parse JSON or clone objects.

## TypeScript boundaries

Declarations must reflect both true and false branches. Native/object-identity checks, including primitive-plus-boxed checks, return boolean: structural interfaces can be satisfied by values lacking native identity. This prevents unsafe failure-branch exclusion. `toDate` returns Date without claiming to preserve a structural subtype. Partial validators such as isInteger return boolean; false does not imply “not a number.” Capability/local-instance/prototype checks use conservative boolean declarations where a sound general narrowing cannot be guaranteed.

Only fixed number/string/boolean/bigint/symbol names and strict null/undefined matchers have narrowing overloads. All union arrays, dynamic names, predicate descriptors, and collection-content checks return boolean. The runtime matcher may accept only one member of a statically typed union, and a sparse number[] can fail a numeric element check. Native typeof-undefined includes document.all, so that name deliberately differs from the strict undefined matcher in both behaviour and declarations.

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
