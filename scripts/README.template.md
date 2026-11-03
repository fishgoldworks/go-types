# Go Types

**Check JavaScript value types and convert values.**

[![Source line coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#development)
[![Documentation](https://img.shields.io/badge/docs-{{DOCS_COVERAGE}}%25-brightgreen.svg)](docs/API.md)

- **Version:** [{{VERSION}}](CHANGELOG.md)
- **Licence:** [MIT](LICENSE.md)

Check JavaScript values, validate collection contents, and convert values with explicit rules, including JSON serialisation, general JSON parsing and shallow plain-object copies. Import individual functions as needed. Type checks do not convert their inputs.

No runtime dependencies. TypeScript declarations included.

**[View full API documentation](docs/API.md)**

## Contents

{{TOC}}

## Installation

Using npm:

```sh
npm install go-types
```

Using Yarn:

```sh
yarn add go-types
```

### Runtime support

| Environment       | Requirement                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CommonJS          | Node.js 8.0.0 or later, including public per-function entry points.                                                                                                                                                      |
| ES modules        | Native default, named and per-function imports work on Node.js 14.0.0 or later, and Node.js 12.17.0 or later within the 12.x release line, without command-line flags. Compatible bundlers can also use the ESM entries. |
| Browser           | Modern browsers with ES2020 capabilities and the required standard built-ins; see the [runtime guide](docs/runtime.md). Legacy ES3/ES5 browsers are not supported.                                                       |
| BigInt conversion | Native BigInt support, available in Node.js 10.4 or later. Other functions remain usable when BigInt is unavailable.                                                                                                     |

On Node 8, `toBigInt` throws `TypeError`. Examples using bigint literals, BigInt typed arrays or async generators require those native features.

The package installs no global polyfills. Browser DOM checks return `false` when their corresponding constructors are absent. See [Development](#development) for the separate contributor runtime requirement.

## Usage

### ES modules

<!-- prettier-ignore -->
```javascript
import { isArray, isArrayOf, toNumber } from 'go-types';

isArray([]);                     // => true
isArrayOf([1, 2, 3], 'number');  // => true
toNumber('12.5');                // => 12.5
```

A default namespace import is also supported: `import Types from 'go-types'`.

### CommonJS

<!-- prettier-ignore -->
```javascript
const { isArray, isArrayOf, toNumber } = require('go-types');

isArray([]);                     // => true
isArrayOf([1, 2, 3], 'number');  // => true
toNumber('12.5');                // => 12.5
```

### Function subpaths

Each function subpath supports default and named ES module imports:

<!-- prettier-ignore -->
```javascript
import isArray from 'go-types/isArray';
import { toNumber } from 'go-types/toNumber';

isArray([]);                   // => true
toNumber('42');                // => 42
```

For CommonJS:

<!-- prettier-ignore -->
```javascript
const isArray = require('go-types/isArray');
const toNumber = require('go-types/toNumber');

isArray([]);                   // => true
toNumber('42');                // => 42
```

CommonJS subpaths return the function directly. Root and subpath imports refer to the same functions.

Function subpaths load the requested helper and its dependencies. Named root exports expose separate modules to bundlers; importing the default namespace requests the full API.

Conversion-directory imports such as `go-types/conversion/toNumber` and `go-types/src/conversion/toNumber.js` are also supported.

### Browser

Load Go Types from jsDelivr or host a bundle yourself:

- [Minified bundle](https://cdn.jsdelivr.net/npm/{{NAME}}@{{VERSION}}/dist/go-types.min.js)
- [Readable bundle](https://cdn.jsdelivr.net/npm/{{NAME}}@{{VERSION}}/dist/go-types.js)

The bundle exposes `Types`:

<!-- prettier-ignore -->
```html
<script src="https://cdn.jsdelivr.net/npm/{{NAME}}@{{VERSION}}/dist/go-types.min.js"></script>
<script>
  const { isArray, isArrayOf, toNumber } = Types;

  isArray([]);                     // => true
  isArrayOf([1, 2, 3], 'number');  // => true
  toNumber('12.5');                // => 12.5
</script>
```

The package also includes the readable `dist/go-types.js` and the browser ES module `dist/go-types.mjs`. When working from the source repository, `npm run build` generates the complete package, with bundles under `package/dist/`.

## Combining predicates with go-fns

Use [go-fns](https://github.com/koyote130708/go-fns) to negate or combine go-types checks. Install it separately when you need function composition:

```sh
npm install go-types go-fns
```

go-types stays focused on type checking and conversion; it does not depend on go-fns or re-export its helpers.

<!-- prettier-ignore -->
```javascript
import { isArray, isNumber, isString } from 'go-types';
import { not, or, and } from 'go-fns';

const isNotArray = not(isArray);
const isNumberOrString = or(isNumber, isString);
const isPositiveNumber = and(isNumber, value => value > 0);

isNotArray([]);                // => false
isNumberOrString('hello');     // => true
isPositiveNumber(3);           // => true
isPositiveNumber(-1);          // => false
isPositiveNumber('3');         // => false

const values = [1, 'hello', [], null];
values.filter(isNotArray);     // => [1, 'hello', null]
```

These helpers return synchronous boolean predicates: `not` negates a result, `or` stops at the first truthy result, and `and` stops at the first falsy result. Use synchronous callbacks; returned promises are treated as truthy values and are not awaited. See the [go-fns API reference](https://github.com/koyote130708/go-fns/blob/master/docs/API.md) for the full contracts.

### Convert conditionally

Use `applyIf` from go-fns 2.0.0 or later to apply a conversion conditionally. The go-fns declarations require TypeScript 5.4 or later.

<!-- prettier-ignore -->
```javascript
import { applyIf } from 'go-fns';
import { isBlank, toNumber, parseJson } from 'go-types';

applyIf('42', text => !isBlank(text), toNumber);   // => 42
applyIf('invalid', false, parseJson);              // => 'invalid' (parsing skipped; otherwise throws SyntaxError)
```

A truthy predicate result applies the conversion; a falsy result returns the original input unchanged. Direct conditions must be booleans. Predicates are evaluated synchronously; returned promises are truthy and are not awaited. See the [go-fns API reference](https://github.com/koyote130708/go-fns/blob/master/docs/API.md#applyifvalue-condition-transform).

## API summary

See the **[full API documentation](docs/API.md)** for parameters, return values, errors and examples.

{{API_SUMMARY}}

## Behaviour

Type checks do not convert their inputs. Scalar conversions follow native coercion: `toBoolean` uses truthiness, `toString` is not JSON serialisation, and numeric/date results can lose precision or be invalid.

`toArray` and `toSet` select synchronous iterable values, then values from own enumerable string and symbol properties, then supported non-plain array-like indices with strict numeric lengths. `toMap` copies object entries (including symbols) or consumes exact two-element array pairs with both own indices. Unsupported inputs throw; see the [conversion guide](docs/conversions.md).

Ordinary failed checks return `false`. Invalid matcher configurations and unsupported inputs can throw; callback, getter, proxy, coercion and iterator errors propagate. These checks are not schema validation or a security boundary.

`isEmpty` and `isBlank` inspect [supported collections](docs/API.md#empty-and-blank-values) and reject unsized iterators and iterables without consuming them. Handle iteration explicitly when consumption is intended.

Collection checks accept a required native `typeof` name or predicate evaluated using JavaScript truthiness. For example, `isArrayOf(items, 'number')` accepts primitive numbers; `isArrayOf(items, isNumber)` also accepts Number wrappers. Use `value => value instanceof Account` for class instances. Empty collections pass valid checks. See [type specifications](docs/API.md#type-specifications) for callback and traversal rules.

### Check required text and tags

Check the expected type before inspecting its contents. A non-empty array can still contain invalid items:

<!-- prettier-ignore -->
```javascript
import { isString, isArrayOf, isEmpty, isBlank } from 'go-types';

const hasText = value => isString(value) && !isBlank(value);
const hasTags = value => isArrayOf(value, hasText) && !isEmpty(value);

hasText('Release notes');        // => true
hasText('   ');                  // => false
hasText(42);                     // => false
hasTags(['urgent', 'review']);   // => true
hasTags([]);                     // => false
hasTags(['urgent', '   ']);      // => false
hasTags([null]);                 // => false
hasTags('urgent');               // => false
```

`isArrayOf` checks the array and every item; `!isEmpty` adds the requirement for at least one tag. Collection blankness is shallow: `isBlank(['   '])` is `false`. Use an element predicate to validate text inside a collection. See [empty and blank values](docs/API.md#empty-and-blank-values) for other type/content combinations and mixed-value filtering.

### Normalise a single item or an array

<!-- prettier-ignore -->
```javascript
import { ensureArray } from 'go-types';

ensureArray();                             // => []
ensureArray(undefined);                    // => [undefined]
ensureArray('hello');                      // => ['hello']
ensureArray(null);                         // => [null]

const selection = new Set([1, 2]);
ensureArray(selection)[0] === selection;   // => true

const items = [1, 2];
ensureArray(items) === items;              // => true
```

With no arguments, `ensureArray()` creates an empty array. Arrays are returned unchanged; other supplied values, including `null` and `undefined`, become one item. Use `toArray` to extract iterable, object or array-like contents into a new array.

### Normalise a single item, an array or a Set

<!-- prettier-ignore -->
```javascript
import { ensureSet, toArray } from 'go-types';

ensureSet('read').has('read');                   // => true
toArray(ensureSet(['read', 'write', 'read']));   // => ['read', 'write']
ensureSet().size;                                // => 0
ensureSet(undefined).has(undefined);             // => true

const permissions = new Set(['read', 'write']);
ensureSet(permissions) === permissions;          // => true
```

Existing Sets are returned unchanged. Arrays supply members; other supplied values, including strings, Maps, `null` and `undefined`, become one member. Use `toSet` to extract other supported collection contents into a new Set. See [`ensureSet`](docs/API.md#ensuresetvalue) for native API requirements and iteration rules.

### Create plain objects

<!-- prettier-ignore -->
```javascript
import { toPlainObject } from 'go-types';

toPlainObject({ a: 1 });               // => ({ a: 1 })
toPlainObject(new Map([['a', 1]]));    // => ({ a: 1 })
toPlainObject([['a', 1], ['b', 2]]);   // => ({ a: 1, b: 2 })
```

Copying a plain object preserves nested references and includes only its own enumerable string and symbol properties. Strings, nullish input, boxed primitives and malformed entries throw. Use `parseJson` to parse JSON text. See [plain-object conversion](docs/conversions.md#plain-object-conversion) for the complete contract.

### Parse JSON

<!-- prettier-ignore -->
```javascript
import { parseJson } from 'go-types';

parseJson('{"a":1}');          // => ({ a: 1 })
parseJson('[1,2]');            // => [1, 2]
parseJson('false');            // => false
parseJson('null');             // => null
```

`parseJson(value, reviver?)` follows native `JSON.parse`, including revivers and parsing errors. Its TypeScript result is `unknown` until validated. See [JSON parsing](docs/conversions.md#json-parsing) for reviver order, optional source context and coercion rules.

### Serialise JSON

<!-- prettier-ignore -->
```javascript
import { toJson } from 'go-types';

toJson({ a: 1 });                // => '{"a":1}'
toJson('hello');                 // => '"hello"'
toJson({ a: 1, b: 2 }, ['a']);   // => '{"a":1}'
```

Native `JSON.stringify` rules apply: the result can be `undefined`, and cycles or unhandled bigints throw. See [JSON serialisation](docs/conversions.md#json-serialisation) for options, hooks and limitations.

### Box values, create patterns and adopt promises

<!-- prettier-ignore -->
```javascript
import { box, unbox, toRegExp, toPromise, isPromise } from 'go-types';

box(3).valueOf();                  // => 3
unbox(new Boolean(false));         // => false
box(null);                         // => null
toRegExp('a.b', 'i').test('AxB');  // => true
isPromise(toPromise(3));           // => true
```

`box` preserves existing objects and nullish input. `unbox` extracts primitive values from wrapper objects without invoking custom conversion methods. `toRegExp` uses native pattern syntax; it does not escape text. `toPromise(value)` adopts values and thenables with native `Promise.resolve` semantics. See the [conversion guide](docs/conversions.md#boxing-and-unboxing) for identity, missing-API and TypeScript details.

## TypeScript

TypeScript declarations are included; no separate `@types` package is required.

Declarations cover root, per-function and bundle imports. Use native `typeof` for primitive narrowing; `isNotNullish` also narrows filtered values. Native identity and collection-content checks return `boolean`. `toDate()` returns `Date` without promising extra input properties.

<!-- prettier-ignore -->
```typescript
const value: unknown = 'hello';

if (typeof value === 'string') {
  value.toUpperCase();         // => 'HELLO'
}
```

Consumer declarations support TypeScript 4.5 or later; legacy CommonJS resolution is verified with 4.5.2. Additional module-resolution requirements are:

- **Node16/NodeNext:** TypeScript 4.9 or later, preserving native ESM bundle import validation (verified with 4.9.5).
- **Bundler:** TypeScript 5.0 or later (verified with 5.0.2).

The readable and minified CommonJS bundles provide a default import from native ESM; `go-types/dist/go-types.mjs` provides both default and named imports. Default imports compiled to CommonJS require `esModuleInterop`; Node16 and NodeNext consumers use conditional exports.

Strict CommonJS consumers can target ES2017 with ES2017 libraries and `skipLibCheck: false`. Compiler libraries do not add optional native features to older runtimes. See the [declaration details](docs/API.md#typescript) for the full contracts.

## Performance

Collection checks validate their matchers once per call and reuse them for the entries. Type-name strings use shared checks; predicates run only for reached values, with no result caching.

Use [function subpaths](#function-subpaths) to load the requested helper and its dependencies. Bundlers can omit unused named ESM exports; the default namespace exposes the full API.

From a source checkout, run:

```sh
npm run benchmark
```

Measurements depend on the workload and runtime; they are not universal speed guarantees. The [performance guide](https://github.com/koyote130708/go-types/blob/master/docs/performance.md) explains the hot paths, trade-offs and comparison methodology.

## Migration

Version 2.0.0 removes `isTypeOf` and `isThenable`, renames `isFragment` to `isDocumentFragment`, uses a callable-`then` check for `isPromiseLike`, simplifies collection matchers to required type-name strings or predicates, changes collection and runtime contracts, and adds TypeScript declarations. Empty collections pass valid element constraints; invalid or missing matchers throw before matching.

Read the [migration guide](docs/migration.md) and [changelog](CHANGELOG.md) before upgrading from version 1.

## Development

Use npm for development. Contributor tools require Node.js 22.16.0 or later, excluding Node.js 23; Node 24 is recommended. This requirement is separate from [consumer runtime support](#runtime-support). Contributor checks use TypeScript 5.8.3.

```sh
npm ci
npm run docs
npm run build
npm test
```

Edit `scripts/README.template.md` for this overview, `scripts/API.template.md` for shared contracts, `scripts/readme.js` for the reference layout and `scripts/api.json` for function descriptions, notes and source examples. `npm run docs` regenerates `README.md`, `docs/API.md`, source comments and declaration tooltips. Run it before `npm run build`, which assembles the consumer package under `package/`, including browser bundles in `package/dist/`. Use `npm run test:docs` to check documentation freshness.

Run the standard verification gate:

```sh
npm run verify
```

`npm run verify` checks lint, formatting, generated documentation, source coverage, declarations, build recovery, package contents and installed consumers. `npm run verify:all` adds Chromium, Firefox and WebKit checks against the same archive, including the browser bundles and README example.

See the [development guide](https://github.com/koyote130708/go-types/blob/master/CONTRIBUTING.md) for exact-runtime selection, browser setup, local installation, build recovery and release procedures.

The coverage badge measures executable source-line coverage. The documentation badge measures public API reference coverage. Neither badge guarantees correctness for every input.

## Further reading

- [Full API documentation](docs/API.md): signatures, parameters, examples and behavioural contracts.
- [Changelog](CHANGELOG.md): release changes and migration from version 1.
- [Development guide](https://github.com/koyote130708/go-types/blob/master/CONTRIBUTING.md): contributor setup, verification, builds and release procedures.
- [Conversion guide](docs/conversions.md): coercion, identity, precision and conditional conversion.
- [Runtime guide](docs/runtime.md): supported features, native checks and declaration boundaries.
- [Testing guide](https://github.com/koyote130708/go-types/blob/master/docs/project-testing.md): validation strategy and commands.

## Licence

Licensed under the [MIT licence](LICENSE.md).
