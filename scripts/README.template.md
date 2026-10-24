# Go Types

**Check JavaScript value types and convert values.**

[![Source line coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#development)
[![Documentation](https://img.shields.io/badge/docs-{{DOCS_COVERAGE}}%25-brightgreen.svg)](docs/API.md)

- **Version:** [{{VERSION}}](CHANGELOG.md)
- **Licence:** [MIT](LICENSE.md)

Check JavaScript values, validate collection contents, and convert values with explicit rules, including JSON serialisation, general JSON parsing and shallow plain-object copies. Import individual functions as needed. Type checks do not convert their inputs; conversions are explicit.

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

On Node 8, `toBigInt` and requested `toBigIntIf` conversions throw `TypeError`. Skipped conditional conversions return the original value. Examples using bigint literals, BigInt typed arrays or async generators require those native features.

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

<!-- prettier-ignore -->
```javascript
import isArray from 'go-types/isArray';
import toNumber from 'go-types/toNumber';

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

## API summary

See the **[full API documentation](docs/API.md)** for parameters, return values, errors and examples.

{{API_SUMMARY}}

## Behaviour

Type checks do not convert their inputs. Scalar conversions follow native coercion: `toBoolean` uses truthiness, `toString` is not JSON serialisation, and numeric/date results can lose precision or be invalid. Conditional conversions require a boolean or synchronous predicate returning a primitive boolean; `false`, omitted or `undefined` conditions leave the input untouched.

`toArray` and `toSet` select synchronous iterable values, then own enumerable string and symbol record values, then supported non-plain array-like indices with strict numeric lengths. `toMap` copies record entries (including symbols) or consumes exact two-element array pairs with both own indices. Unsupported inputs throw; see the [conversion guide](docs/conversions.md).

Ordinary failed checks return `false`. Invalid matcher configurations and unsupported inputs can throw; callback, getter, proxy, coercion and iterator errors propagate. These checks are not schema validation or a security boundary.

`isEmpty` and `isBlank` reject unsized iterators instead of consuming them. Use `isEmptyIterable` or `isBlankIterable` only when consumption and early iterator closing are intended. Do not reuse a one-shot iterator after inspection; a nullish-only infinite iterable never finishes a blankness check.

Use a bare function matcher for native `instanceof`, or `{ predicate: fn }` for a custom check. Predicates must be synchronous and must not mutate Map/Set inputs. Specifications are validated completely before matching, and user-supplied structures have no built-in work budget. See [type specifications](docs/API.md#type-specifications), [shared contracts](docs/API.md#shared-contracts) and [errors and side effects](docs/API.md#errors-and-side-effects).

### Create plain objects

<!-- prettier-ignore -->
```javascript
import { toPlainObject } from 'go-types';

toPlainObject('{"a":1}');              // => ({ a: 1 })
toPlainObject(new Map([['a', 1]]));    // => ({ a: 1 })
toPlainObject([['a', 1], ['b', 2]]);   // => ({ a: 1, b: 2 })
```

Plain records produce fresh shallow copies of own enumerable string and symbol properties. Nullish input, boxed primitives and malformed entries throw. See [plain-object conversion](docs/conversions.md#plain-object-conversion) for the complete contract.

### Parse JSON

<!-- prettier-ignore -->
```javascript
import { fromJson, fromJsonIf } from 'go-types';

fromJson('{"a":1}');           // => ({ a: 1 })
fromJson('[1,2]');             // => [1, 2]
fromJson('false');             // => false
fromJson('null');              // => null
fromJsonIf('invalid', false);  // => 'invalid'
```

`fromJson(value, reviver?)` follows native `JSON.parse`, including revivers and parsing errors. Its TypeScript result is `unknown` until validated. The conditional form takes `(value, condition?, reviver?)`. See [JSON parsing](docs/conversions.md#json-parsing) for reviver order, optional source context and coercion rules.

### Serialise JSON

<!-- prettier-ignore -->
```javascript
import { toJson, toJsonIf } from 'go-types';

toJson({ a: 1 });                // => '{"a":1}'
toJson('hello');                 // => '"hello"'
toJson({ a: 1, b: 2 }, ['a']);   // => '{"a":1}'
toJsonIf({ a: 1 }, true);        // => '{"a":1}'
```

Native `JSON.stringify` rules apply: the result can be `undefined`, and cycles or unhandled bigints throw. The conditional form takes `(value, condition?, replacer?, space?)`; skipped calls preserve the original input. See [JSON serialisation](docs/conversions.md#json-serialisation) for options, hooks and limitations.

### Box values, create patterns and adopt promises

<!-- prettier-ignore -->
```javascript
import { box, unbox, toRegExp, toPromiseIf } from 'go-types';

box(3).valueOf();                  // => 3
unbox(new Boolean(false));         // => false
box(null);                         // => null
toRegExp('a.b', 'i').test('AxB');  // => true
toPromiseIf(3, false);             // => 3
```

`box` preserves existing objects and nullish input. `unbox` extracts genuine wrapper payloads without invoking custom conversion methods. `toRegExp` uses native pattern syntax; it does not escape text. `toPromise(value)` adopts values and thenables with native `Promise.resolve` semantics. All four have matching `If` variants; conditions remain synchronous booleans. See the [conversion guide](docs/conversions.md#boxing-and-unboxing) for identity, missing-API and TypeScript details.

## TypeScript

TypeScript declarations are included; no separate `@types` package is required.

Declarations cover root, per-function and bundle imports. Fixed exact primitive names and strict `null`/`undefined` matchers support narrowing; `isNonNullish` also narrows filtered values. Native identity checks, dynamic specifications, unions, predicate descriptors and collection validators return `boolean`. `toDate()` returns `Date` without promising extra input properties.

<!-- prettier-ignore -->
```typescript
import { isTypeOf } from 'go-types';

const value: unknown = 'hello';

if (isTypeOf(value, 'string')) {
  value.toUpperCase();         // => 'HELLO'
}
```

Consumer declarations support TypeScript 4.5 or later; legacy CommonJS resolution is verified with 4.5.2. Additional module-resolution requirements are:

- **Node16/NodeNext:** TypeScript 4.9 or later, preserving native ESM bundle import validation (verified with 4.9.5).
- **Bundler:** TypeScript 5.0 or later (verified with 5.0.2).

The readable and minified CommonJS bundles provide a default import from native ESM; `go-types/dist/go-types.mjs` provides both default and named imports. Default imports compiled to CommonJS require `esModuleInterop`; Node16 and NodeNext consumers use conditional exports.

Strict CommonJS consumers can target ES2017 with ES2017 libraries and `skipLibCheck: false`. Compiler libraries do not add optional native features to older runtimes. See the [declaration details](docs/API.md#typescript) for the full contracts.

## Performance

Each call to `isTypeOf` validates and snapshots its specification; separate calls do not cache mutable configuration. Collection checks such as `isArrayOf` prepare the specification once per call and reuse it for their entries. Fixed type-name matchers use shared checks without graph compilation.

Use [function subpaths](#function-subpaths) to load the requested helper and its dependencies. Bundlers can omit unused named ESM exports; the default namespace exposes the full API.

From a source checkout, run:

```sh
npm run benchmark
```

Measurements depend on the workload and runtime; they are not universal speed guarantees. The [performance guide](https://github.com/koyote130708/go-types/blob/master/docs/performance.md) explains the hot paths, trade-offs and comparison methodology.

## Migration

Version 2.0.0 changes matcher validation, collection checks and runtime requirements, and adds TypeScript declarations. Bare function matchers use native `instanceof`; wrap predicate functions as `{ predicate: fn }`. Empty collections pass valid element constraints, and invalid matcher configurations are rejected before matching.

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
