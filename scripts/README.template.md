# Go Types

**Type-checking and conversion utilities for JavaScript.**

[![Source line coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#development)
[![Documentation](https://img.shields.io/badge/docs-{{DOCS_COVERAGE}}%25-brightgreen.svg)](#documentation)
[![Donate](https://img.shields.io/badge/donate-blue.svg)](https://www.paypal.com/donate/?business=T7Q29NNMZVW98&no_recurring=0&item_name=Support+Go+Types&currency_code=USD)

*   **version**: {{VERSION}}
*   **licence**: MIT

## Installation

```sh
npm i go-types
```

or

```sh
yarn add go-types
```

Node.js 22 or later is required for Node usage. Browser requirements are listed in the [runtime guide](docs/runtime.md). CommonJS, ES modules, and TypeScript declarations are included. There are no runtime package dependencies.

## Usage

### ES6

```javascript
import Types from 'go-types';

Types.isArray([]);              // => true
Types.toNumber('12.5');         // => 12.5
```

or

```javascript
import { isArray, isArrayOf, toNumber } from 'go-types';

isArray([]);                    // => true
isArrayOf([1, 2, 3], 'number'); // => true
toNumber('12.5');               // => 12.5
```

### Node

```javascript
const Types = require('go-types');

Types.isArray([]);              // => true
Types.toNumber('12.5');         // => 12.5
```

or

```javascript
const { isArray, isArrayOf, toNumber } = require('go-types');

isArray([]);                    // => true
isArrayOf([1, 2, 3], 'number'); // => true
toNumber('12.5');               // => 12.5
```

### Web browser

The npm package includes browser bundles in `dist/`. Copy a bundle to your web server and load it to use the global `Types` object:

```html
<script src="dist/go-types.min.js"></script>
<script>
    const { isArray, toNumber } = Types;

    isArray([]);      // => true
    toNumber('12.5'); // => 12.5
</script>
```

The package also includes the readable `dist/go-types.js` and the browser ES module `dist/go-types.mjs`. When working from the source repository, generate these files with `npm run build`.

### Individual functions

```javascript
import isArray from 'go-types/isArray';
import toNumber from 'go-types/toNumber';

isArray([]);    // => true
toNumber('42'); // => 42
```

or

```javascript
const isArray = require('go-types/isArray');
const toNumber = require('go-types/toNumber');

isArray([]);    // => true
toNumber('42'); // => 42
```

Individual-function imports keep native Node loading focused. Named root exports expose separate modules to bundlers; importing the default namespace requests the full API.

Conversion-directory imports such as `go-types/conversion/toNumber` and `go-types/src/conversion/toNumber.js` are also supported.

## Documentation

All **{{COUNT}} public functions** are documented below, including parameters, usage examples, and return values. Examples assume the functions have been imported from `go-types`; DOM examples run in a web browser.

Type checks do not convert values. For example, `isNumber('42')` returns `false`, while `toNumber('42')` returns `42`. Callbacks, getters, proxy traps, and conversion hooks may throw; the individual notes describe important exceptions and side effects.

{{DOCUMENTATION}}

### Type specifications

The `type`, `keyType`, and `valueType` parameters accept the following matcher forms:

*   A case-sensitive `typeof` name: `'undefined'`, `'boolean'`, `'number'`, `'bigint'`, `'string'`, `'symbol'`, `'function'`, or `'object'`. A boxed string containing a valid name is also accepted. As with native `typeof`, `'object'` matches `null`.
*   A function target, or `{ instanceOf: Target }`, for a native `instanceof` check. Constructor bodies are never called; custom instance hooks run only during matching.
*   `{ predicate: fn }`, where `fn` is a synchronous function returning a primitive boolean.
*   `null` or `undefined`, for strict identity. An omitted type means `undefined`.
*   An array of alternative matchers, including nested arrays. An empty union matches no value.

```javascript
class Account {}

isTypeOf(42, 'number');                     // => true
isTypeOf(new Account(), Account);           // => true
isTypeOf('hello', { predicate: isString }); // => true
isTypeOf(null, ['string', null]);           // => true
isTypeOf('42', Number);                     // => false
```

The complete specification is validated before matching, including alternatives that evaluation would otherwise skip. Invalid names, cyclic unions, ambiguous descriptors, and non-boolean predicate results throw `TypeError`. Use `{ predicate: fn }` for predicates, not bare functions.

`createTypeChecker()` snapshots each distinct union array once per compilation and reuses that structure. Application predicates still run in order on each check; their results are never cached. Later changes to constructors and callback state still affect matching.

Instance checks use native realm and prototype rules. For example, a Date from another realm may fail a local `instanceof Date` check. Use `{ predicate: isDate }` to recognise dates across realms.

Prototype errors for callable instance targets are deferred to native `instanceof` evaluation. This supports bound functions and custom instance hooks without invoking them during compilation.

TypeScript narrows values for fixed exact primitive names and strict null/undefined matchers. Native identity checks, dynamic specifications, unions, predicate descriptors, and collection-content validators return `boolean`. A failed check cannot safely exclude a structural TypeScript type: an object can have a Date-shaped interface without being a native Date.

`toDate()` returns `Date`; it does not promise to preserve extra input properties during conversion. See the [migration guide](docs/migration.md#typescript-safety) for examples.

See the [API reference](docs/API.md#matcher-specification-contract) for descriptor validation details.

## Development

From a source checkout, run `npm ci`, then `npm run verify` for the standard checks. Run `npm run verify:all` to include real-browser checks. See [Contributing](https://github.com/koyote130708/go-types/blob/master/CONTRIBUTING.md) for browser setup and the complete workflow.

The **coverage** badge reports executable source-line coverage from `npm run coverage`. The current measurement is 100% on Node.js 22 and 24, and the command enforces a 100% line-coverage minimum. It is not branch coverage or a guarantee of correctness; refresh the badge when the measured result changes.

The **docs** badge reports the proportion of public functions with checked reference sections: {{COUNT}} of {{COUNT}}, or {{DOCS_COVERAGE}}%. The documentation generator checks the export catalogue, and the README tests compare its sections with the runtime exports. The API has no additional attached methods or exported constants. This measure does not mean every example or possible behaviour is tested.

Run `npm run docs` to regenerate this README, the API reference and source examples, then `npm run test:docs` to check freshness. The layout comes from `scripts/README.template.md` and `scripts/readme.js`; function descriptions and standard examples come from `scripts/api.json`.

## Additional documentation

*   [Conversion guide](docs/conversions.md): coercion, identity, precision, errors, and conditional conversion.
*   [Migration guide](docs/migration.md): behaviour changes from version 1.
*   [Runtime guide](docs/runtime.md): supported features and native-check limitations.
*   [Performance guide](https://github.com/koyote130708/go-types/blob/master/docs/performance.md): hot paths, reusable checkers, and benchmark methodology.
*   [Testing guide](https://github.com/koyote130708/go-types/blob/master/docs/project-testing.md): test strategy and verification commands.
*   [Contributing](https://github.com/koyote130708/go-types/blob/master/CONTRIBUTING.md): development, builds, and release checks.

## Licence

[MIT](LICENSE.md) © Michael Ko.
