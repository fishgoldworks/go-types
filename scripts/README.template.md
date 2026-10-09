# Go Types

**Type-checking and conversion utilities for JavaScript.**

[![Source line coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#development)
[![Documentation](https://img.shields.io/badge/docs-{{DOCS_COVERAGE}}%25-brightgreen.svg)](docs/API.md)
[![Donate](https://img.shields.io/badge/donate-blue.svg)](https://www.paypal.com/donate/?business=T7Q29NNMZVW98&no_recurring=0&item_name=Support+Go+Types&currency_code=USD)

- **Version:** [{{VERSION}}](CHANGELOG.md)
- **Licence:** [MIT](LICENSE.md)

Check JavaScript values, validate collection contents, and convert values using native JavaScript rules. Create reusable checkers for repeated type matching, or import individual functions as needed. Type checks do not convert their inputs; conversions are explicit.

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
import Types from 'go-types';

Types.isArray([]);               // => true
Types.toNumber('12.5');          // => 12.5
```

Or import individual functions:

<!-- prettier-ignore -->
```javascript
import { isArray, isArrayOf, toNumber } from 'go-types';

isArray([]);                     // => true
isArrayOf([1, 2, 3], 'number');  // => true
toNumber('12.5');                // => 12.5
```

### CommonJS

<!-- prettier-ignore -->
```javascript
const Types = require('go-types');

Types.isArray([]);               // => true
Types.toNumber('12.5');          // => 12.5
```

Or import individual functions:

<!-- prettier-ignore -->
```javascript
const { isArray, isArrayOf, toNumber } = require('go-types');

isArray([]);                     // => true
isArrayOf([1, 2, 3], 'number');  // => true
toNumber('12.5');                // => 12.5
```

### Browser

The npm package includes browser bundles in `dist/`. Copy a bundle to your web server and load it to use the global `Types` object:

<!-- prettier-ignore -->
```html
<script src="dist/go-types.min.js"></script>
<script>
  const { isArray, toNumber } = Types;

  isArray([]);                 // => true
  toNumber('12.5');            // => 12.5
</script>
```

The package also includes the readable `dist/go-types.js` and the browser ES module `dist/go-types.mjs`. When working from the source repository, `npm run build` generates the complete package, with bundles under `package/dist/`.

### Individual imports

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

Individual-function imports keep native Node loading focused. Named root exports expose separate modules to bundlers; importing the default namespace requests the full API.

Conversion-directory imports such as `go-types/conversion/toNumber` and `go-types/src/conversion/toNumber.js` are also supported.

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

Type checks do not convert their inputs. Conversions follow native coercion rules and may invoke hooks, lose precision, or return `NaN`, infinity or an invalid `Date`. Conditional conversions require a boolean or synchronous predicate returning a primitive boolean; `false`, omitted or `undefined` conditions leave the input untouched.

Ordinary failed checks return `false`. Invalid matcher configurations and unsupported inputs can throw; callback, getter, proxy, coercion and iterator errors propagate. These checks are not schema validation or a security boundary.

`isEmpty` and `isBlank` reject unsized iterators instead of consuming them. Use `isEmptyIterable` or `isBlankIterable` only when consumption and early iterator closing are intended. Do not reuse a one-shot iterator after inspection; a nullish-only infinite iterable never finishes a blankness check.

Use a bare function matcher for native `instanceof`, or `{ predicate: fn }` for a custom check. Predicates must be synchronous and must not mutate Map/Set inputs. Specifications are validated completely before matching, and user-supplied structures have no built-in work budget. See [type specifications](docs/API.md#type-specifications), [shared contracts](docs/API.md#shared-contracts) and [errors and side effects](docs/API.md#errors-and-side-effects).

## TypeScript

Declarations are included for root, per-function and bundle imports. The readable and minified CommonJS bundles provide a default import from native ESM; `go-types/dist/go-types.mjs` provides both default and named imports. Default imports compiled to CommonJS require `esModuleInterop`; Node16 and NodeNext consumers use conditional exports.

<!-- prettier-ignore -->
```typescript
import Types from 'go-types';

const value: unknown = 'hello';

if (Types.isTypeOf(value, 'string')) {
  value.toUpperCase();         // => 'HELLO'
}
```

Fixed exact primitive names and strict `null`/`undefined` matchers support narrowing; `isNonNullish` also narrows filtered values. Native identity checks, dynamic specifications, unions, predicate descriptors and collection validators return `boolean`. `toDate()` returns `Date` without promising extra input properties. See the [declaration details](docs/API.md#typescript).

Strict CommonJS consumers can target ES2017 with ES2017 libraries and `skipLibCheck: false`. Compiler libraries do not add optional native features to older runtimes.

## Performance

For repeated checks against the same specification, create a checker once with [`createTypeChecker`](docs/API.md#createtypecheckertype). Each call to `isTypeOf` validates and snapshots its specification again; separate calls do not cache the caller’s mutable configuration. Fixed type-name matchers use shared checks without graph compilation.

Use [individual imports](#individual-imports) to keep native Node loading focused. Bundlers can omit unused named ESM exports; the default namespace exposes the full API.

From a source checkout, run:

```sh
npm run benchmark
```

Measurements depend on the workload and runtime; they are not universal speed guarantees. The [performance guide](https://github.com/koyote130708/go-types/blob/master/docs/performance.md) explains the hot paths, trade-offs and comparison methodology.

## Migration

Version 2.0.0 changes matcher validation, collection checks and some TypeScript narrowing guarantees. Bare function matchers use native `instanceof`; wrap predicate functions as `{ predicate: fn }`. Empty collections pass valid element constraints, and invalid matcher configurations are rejected before matching.

Read the [migration guide](docs/migration.md) and [changelog](CHANGELOG.md) before upgrading from version 1.

## Development

Use Node.js **22.16.0 or later** for contributor tools; Node 24 is recommended. This is separate from [consumer runtime support](#runtime-support).

```sh
npm ci
npm run docs
npm run build
npm run verify
```

Edit `scripts/README.template.md` for this overview, `scripts/API.template.md` for shared contracts, `scripts/readme.js` for the reference layout and `scripts/api.json` for function descriptions, notes and source examples. `npm run docs` regenerates the README, API guide and source comments; `npm run test:docs` checks freshness.

`verify` builds and packs once, then checks documentation, source coverage, build recovery and the installed package. `verify:all` adds real-browser checks against the same archive. See [Contributing](https://github.com/koyote130708/go-types/blob/master/CONTRIBUTING.md) for exact-runtime selection, browser setup, local installation and release procedures.

The coverage badge reports executable source-line coverage, measured at 100% on Node.js 22 and 24 and enforced by `npm run coverage`. The docs badge reports checked reference coverage for {{COUNT}} of {{COUNT}} public functions; there are no additional attached methods or constants. Neither percentage guarantees correctness for every input.

## Further reading

- [Conversion guide](docs/conversions.md): coercion, identity, precision and conditional conversion.
- [Runtime guide](docs/runtime.md): supported features, native checks and declaration boundaries.
- [Full API documentation](docs/API.md): signatures, parameters, examples, shared contracts and matcher validation.
- [Testing guide](https://github.com/koyote130708/go-types/blob/master/docs/project-testing.md): validation strategy and commands.
- [Contributing](https://github.com/koyote130708/go-types/blob/master/CONTRIBUTING.md): development, builds and release checks.

## Licence

[MIT](LICENSE.md) © Michael Ko.
