# Migrating from 1.3.1 to 2.0.0

Version 2.0.0 retains all 45 root function names from the published 1.3.1 package, but intentionally changes several contracts. This guide covers the published upgrade path; the [API reference](API.md) describes the complete current contract.

## Runtime and imports

CommonJS consumers require Node.js 8.0.0 or later. Native ESM imports require Node.js 14.0.0 or later, or Node.js 12.17.0 or later within the 12.x release line. The old `engine: "node >= 0.10"` metadata was not a supported-runtime guarantee. Review the [runtime guide](runtime.md) for browser requirements and optional native features.

Existing root CommonJS imports continue to work:

<!-- prettier-ignore -->
```javascript
const Types = require('go-types');

Types.isArray([]);             // => true
```

Default and named ESM imports and focused imports are now supported. Public source paths such as `go-types/src/isArray` and `go-types/src/isArray.js` remain available. Use public APIs instead of deep-importing private implementation helpers such as `hasCircularReference`.

## Make predicate matchers explicit

In 1.3.1, a function matcher could run both an instance check and a truthiness-coerced function call. A bare function now requests native `instanceof` only; constructor bodies are never called. Wrap predicates in `{ predicate: fn }`, including inside union arrays:

```javascript
// Before
Types.isTypeOf(value, Types.isString);
Types.isArrayOf(items, Types.isObject);

// After
Types.isTypeOf(value, { predicate: Types.isString });
Types.isArrayOf(items, { predicate: Types.isObject });
```

Predicates receive the value only, without an object receiver, and must return a synchronous primitive boolean. Bind receiver-dependent methods or use an arrow adapter. Numbers, boxed booleans and promises are rejected; thrown callback errors propagate.

String matchers use primitive `typeof` categories. For example, `'number'` accepts `0`, while `Number` is an instance target and rejects `0`. Use `{ predicate: Types.isNumber }` to accept both primitive and boxed numbers. The `'object'` matcher retains `typeof null === 'object'`; use `Types.isObject` when null must be excluded.

## Validate matcher specifications before use

The supported string names are `undefined`, `object`, `boolean`, `number`, `bigint`, `string`, `symbol` and `function`. Misspellings and invalid alternatives now throw before the value is tested, including empty and non-array inputs:

<!-- prettier-ignore -->
```javascript
Types.isTypeOf(1, ['number', 42]);  // => throws TypeError
Types.isArrayOf([], 'nubmer');     // => throws TypeError
```

Descriptors require exactly one own data property named `predicate` or `instanceOf`; inherited modes and accessor modes are rejected. Nested union arrays must be acyclic. An empty union matches nothing, and an omitted matcher means `undefined`. See [type specifications](API.md#type-specifications) for the complete rules.

`isTypeOf` validates and snapshots its specification on each call. Collection-content checks prepare their matchers once per call and reuse them for the entries. Use the logic utilities in [go-fns](https://github.com/koyote130708/go-fns) to combine predicates into reusable functions.

## Separate collection contents from non-emptiness

Empty arrays and array-like values now pass valid element constraints. Express non-emptiness separately:

<!-- prettier-ignore -->
```javascript
Types.isArrayOf([], 'number');  // => true

const items = [];
Types.isNonEmptyArray(items) && Types.isArrayOf(items, 'number');  // => false
```

Array-like lengths must be primitive non-negative safe integers. Sparse indices use ordinary property reads, including inherited values. Native Map/Set validation uses live iteration; do not mutate those collections from validation callbacks.

## Check dictionaries and numeric text

`isPlainObject(Object.create(null))` is now `true`. Empty and blank checks also recognise null-prototype dictionaries. Classification uses prototype relationships rather than a mutable `constructor` field.

`isNumeric('')` and whitespace-only strings return `false`. Nonblank numeric strings still use finite-number conversion, including hexadecimal and exponential notation. Use a dedicated parser when a specific textual grammar is required.

## Choose consuming iterable checks deliberately

`isEmpty` and `isBlank` inspect sized containers and plain dictionaries without advancing iterators. Unsized synchronous/async iterables and next-only iterators throw `TypeError`. Other unsupported values, such as numbers and Dates, return `false`.

Use `isEmptyIterable` or `isBlankIterable` when consuming a synchronous iterable is intentional. Early completion closes the iterator; do not assume a one-shot iterator can be reused. Async-only iterables require caller-managed iteration. An infinite iterable containing only nullish values never completes a blankness check.

Blankness remains shallow. For a Map, `isBlank` checks values; `isBlankIterable` sees entry arrays, so a non-empty Map is not blank under the iterable operation. See [empty and blank checks](API.md#empty-and-blank-values).

## Review corrected native and cycle checks

Genuine native values are recognised across realms where documented; prototype/tag imitations are rejected. Promise and DOM instance checks retain their local-realm limitations. `isThenable` remains the protocol check for a callable `then` method.

`isCyclic` detects a reference to an active ancestor. Repeated primitive values and shared acyclic children are not cycles. It follows enumerable string properties, including inherited properties, but excludes symbols, non-enumerables and Map/Set contents. Getters and proxy traps may still run and throw; inputs must remain stable during traversal.

## Adopt new conversions and TypeScript declarations

The published 1.3.1 package did not include conversion utilities or TypeScript declarations. The new conversions are described in the [conversion guide](conversions.md); they are not implicit extensions of the predicate functions. In particular, `toBoolean('false')` uses truthiness, `toPlainObject` creates a fresh plain object, and `fromJson` parses any JSON root with an `unknown` TypeScript result.

Declarations cover root, focused and bundle imports. Fixed primitive/nullish checks narrow, while native identity checks, dynamic matchers and partial validators generally return `boolean` to avoid unsound false-branch narrowing. TypeScript interfaces are structural and cannot prove native identity. See the [TypeScript guidance](API.md#typescript) for module settings and narrowing boundaries.
