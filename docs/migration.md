# Migrating from 1.3.x or the annotated source proposal

See [current runtime support](../README.md#runtime-support) for compatibility requirements.

Version **2.0.0** introduces deliberate API changes. All original 46 root names remain; the public API now contains **84 functions**, including 22 conversion utilities.

## 1. Distinguish predicates from instance targets

Earlier code could treat a function as either a constructor or a predicate and accept truthy coercion results. Bare functions now request native instance matching. Wrap predicate functions in `{predicate: fn}`.

```js
// Before
isTypeOf(value, isString);
isArrayOf(items, isObject);

// After
isTypeOf(value, { predicate: isString });
isArrayOf(items, { predicate: isObject });

// Constructors remain constructors; their bodies are never called by validation.
isTypeOf(value, Account);
isTypeOf(value, { instanceOf: Account });
```

Predicates are called with the checked value only, not with their descriptor, the collection, or the API namespace as a receiver. Their declaration now includes `this: undefined`, matching the existing runtime. Bind explicitly receiver-dependent callbacks (`{ predicate: policy.check.bind(policy) }`) or use an adapter (`{ predicate: value => policy.check(value) }`). Ordinary arrows, bound functions and receiver-independent callbacks remain supported. Methods whose types omit their receiver requirement still need caller care.

Migrate functions inside union arrays too. Predicates must return synchronous primitive booleans; numbers, Boolean objects and Promises are rejected. Exceptions from predicates and instance hooks propagate. A supplied async function is not awaited.

`'number'` is a primitive `typeof` check; `Number` is an instance target. Thus `isTypeOf(0, 'number')` is true, while `isTypeOf(0, Number)` is false. For the primitive-plus-boxed policy, use `{predicate: isNumber}`. `'object'` deliberately retains native `typeof null === 'object'`; use an explicit object predicate when null should be excluded.

## 2. Invalid matcher configuration is rejected before any value test

The eight supported names are `undefined`, `object`, `boolean`, `number`, `bigint`, `string`, `symbol`, and `function`. Misspellings throw. All alternatives are validated, even when an earlier alternative would match or the input collection is empty/not of the required kind.

<!-- prettier-ignore -->
```js
isTypeOf(1, ['number', 42]);   // => throws TypeError
isArrayOf([], 'nubmer');       // => throws TypeError
```

Descriptors must contain exactly one matcher mode as an own data property. Inherited fields, accessors and descriptors with both modes are invalid. Extra unrelated fields are ignored. Union arrays may nest deeply but must not contain cycles. Union element accessors are rejected without invocation; holes mean `undefined`, not inherited configuration.

An empty union is valid and matches no values. An omitted matcher means `undefined`. Configuration validation does not execute constructors or predicates, but inspection can trigger property access and proxy traps. Mutating an instance target or hook can affect later matches.

Compilation does not test whether callable targets are constructible or have valid prototypes: bound functions may delegate to hidden instance hooks. Native evaluation decides whether to throw a prototype-related `TypeError`. An empty collection need not invoke its instance matcher.

Use `createTypeChecker(specification)` to validate and snapshot the structure once for repeated checks. The library does not cache caller-owned mutable arrays between calls or generate and evaluate source code.

## 3. Empty typed collections are valid

`isArrayOf([], type)` and `isArrayLikeOf({length:0}, type)` now return `true` for a valid type specification. The new `isSetOf` and `isMapOf` functions follow the same rule. Express non-emptiness separately:

```js
isNonEmptyArray(items) && isArrayOf(items, 'number');
```

Array-like lengths must be primitive numeric integers between 0 and `Number.MAX_SAFE_INTEGER`. Reads use a length snapshot; element values are read live. Sparse slots use ordinary property reads. Inherited numeric properties can supply values. Map/Set callbacks must not mutate the collection being validated: iteration is native/live, not snapshotted, and mutation can change results or termination.

## 4. Null-prototype dictionaries qualify as plain objects

`isPlainObject(Object.create(null))` is now `true`. Empty and blank checks also recognise these dictionaries. Classification uses prototype relationships, not a writable `constructor` field. Cross-realm ordinary object prototypes are supported.

Arrays with ordinary array prototypes remain non-plain. Deliberately replacing an object's prototype with null changes this prototype-based classification; plainness is not a security or allocation-history guarantee.

## 5. Whitespace-only numeric text is rejected

`isNumeric('')` and `isNumeric(' \t\n')` are `false`. This is still a finite-number-convertibility check for nonblank strings, not a strict decimal grammar or locale parser. Hexadecimal and exponential strings retain their documented behaviour. Primitive BigInts are supported by the existing contract.

Boxed Number/String/Boolean checks still use native payloads rather than overridden coercion methods. Their TypeScript declarations return `boolean` rather than equating native identity with a structural wrapper interface. `isBigInt` and `isSymbol` remain primitive-only checks.

## 6. Default empty/blank checks no longer consume unsized iterables

Checks first handle nullish values, strings, genuine Map/Set values and valid array-like lengths. They then reject unsized values with callable `next` or iterator methods, including plain objects. Only remaining plain objects reach dictionary handling.

Native-container identity and valid lengths take precedence over iterator capabilities; plainness alone does not. Arrays with a disabled iterator can still be checked by length and index.

For an unsized iterator or sync/async iterable, `isEmpty` and `isBlank` throw `TypeError` rather than make an unsupported guess or advance the iterator. Other unsupported values, such as numbers or Dates, return `false`. Property getters/proxy traps can still run: non-consuming does not mean universally side-effect-free.

Use the new explicit synchronous iterable operations when consumption is intentional:

<!-- prettier-ignore -->
```js
const iterator = (function* () { yield null; yield 1; })();
// This inspection may consume and close the iterator; do not reuse it.
isBlankIterable(iterator);     // => false
```

`isEmptyIterable` stops at the first yielded item. `isBlankIterable` inspects yielded items until it sees a non-nullish value or reaches completion. Native early-return IteratorClose applies, including return/finally side effects and propagated closing errors. These operations require synchronous iterability; next-only iterators need an iterable adapter, and async-only iteration must be handled by the caller. Infinite nullish-only iterables never finish a blankness check.

Blankness remains shallow: `[null, undefined]` is blank but `['']` and `[{}]` are not. Map container blankness concerns **values**; explicit iteration of a Map instead yields entry arrays, so a non-empty Map is not blank under `isBlankIterable` even when its values are nullish.

## 7. Corrected identities and cycle detection

Native arrays/boxed values/Dates/RegExps/collections are recognised across realms and prototype/tag-only imitations are rejected. Captured native operations do not promise protection against an already-compromised runtime. A revoked array Proxy still throws according to the captured array operation.

`isCyclic` detects an edge to an active ancestor, not repeated primitive values or shared acyclic children. Traversal is iterative. It follows enumerable string properties, including inherited ones. It excludes symbols, non-enumerable properties and Map/Set contents. Getters may run, throw or mutate the graph; stable inputs are required.

Promise and DOM instance checks retain their local-realm and prototype-chain limitations. Do not replace `isThenable` with `isPromise` expecting cross-realm thenable support.

## 8. Imports, declarations and release tooling

Supported imports include `go-types`, `go-types/isArray`, `go-types/src/isArray`, and `go-types/src/isArray.js`, with analogous paths for every public function. CommonJS and ESM consumers have explicit declarations. Root CommonJS/ESM share the same function instances.

Private helper imports are not supported. Conversion functions are public at the root, focused subpaths, and conversion-directory compatibility aliases. Existing applications deep-importing private files must migrate to public APIs. `isJson` is now a supported root export.

The declarations intentionally avoid incorrect narrowing for native/object-identity checks and partial validators such as integer/blank/plain checks, capability checks and instance checks with arbitrary hooks. A plain boolean callback is not assumed to be a complete type predicate. Fixed exact primitive/null/undefined overloads narrow. Composite/dynamic matchers, predicate descriptors and collection-content checks deliberately return boolean. See `test/types/` for positive and negative branch checks.

The declared CommonJS minimum is Node 8.0.0; native ESM imports require Node.js 14.0.0 or later, or Node.js 12.17.0 or later within the 12.x release line. Public CommonJS aliases also resolve on Node 8 through generated forwarding files. Native BigInt conversion requires Node 10.4 or later; without it, requested conversions throw TypeError while skipped conditional conversions remain usable. Development tools require Node 22.16.0 or newer. There is no compatibility claim for the old Node 0.10 metadata. Regenerate the dependency lockfile when upgrading development tools and rebuild all browser artefacts. See [CONTRIBUTING.md](https://github.com/koyote130708/go-types/blob/master/CONTRIBUTING.md) for the verification sequence.

## 9. Supported conversion utilities

Eleven conversions and their eleven conditional counterparts are available as named root exports, focused imports such as `go-types/toNumber`, and the original-style `go-types/src/conversion/toNumber[.js]` paths. `go-types/conversion/toNumber[.js]` aliases are also supported. Each conversion is implemented and supported.

Applications that previously deep-imported conversion code should review these explicit contracts:

| Function                | Contract to review                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toArray`               | Uses `Array.from`: supports iterables, copies arrays, reads strings as code points and materialises sparse slots. Nullish input throws; a scalar without length/iteration gives an empty array. |
| `toInteger`             | Uses whole-value `Number` conversion followed by truncation, not `parseInt`. `"12px"` gives `NaN`; `"1e3"` gives 1000.                                                                          |
| `toObject` / `toString` | Perform native Object/String conversion instead of returning their input unchanged.                                                                                                             |
| `toSymbol`              | Preserves primitive symbols, unboxes genuine wrappers or creates a new symbol from a description.                                                                                               |
| `toDate`                | Preserves genuine Dates across realms; other inputs use `new Date(value)`.                                                                                                                      |
| Every `to…If`           | Requires a boolean or synchronous boolean-returning predicate. `false`, omitted or `undefined` skips conversion. Other values/results throw rather than using truthiness.                       |

Conversion-condition declarations encode the existing unbound callback invocation with `this: undefined`. A callback explicitly requiring an object receiver must be bound or called through an arrow adapter; it is no longer accepted as an unbound condition. Conversion results and runtime invocation behaviour are unchanged.

Numeric conversions can return `NaN` or infinities; Date conversion can return an invalid Date. No hidden fallback, numeric clamping, JSON parsing, asynchronous conversion, or locale-specific parsing is added. See the [API reference](API.md) for complete conversion contracts and the [conversion guide](conversions.md) for focused examples.

## TypeScript safety

Dynamic matcher types describe possible configurations, not an exhaustive union accepted by the actual runtime configuration. Collection validation may reject a sparse array whose declared element type otherwise matches. Neither failure justifies eliminating the whole corresponding type.

```ts
function label(value: number | string, matcher: 'number' | 'boolean') {
  if (isTypeOf(value, matcher)) return 'matched';
  // A number can fail the runtime 'boolean' matcher; refine it explicitly.
  return typeof value === 'string' ? value.toUpperCase() : String(value);
}

const isText = createTypeChecker('string');
const texts: string[] = [1, 'hello', null].filter(isText);
```

Checks using any union array (including readonly tuples) or predicate descriptor, and all collection-content checks, return `boolean` in declarations. Five fixed `typeof`-name overloads remain type guards: `"number"`, `"string"`, `"boolean"`, `"bigint"` and `"symbol"`. Strict `null`, `undefined` and omitted matcher overloads also narrow. The native `"undefined"` matcher includes browser `document.all`; use `isUndefined` or a strict `undefined` matcher when only the primitive is intended.

### Native identity is not a structural interface

`isBoolean`, `isNumber`, `isString`, `isDate`, `isRegExp`, the Map/Set/weak-collection checks, and the binary native-brand checks return `boolean`. `isArray`, `isNonEmptyArray` and `isObject` also use conservative boolean declarations: an interface may be structurally compatible with an array/object without satisfying the runtime classification. Both branches are deliberately conservative. Runtime results are unchanged.

For example, `{valueOf: () => true}` satisfies TypeScript's `Boolean` interface but is not a genuine boxed Boolean. A typed Proxy around a Date is rejected by the native Date check. Neither false result proves the input must have some other member of a union type.

```ts
function labelBoolean(value: Boolean | string): string {
  if (isBoolean(value)) return 'boolean';
  return typeof value === 'string' ? value.toUpperCase() : 'not a native Boolean';
}
```

Use `isTypeOf(value, 'number')` or `createTypeChecker('number')` when primitive-only narrowing is intended. Strict nullish helpers and primitive-only checks retain their type predicates. A successful native check verifies identity, not that user-replaceable methods or properties satisfy a schema.

`toDate(value)` now has the conservative return type `Date`. It still preserves genuine Dates and subclasses at runtime, but a structurally Date-compatible Proxy may be converted to a new Date without extra properties. `toDateIf(value, false)` continues to preserve the exact input type because it does not inspect or convert the input.

### Object conversion of primitive intersections

`ConvertedObject<T>` now checks for primitive types before its object-preservation branch. Inputs such as `string & { readonly length: number }` satisfy an object-shaped constraint in TypeScript but are still primitive values at runtime. `toObject()` and requested `toObjectIf()` conversions declare their wrapper result instead of incorrectly retaining the primitive/intersection type. Code treating the boxed result as a primitive must explicitly unbox it or keep the original input. Real objects and functions retain their types; a skipped conversion still returns the exact input type. JavaScript conversion behaviour is unchanged.

### Optional iterator declarations

`toArray()` and `toArrayIf(value, true)` now return `unknown[]` for an array-like input whose type declares a possibly present iterator, unless its iterator type is definitely nullish. Previously they could infer only the indexed element type even when the runtime consumed different iterable values. This corrects a declaration-only mismatch; conversion and accepted inputs are unchanged.

Definite `Iterable<T>` inputs still infer `T[]`, and plain `ArrayLike<T>` inputs retain their indexed inference. A false, omitted or undefined condition preserves the input type. Establish a definite iterable contract or refine each returned element before using type-specific methods. This protects visibly ambiguous types; it cannot recover members erased by an annotation or validate dishonest structural declarations.

### Optional native acceleration and ESM imports

Node hosts exposing `process.getBuiltinModule` use captured `node:util.types` classifiers for native brands. Other supported hosts keep the intrinsic fallback with the same public contract. No static Node import or third-party runtime dependency is added. Primitive-only fast paths remain direct checks.

Root named ESM exports now reference individual implementation modules for bundlers. The default export remains the same CommonJS namespace and all function identities remain shared. Native Node still evaluates the root module graph; use focused imports to avoid that startup cost.

## Shared matcher snapshots and callback work

Each shared union array is inspected once per compilation. There is no cache across separate `createTypeChecker` calls. Pure built-in branches can be compacted; repeated application predicates and instance hooks still execute at each position until a match stops evaluation.

A compact shared graph containing callbacks with side effects can therefore request exponentially many callback invocations. No result cache or hidden iteration limit changes that observable behaviour.
