# Migrating from 1.3.1 to 2.0.0

Version 2.0.0 removes `isTypeOf` and `isThenable`, renames `isCyclic` to `isCircular` and `isFragment` to `isDocumentFragment`, retains the other 41 root functions from 1.3.1, and adds 48 functions. Several contracts also change. This guide covers the published upgrade path; the [API reference](API.md) describes the complete current contract.

## Runtime and imports

CommonJS consumers require Node.js 8.0.0 or later. Native ESM imports require Node.js 14.0.0 or later, or Node.js 12.17.0 or later within the 12.x release line. The old `engine: "node >= 0.10"` metadata was not a supported-runtime guarantee. Review the [runtime guide](runtime.md) for browser requirements and optional native features.

Existing root CommonJS imports continue to work:

<!-- prettier-ignore -->
```javascript
const Types = require('go-types');

Types.isArray([]);             // => true
```

Default and named ESM imports and focused imports are now supported. Public source paths such as `go-types/src/isArray` and `go-types/src/isArray.js` remain available. Use public APIs instead of deep-importing private implementation helpers such as `hasCircularReference`.

## Rename isFragment to isDocumentFragment

Replace `isFragment` with `isDocumentFragment` in imports and calls, including function subpaths such as `go-types/isDocumentFragment`. The check still uses the local `DocumentFragment` constructor.

```javascript
import { isDocumentFragment } from 'go-types';

isDocumentFragment(document.createDocumentFragment()); // => true
```

## Replace isTypeOf and simplify collection matchers

`isTypeOf` is no longer exported. Use native `typeof` for primitive categories, a direct predicate such as `isNumber` for a library check, and native `instanceof` for a local class. No replacement dispatcher or `isInstanceOf` helper is provided.

In 1.3.1, a function matcher used `value instanceof type || !!type(value)`. This could invoke the function body and coerce its result. Choose the intended check explicitly when migrating; an instance predicate or direct function call alone does not reproduce every mixed case.

```javascript
// Before (1.3.1)
Types.isTypeOf(value, 'number');
Types.isTypeOf(value, Types.isString);
Types.isArrayOf(items, Account);

// After
typeof value === 'number';
Types.isString(value);
Types.isArrayOf(items, (value) => value instanceof Account);
```

The four collection checks now accept only primitive type-name strings or synchronous boolean predicates. Pass predicates directly: `isArrayOf(items, isNumber)`. For alternatives, use a predicate such as `value => typeof value === 'number' || value === null`, or compose predicates with go-fns. Literal `null`/`undefined`, boxed strings, matcher arrays and descriptor objects are not accepted.

Every matcher is required, including both Map matchers. Use `'undefined'` to check undefined items, or `value => value === null` for null items. Valid names are `'undefined'`, `'object'`, `'boolean'`, `'number'`, `'bigint'`, `'string'`, `'symbol'` and `'function'`. The `'object'` name includes `null`; `'number'` excludes Number wrappers. Pass `isNumber` to include Number wrappers.

Invalid or missing matchers throw before input inspection, even for empty collections or values of the wrong type. A predicate receives one value without a supplied receiver and must return a synchronous primitive boolean. Bind receiver-dependent methods or use an arrow adapter. Non-boolean results throw when reached; callback errors propagate. See [type specifications](API.md#type-specifications) for the complete contract.

## Separate collection contents from non-emptiness

Empty arrays and array-like values now pass valid element constraints. Express non-emptiness separately:

<!-- prettier-ignore -->
```javascript
Types.isArrayOf([], 'number');  // => true

const items = [];
Types.isArrayOf(items, 'number') && !Types.isEmpty(items);   // => false
```

Array-like lengths must be primitive non-negative safe integers. Sparse indices use ordinary property reads, including inherited values. Native Map/Set validation uses live iteration; do not mutate those collections from validation callbacks.

## Check dictionaries and numeric text

`isPlainObject(Object.create(null))` is now `true`. Empty and blank checks also recognise null-prototype dictionaries. Classification uses prototype relationships rather than a mutable `constructor` field.

`isNumeric('')` and whitespace-only strings return `false`. Nonblank numeric strings still use finite-number conversion, including hexadecimal and exponential notation. Use a dedicated parser when a specific textual grammar is required.

## Handle unsized iterators explicitly

`isEmpty` and `isBlank` inspect sized collections and plain dictionaries without advancing iterators. Unsized synchronous/async iterables and next-only iterators throw `TypeError`. Other unsupported values, such as numbers and Dates, return `false`.

Handle iteration explicitly when consumption is intended.

Blankness remains shallow. `isBlank` checks Map values and Set items. See [empty and blank checks](API.md#empty-and-blank-values).

## Replace isThenable with isPromiseLike

`isThenable` and its subpaths have been removed. Replace those imports and calls with `isPromiseLike`, which now checks for a callable `then` method. It no longer requires or reads `catch`; `finally` is also unnecessary.

<!-- prettier-ignore -->
```javascript
import { isPromiseLike } from 'go-types';

isPromiseLike({ then() {} });   // => true
isPromiseLike({ then: true });  // => false
```

The check does not invoke `then` or verify promise behaviour. Accessing `then` can run getters or proxy traps, and their errors propagate.

## Review corrected native and cycle checks

Native values are recognised across realms where documented; prototype/tag imitations are rejected. Promise and DOM instance checks retain their local-realm limitations. `isPromiseLike` checks for a callable `then` method without requiring a local Promise instance.

`isCyclic` has been renamed to `isCircular`. Update imports and calls, including function subpaths such as `go-types/isCircular`. The previous name is no longer exported.

`isCircular` now follows Map keys and values and Set members, in addition to enumerable string-keyed properties. Version 1.3.1 did not inspect collection contents. This can change `false` to `true` and expose getter errors in newly visited objects. Native content access ignores overridden iterators and instance methods.

Inherited enumerable properties remain included; symbols, non-enumerable properties, weak collection entries and arbitrary iterable contents remain excluded. A cycle returns to an object on the current path; shared acyclic objects are allowed. Getters and proxy traps may run and throw, and inputs must remain stable. See [cycle detection](API.md#iscircularvalue) for native capability limits.

## Adopt new conversions and TypeScript declarations

The published 1.3.1 package did not include conversion utilities or TypeScript declarations. The new conversions are described in the [conversion guide](conversions.md); they are not implicit extensions of the predicate functions. In particular, `toBoolean('false')` uses truthiness, `toPlainObject` creates a fresh plain object, and `parseJson` parses any JSON root with an `unknown` TypeScript result.

`toPlainObject` accepts plain objects and synchronous entry pairs. Strings throw `TypeError`. Requested `toPlainObjectIf` conversions follow the same rule; skipped calls return the original input unchanged.

Use `parseJson` to parse JSON text. If the result must be an object, validate it before use:

```javascript
import { parseJson, isPlainObject } from 'go-types';

const value = parseJson(text);

if (!isPlainObject(value)) {
  throw new TypeError('Expected a JSON object.');
}
```

The parsed object is already fresh. Calling `toPlainObject` is useful only when a separate shallow copy is needed. Passing the parsed value straight to `toPlainObject` also accepts entry arrays, so that composition does not replace an object-only JSON check.

Declarations cover root, focused and bundle imports. Fixed primitive/nullish checks narrow, while native identity checks, dynamic matchers and partial validators generally return `boolean` to avoid unsound false-branch narrowing. TypeScript interfaces are structural and cannot prove native identity. See the [TypeScript guidance](API.md#typescript) for module settings and narrowing boundaries.
