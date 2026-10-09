# Go Types

**Type-checking and conversion utilities for JavaScript.**

[![Source line coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#development)
[![Documentation](https://img.shields.io/badge/docs-100%25-brightgreen.svg)](docs/API.md)
[![Donate](https://img.shields.io/badge/donate-blue.svg)](https://www.paypal.com/donate/?business=T7Q29NNMZVW98&no_recurring=0&item_name=Support+Go+Types&currency_code=USD)

- **Version:** [2.0.0](CHANGELOG.md)
- **Licence:** [MIT](LICENSE.md)

Check JavaScript values, validate collection contents, and convert values using native JavaScript rules. Create reusable checkers for repeated type matching, or import individual functions as needed. Type checks do not convert their inputs; conversions are explicit.

No runtime dependencies. TypeScript declarations included.

**[View full API documentation](docs/API.md)**

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Combining predicates with go-fns](#combining-predicates-with-go-fns)
- [API summary](#api-summary)
- [Behaviour](#behaviour)
- [TypeScript](#typescript)
- [Performance](#performance)
- [Migration](#migration)
- [Development](#development)
- [Further reading](#further-reading)
- [Licence](#licence)

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

[Primitive](docs/API.md#primitive) · [Utility](docs/API.md#utility) · [Number](docs/API.md#number) · [Object](docs/API.md#object) · [Array](docs/API.md#array) · [Collection](docs/API.md#collection) · [DOM](docs/API.md#dom) · [Binary](docs/API.md#binary) · [Conversion](docs/API.md#conversion) · [Conditional conversion](docs/API.md#conditional-conversion)

**Primitive**

| API | Description | Returns |
| --- | --- | --- |
| [`isUndefined(value)`](docs/API.md#isundefinedvalue) | Determines whether a value is exactly `undefined`. | **`boolean`**<br><br>`true` if the value is `undefined`; otherwise `false`. |
| [`isNull(value)`](docs/API.md#isnullvalue) | Determines whether a value is exactly `null`. | **`boolean`**<br><br>`true` if the value is `null`; otherwise `false`. |
| [`isBoolean(value)`](docs/API.md#isbooleanvalue) | Determines whether a value is a primitive boolean or a genuine boxed `Boolean`. | **`boolean`**<br><br>`true` if the value is a primitive boolean or genuine boxed `Boolean`; otherwise `false`. |
| [`isNumber(value)`](docs/API.md#isnumbervalue) | Determines whether a value is a primitive number or a genuine boxed `Number`. | **`boolean`**<br><br>`true` if the value is a primitive number or genuine boxed `Number`, including `NaN` and infinities; otherwise `false`. |
| [`isString(value)`](docs/API.md#isstringvalue) | Determines whether a value is a primitive string or a genuine boxed `String`. | **`boolean`**<br><br>`true` if the value is a primitive string or genuine boxed `String`; otherwise `false`. |
| [`isSymbol(value)`](docs/API.md#issymbolvalue) | Determines whether a value is a primitive symbol. | **`boolean`**<br><br>`true` if the value is a primitive symbol; otherwise `false`. |
| [`isBigInt(value)`](docs/API.md#isbigintvalue) | Determines whether a value is a primitive bigint. | **`boolean`**<br><br>`true` if the value is a primitive bigint; otherwise `false`. |
| [`isPrimitive(value)`](docs/API.md#isprimitivevalue) | Determines whether a value is a primitive rather than an object or function. | **`boolean`**<br><br>`true` if the value is a primitive, including `null` or `undefined`; otherwise `false`. |

**Utility**

| API | Description | Returns |
| --- | --- | --- |
| [`isNullish(value)`](docs/API.md#isnullishvalue) | Determines whether a value is `null` or `undefined`. | **`boolean`**<br><br>`true` if the value is `null` or `undefined`; otherwise `false`. |
| [`isNonNullish(value)`](docs/API.md#isnonnullishvalue) | Determines whether a value is neither `null` nor `undefined`. | **`boolean`**<br><br>`true` if the value is neither `null` nor `undefined`; otherwise `false`. |
| [`isEmpty(value)`](docs/API.md#isemptyvalue) | Determines whether a value is nullish or a supported string or container has no items. | **`boolean`**<br><br>`true` if the value is nullish or a supported string or container with no items; otherwise `false`. |
| [`isBlank(value)`](docs/API.md#isblankvalue) | Determines whether a value is nullish, an empty or whitespace-only string, or a supported container containing only nullish values. | **`boolean`**<br><br>`true` if the value is nullish, a whitespace-only string, or a supported container containing only nullish values; otherwise `false`. |
| [`isTruthy(value)`](docs/API.md#istruthyvalue) | Determines whether JavaScript treats a value as `true` in a condition. | **`boolean`**<br><br>`true` if the value is truthy under JavaScript boolean coercion; otherwise `false`. |
| [`isFalsy(value)`](docs/API.md#isfalsyvalue) | Determines whether JavaScript treats a value as `false` in a condition. | **`boolean`**<br><br>`true` if the value is falsy under JavaScript boolean coercion; otherwise `false`. |
| [`isTypeOf(value, type?)`](docs/API.md#istypeofvalue-type) | Determines whether a value matches a type name, instance target, predicate or union of matchers. | **`boolean`**<br><br>`true` if the value matches the type specification (omission matches `undefined`); otherwise `false`. |
| [`createTypeChecker(type?)`](docs/API.md#createtypecheckertype) | Creates a reusable function that checks values against a type specification. | **`Function`** — `(value: unknown) => boolean`<br><br>A reusable checker that returns `true` if its input matches the compiled specification; otherwise `false`. |
| [`isJson(value)`](docs/API.md#isjsonvalue) | Determines whether primitive or boxed string text is valid JSON. | **`boolean`**<br><br>`true` if the value is primitive or boxed string text that parses as JSON; otherwise `false`. |

**Number**

| API | Description | Returns |
| --- | --- | --- |
| [`isInteger(value)`](docs/API.md#isintegervalue) | Determines whether a primitive or boxed number is an integer. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite integral number; otherwise `false`. |
| [`isSafeInteger(value)`](docs/API.md#issafeintegervalue) | Determines whether a primitive or boxed number is an integer in JavaScript’s safe-integer range. | **`boolean`**<br><br>`true` if the value is a primitive or boxed integer within the safe-integer range; otherwise `false`. |
| [`isFloat(value)`](docs/API.md#isfloatvalue) | Determines whether a primitive or boxed number is a finite number with a fractional part. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite non-integer number; otherwise `false`. |
| [`isFinite(value)`](docs/API.md#isfinitevalue) | Determines whether a primitive or boxed number is a finite number. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite number; otherwise `false`. |
| [`isInfinite(value)`](docs/API.md#isinfinitevalue) | Determines whether a primitive or boxed number is positive or negative infinity. | **`boolean`**<br><br>`true` if the value is primitive or boxed positive or negative infinity; otherwise `false`. |
| [`isNaN(value)`](docs/API.md#isnanvalue) | Determines whether a primitive or boxed number is `NaN`. | **`boolean`**<br><br>`true` if the value is primitive or boxed `NaN`; otherwise `false`. |
| [`isNumeric(value)`](docs/API.md#isnumericvalue) | Determines whether a value is a finite number, a bigint, or non-blank numeric text. | **`boolean`**<br><br>`true` if the value is a finite primitive or boxed number, a primitive bigint, or non-blank string text converting to a finite number; otherwise `false`. |

**Object**

| API | Description | Returns |
| --- | --- | --- |
| [`isObject(value)`](docs/API.md#isobjectvalue) | Determines whether a value is a non-null object or function. | **`boolean`**<br><br>`true` if the value is a non-null object or function; otherwise `false`. |
| [`isObjectLike(value)`](docs/API.md#isobjectlikevalue) | Determines whether a value is a non-null object, excluding functions. | **`boolean`**<br><br>`true` if the value is a non-null object other than a function; otherwise `false`. |
| [`isPlainObject(value)`](docs/API.md#isplainobjectvalue) | Determines whether a value has a null or ordinary `Object` prototype. | **`boolean`**<br><br>`true` if the value has a null or ordinary `Object` prototype; otherwise `false`. |
| [`isCyclic(value)`](docs/API.md#iscyclicvalue) | Determines whether following enumerable string-keyed properties leads back to an ancestor. | **`boolean`**<br><br>`true` if enumerable string-keyed property traversal reaches an active ancestor; otherwise `false`. |
| [`isIterable(value)`](docs/API.md#isiterablevalue) | Determines whether a value exposes a synchronous iterator method. | **`boolean`**<br><br>`true` if the value has a callable `Symbol.iterator` method; otherwise `false`. |
| [`isAsyncIterable(value)`](docs/API.md#isasynciterablevalue) | Determines whether a value exposes an asynchronous iterator method. | **`boolean`**<br><br>`true` if the async-iterator symbol is available and the value has a callable `Symbol.asyncIterator` method; otherwise `false`. |
| [`isIteratorLike(value)`](docs/API.md#isiteratorlikevalue) | Determines whether a value is an object or function with a callable `next` method. | **`boolean`**<br><br>`true` if the value is a non-null object or function with a callable `next` method; otherwise `false`. |
| [`isEmptyIterable(value)`](docs/API.md#isemptyiterablevalue) | Determines whether a synchronous iterable is empty by advancing its iterator. | **`boolean`**<br><br>`true` if the synchronous iterable yields no items; otherwise `false`. |
| [`isBlankIterable(value)`](docs/API.md#isblankiterablevalue) | Determines whether every item yielded by a synchronous iterable is nullish by advancing its iterator. | **`boolean`**<br><br>`true` if the synchronous iterable yields no items or only nullish items; otherwise `false`. |
| [`isFunction(value)`](docs/API.md#isfunctionvalue) | Determines whether JavaScript reports a value as a function. | **`boolean`**<br><br>`true` if `typeof value` is `"function"`; otherwise `false`. |
| [`isDate(value)`](docs/API.md#isdatevalue) | Determines whether a value is a genuine `Date`, valid or invalid. | **`boolean`**<br><br>`true` if the value is a genuine `Date`, valid or invalid; otherwise `false`. |
| [`isValidDate(value)`](docs/API.md#isvaliddatevalue) | Determines whether a genuine `Date` contains a finite timestamp. | **`boolean`**<br><br>`true` if the value is a genuine `Date` with a finite timestamp; otherwise `false`. |
| [`isInvalidDate(value)`](docs/API.md#isinvaliddatevalue) | Determines whether a genuine `Date` contains a `NaN` timestamp. | **`boolean`**<br><br>`true` if the value is a genuine `Date` with a `NaN` timestamp; otherwise `false`. |
| [`isRegExp(value)`](docs/API.md#isregexpvalue) | Determines whether a value is a genuine regular-expression object. | **`boolean`**<br><br>`true` if the value is a genuine `RegExp` instance; otherwise `false`. |
| [`isPromise(value)`](docs/API.md#ispromisevalue) | Determines whether a value passes the local native `Promise` instance check. | **`boolean`**<br><br>`true` if the value passes the local native `Promise` instance check; otherwise `false`. |
| [`isPromiseLike(value)`](docs/API.md#ispromiselikevalue) | Determines whether a value is an object or function with callable `then` and `catch` methods. | **`boolean`**<br><br>`true` if the value is a non-null object or function with callable `then` and `catch` methods; otherwise `false`. |
| [`isThenable(value)`](docs/API.md#isthenablevalue) | Determines whether a value is an object or function with a callable `then` method. | **`boolean`**<br><br>`true` if the value is a non-null object or function with a callable `then` method; otherwise `false`. |
| [`isError(value)`](docs/API.md#iserrorvalue) | Determines whether a value is recognised as an error by the available native check or fallback. | **`boolean`**<br><br>`true` if the captured native error check, or its conservative fallback, recognises the value as an error; otherwise `false`. |

**Array**

| API | Description | Returns |
| --- | --- | --- |
| [`isArray(value)`](docs/API.md#isarrayvalue) | Determines whether a value is an array, including from another realm. | **`boolean`**<br><br>`true` if the value passes native `Array.isArray`; otherwise `false`. |
| [`isNonEmptyArray(value)`](docs/API.md#isnonemptyarrayvalue) | Determines whether a value is an array with a valid length greater than zero. | **`boolean`**<br><br>`true` if the value is an array with a valid length greater than zero; otherwise `false`. |
| [`isArrayOf(value, type?)`](docs/API.md#isarrayofvalue-type) | Determines whether an array contains only values matching a type specification. | **`boolean`**<br><br>`true` if the value is an array and every element matches the specification, including an empty array; otherwise `false`. |
| [`isArrayLike(value)`](docs/API.md#isarraylikevalue) | Determines whether a non-function value has a valid numeric length. | **`boolean`**<br><br>`true` if the value is not a function and has a numeric integer length from `0` through `Number.MAX_SAFE_INTEGER`; otherwise `false`. |
| [`isArrayLikeOf(value, type?)`](docs/API.md#isarraylikeofvalue-type) | Determines whether an array-like value contains only values matching a type specification. | **`boolean`**<br><br>`true` if the value is array-like and every indexed value matches the specification, including an empty input; otherwise `false`. |
| [`isPair(value)`](docs/API.md#ispairvalue) | Determines whether a value is an array of length two. | **`boolean`**<br><br>`true` if the value is an array of length `2`; otherwise `false`. |

**Collection**

| API | Description | Returns |
| --- | --- | --- |
| [`isMap(value)`](docs/API.md#ismapvalue) | Determines whether a value is a genuine `Map`. | **`boolean`**<br><br>`true` if the value is a genuine `Map`; otherwise `false`. |
| [`isMapOf(value, keyType?, valueType?)`](docs/API.md#ismapofvalue-keytype-valuetype) | Determines whether every Map key and value matches its respective specification. | **`boolean`**<br><br>`true` if the value is a `Map` whose keys and values match their respective specifications, including an empty `Map`; otherwise `false`. |
| [`isSet(value)`](docs/API.md#issetvalue) | Determines whether a value is a genuine `Set`. | **`boolean`**<br><br>`true` if the value is a genuine `Set`; otherwise `false`. |
| [`isSetOf(value, type?)`](docs/API.md#issetofvalue-type) | Determines whether a Set contains only values matching a type specification. | **`boolean`**<br><br>`true` if the value is a `Set` whose items all match the specification, including an empty `Set`; otherwise `false`. |
| [`isWeakMap(value)`](docs/API.md#isweakmapvalue) | Determines whether a value is a genuine `WeakMap`. | **`boolean`**<br><br>`true` if the value is a genuine `WeakMap`; otherwise `false`. |
| [`isWeakSet(value)`](docs/API.md#isweaksetvalue) | Determines whether a value is a genuine `WeakSet`. | **`boolean`**<br><br>`true` if the value is a genuine `WeakSet`; otherwise `false`. |

**DOM**

| API | Description | Returns |
| --- | --- | --- |
| [`isNode(value)`](docs/API.md#isnodevalue) | Determines whether a value is an instance of the local DOM `Node` constructor. | **`boolean`**<br><br>`true` if a local `Node` constructor is available and the value passes its instance check; otherwise `false`. |
| [`isElement(value)`](docs/API.md#iselementvalue) | Determines whether a value is an instance of the local DOM `Element` constructor. | **`boolean`**<br><br>`true` if a local `Element` constructor is available and the value passes its instance check; otherwise `false`. |
| [`isFragment(value)`](docs/API.md#isfragmentvalue) | Determines whether a value is an instance of the local DOM `DocumentFragment` constructor. | **`boolean`**<br><br>`true` if a local `DocumentFragment` constructor is available and the value passes its instance check; otherwise `false`. |

**Binary**

| API | Description | Returns |
| --- | --- | --- |
| [`isArrayBuffer(value)`](docs/API.md#isarraybuffervalue) | Determines whether a value is a genuine `ArrayBuffer`. | **`boolean`**<br><br>`true` if the value is a genuine `ArrayBuffer`; otherwise `false`. |
| [`isSharedArrayBuffer(value)`](docs/API.md#issharedarraybuffervalue) | Determines whether a value is a genuine `SharedArrayBuffer`. | **`boolean`**<br><br>`true` if native shared buffers are available and the value is a genuine `SharedArrayBuffer`; otherwise `false`. |
| [`isArrayBufferView(value)`](docs/API.md#isarraybufferviewvalue) | Determines whether a value is a native typed array or `DataView`. | **`boolean`**<br><br>`true` if the value is a native typed array or `DataView`; otherwise `false`. |
| [`isTypedArray(value)`](docs/API.md#istypedarrayvalue) | Determines whether a value is a native typed array, including a Node.js `Buffer`. | **`boolean`**<br><br>`true` if the value is a native typed array, including a Node.js `Buffer`; otherwise `false`. |
| [`isDataView(value)`](docs/API.md#isdataviewvalue) | Determines whether a value is a genuine `DataView`. | **`boolean`**<br><br>`true` if the value is a genuine `DataView`; otherwise `false`. |

**Conversion**

| API | Description | Returns |
| --- | --- | --- |
| [`toArray(value)`](docs/API.md#toarrayvalue) | Converts iterable or array-like input to a new shallow array. | **`ArrayElement<T>[]`**<br><br>A new shallow array containing the input items. |
| [`toBigInt(value?)`](docs/API.md#tobigintvalue) | Converts a value to a primitive bigint using native conversion. | **`bigint`**<br><br>The converted primitive bigint. |
| [`toBoolean(value?)`](docs/API.md#tobooleanvalue) | Converts a value to a boolean using JavaScript truthiness. | **`boolean`**<br><br>`true` if the input is truthy under JavaScript boolean coercion; otherwise `false`. |
| [`toDate(value?)`](docs/API.md#todatevalue) | Converts a value to a `Date`, returning genuine `Date` objects unchanged. The result can be invalid. | **`Date`**<br><br>The original genuine `Date`, or a new `Date` constructed from the input; it may be invalid. |
| [`toInteger(value?)`](docs/API.md#tointegervalue) | Converts a value to a number and truncates it towards zero. | **`number`**<br><br>The numeric conversion truncated towards zero; it may be `NaN` or infinite. |
| [`toMap(value?)`](docs/API.md#tomapvalue) | Converts an iterable of key/value entries to a new shallow Map. | **`ConvertedMap<T>`**<br><br>A new Map containing the input entries, or an empty Map for omitted or nullish input. |
| [`toNumber(value?)`](docs/API.md#tonumbervalue) | Converts a value to a primitive number using JavaScript’s `Number` conversion. | **`number`**<br><br>The converted primitive number; it may be `NaN` or infinite. |
| [`toObject(value?)`](docs/API.md#toobjectvalue) | Converts a value to an object, preserving existing objects and functions. | **`ConvertedObject<T>`**<br><br>The original object or function, a boxed primitive, or a fresh empty object for nullish input. |
| [`toSet(value?)`](docs/API.md#tosetvalue) | Converts an iterable of values to a new shallow Set. | **`ConvertedSet<T>`**<br><br>A new Set of the input values in first-insertion order, or an empty Set for omitted or nullish input. |
| [`toString(value?)`](docs/API.md#tostringvalue) | Converts a value to a primitive string using JavaScript’s `String` conversion. | **`string`**<br><br>The converted primitive string; nullish inputs become their literal text. |
| [`toSymbol(value?)`](docs/API.md#tosymbolvalue) | Converts a value to a primitive symbol, preserving primitive symbols and unboxing genuine Symbol wrappers. | **`symbol`**<br><br>The original or unboxed symbol, or a new symbol created from the description. |

**Conditional conversion**

| API | Description | Returns |
| --- | --- | --- |
| [`toArrayIf(value, condition?)`](docs/API.md#toarrayifvalue-condition) | Converts iterable or array-like input to a new shallow array when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ArrayElement<T>[]`**<br><br>A new shallow array when conversion is requested; otherwise the original input, unchanged. |
| [`toBigIntIf(value, condition?)`](docs/API.md#tobigintifvalue-condition) | Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| bigint`**<br><br>The converted primitive bigint when conversion is requested; otherwise the original input, unchanged. |
| [`toBooleanIf(value, condition?)`](docs/API.md#tobooleanifvalue-condition) | Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| boolean`**<br><br>The input’s boolean truthiness when conversion is requested; otherwise the original input, unchanged. |
| [`toDateIf(value, condition?)`](docs/API.md#todateifvalue-condition) | Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| Date`**<br><br>The original genuine `Date` or a new `Date`, possibly invalid, when conversion is requested; otherwise the original input, unchanged. |
| [`toIntegerIf(value, condition?)`](docs/API.md#tointegerifvalue-condition) | Converts a value to a number and truncates it towards zero when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| number`**<br><br>The numeric conversion truncated towards zero, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged. |
| [`toMapIf(value, condition?)`](docs/API.md#tomapifvalue-condition) | Converts an iterable of key/value entries to a new shallow Map when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedMap<T>`**<br><br>A new Map when conversion is requested; otherwise the original input, unchanged. |
| [`toNumberIf(value, condition?)`](docs/API.md#tonumberifvalue-condition) | Converts a value to a primitive number when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| number`**<br><br>The converted primitive number, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged. |
| [`toObjectIf(value, condition?)`](docs/API.md#toobjectifvalue-condition) | Converts a value to an object when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedObject<T>`**<br><br>The original object or function, a boxed primitive, or a new object for nullish input when conversion is requested; otherwise the original input, unchanged. |
| [`toSetIf(value, condition?)`](docs/API.md#tosetifvalue-condition) | Converts an iterable of values to a new shallow Set when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedSet<T>`**<br><br>A new Set when conversion is requested; otherwise the original input, unchanged. |
| [`toStringIf(value, condition?)`](docs/API.md#tostringifvalue-condition) | Converts a value to a primitive string when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| string`**<br><br>The converted primitive string when conversion is requested; otherwise the original input, unchanged. |
| [`toSymbolIf(value, condition?)`](docs/API.md#tosymbolifvalue-condition) | Converts a value to a primitive symbol when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| symbol`**<br><br>The original or unboxed symbol, or a new symbol from the description, when conversion is requested; otherwise the original input, unchanged. |

`T` is the input type. `ArrayElement<T>[]` preserves inferred iterable/array-like element types, `ConvertedMap<T>` and `ConvertedSet<T>` preserve inferred collection types, and `ConvertedObject<T>` preserves objects or describes the native boxed result. Conditional conversions retain `T` when skipped; literal conditions select the corresponding declaration overload. Checks return boolean values, with narrowing available only where described under [TypeScript](docs/API.md#typescript).

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

The coverage badge reports executable source-line coverage, measured at 100% on Node.js 22 and 24 and enforced by `npm run coverage`. The docs badge reports checked reference coverage for 84 of 84 public functions; there are no additional attached methods or constants. Neither percentage guarantees correctness for every input.

## Further reading

- [Conversion guide](docs/conversions.md): coercion, identity, precision and conditional conversion.
- [Runtime guide](docs/runtime.md): supported features, native checks and declaration boundaries.
- [Full API documentation](docs/API.md): signatures, parameters, examples, shared contracts and matcher validation.
- [Testing guide](https://github.com/koyote130708/go-types/blob/master/docs/project-testing.md): validation strategy and commands.
- [Contributing](https://github.com/koyote130708/go-types/blob/master/CONTRIBUTING.md): development, builds and release checks.

## Licence

[MIT](LICENSE.md) © Michael Ko.
