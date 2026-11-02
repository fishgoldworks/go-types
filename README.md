# Go Types

**Check JavaScript value types and convert values.**

[![Source line coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#development)
[![Documentation](https://img.shields.io/badge/docs-100%25-brightgreen.svg)](docs/API.md)

- **Version:** [2.0.0](CHANGELOG.md)
- **Licence:** [MIT](LICENSE.md)

Check JavaScript values, validate collection contents, and convert values with explicit rules, including JSON serialisation, general JSON parsing and shallow plain-object copies. Import individual functions as needed. Type checks do not convert their inputs.

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

- [Minified bundle](https://cdn.jsdelivr.net/npm/go-types@2.0.0/dist/go-types.min.js)
- [Readable bundle](https://cdn.jsdelivr.net/npm/go-types@2.0.0/dist/go-types.js)

The bundle exposes `Types`:

<!-- prettier-ignore -->
```html
<script src="https://cdn.jsdelivr.net/npm/go-types@2.0.0/dist/go-types.min.js"></script>
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

[Primitive](docs/API.md#primitive) · [Utility](docs/API.md#utility) · [Number](docs/API.md#number) · [Object](docs/API.md#object) · [Array](docs/API.md#array) · [Collection](docs/API.md#collection) · [DOM](docs/API.md#dom) · [Binary](docs/API.md#binary) · [Conversion](docs/API.md#conversion) · [Conditional conversion](docs/API.md#conditional-conversion)

**Primitive**

| API | Description | Returns |
| --- | --- | --- |
| [`isUndefined(value)`](docs/API.md#isundefinedvalue) | Checks whether a value is exactly `undefined`. | **`boolean`**<br><br>`true` if the value is `undefined`; otherwise `false`. |
| [`isNull(value)`](docs/API.md#isnullvalue) | Checks whether a value is exactly `null`. | **`boolean`**<br><br>`true` if the value is `null`; otherwise `false`. |
| [`isBoolean(value)`](docs/API.md#isbooleanvalue) | Checks whether a value is a primitive boolean or a boxed `Boolean`. | **`boolean`**<br><br>`true` if the value is a primitive boolean or boxed `Boolean`; otherwise `false`. |
| [`isNumber(value)`](docs/API.md#isnumbervalue) | Checks whether a value is a primitive number or a boxed `Number`. | **`boolean`**<br><br>`true` if the value is a primitive number or boxed `Number`, including `NaN` and infinities; otherwise `false`. |
| [`isString(value)`](docs/API.md#isstringvalue) | Checks whether a value is a primitive string or a boxed `String`. | **`boolean`**<br><br>`true` if the value is a primitive string or boxed `String`; otherwise `false`. |
| [`isSymbol(value)`](docs/API.md#issymbolvalue) | Checks whether a value is a primitive symbol. | **`boolean`**<br><br>`true` if the value is a primitive symbol; otherwise `false`. |
| [`isBigInt(value)`](docs/API.md#isbigintvalue) | Checks whether a value is a primitive bigint. | **`boolean`**<br><br>`true` if the value is a primitive bigint; otherwise `false`. |
| [`isPrimitive(value)`](docs/API.md#isprimitivevalue) | Checks whether a value is a primitive rather than an object or function. | **`boolean`**<br><br>`true` if the value is a primitive, including `null` or `undefined`; otherwise `false`. |

**Utility**

| API | Description | Returns |
| --- | --- | --- |
| [`isNullish(value)`](docs/API.md#isnullishvalue) | Checks whether a value is `null` or `undefined`. | **`boolean`**<br><br>`true` if the value is `null` or `undefined`; otherwise `false`. |
| [`isNotNullish(value)`](docs/API.md#isnotnullishvalue) | Checks whether a value is neither `null` nor `undefined`. | **`boolean`**<br><br>`true` if the value is neither `null` nor `undefined`; otherwise `false`. |
| [`isEmpty(value)`](docs/API.md#isemptyvalue) | Checks whether a value is nullish, an empty string, or an empty supported collection. | **`boolean`**<br><br>`true` if the value is nullish, an empty string, or an empty supported collection; otherwise `false`. |
| [`isBlank(value)`](docs/API.md#isblankvalue) | Checks whether a value is nullish, an empty or whitespace-only string, or a supported collection containing only nullish values. | **`boolean`**<br><br>`true` if the value is nullish, an empty or whitespace-only string, or a supported collection containing only nullish values; otherwise `false`. |
| [`isTruthy(value)`](docs/API.md#istruthyvalue) | Checks whether JavaScript treats a value as `true` in a condition. | **`boolean`**<br><br>`true` if the value is truthy under JavaScript boolean coercion; otherwise `false`. |
| [`isFalsy(value)`](docs/API.md#isfalsyvalue) | Checks whether JavaScript treats a value as `false` in a condition. | **`boolean`**<br><br>`true` if the value is falsy under JavaScript boolean coercion; otherwise `false`. |
| [`isJson(value)`](docs/API.md#isjsonvalue) | Checks whether primitive or boxed string text is valid JSON. | **`boolean`**<br><br>`true` if the value is primitive or boxed string text that parses as JSON; otherwise `false`. |

**Number**

| API | Description | Returns |
| --- | --- | --- |
| [`isInteger(value)`](docs/API.md#isintegervalue) | Checks whether a primitive or boxed number is an integer. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite integral number; otherwise `false`. |
| [`isSafeInteger(value)`](docs/API.md#issafeintegervalue) | Checks whether a primitive or boxed number is an integer in JavaScript’s safe-integer range. | **`boolean`**<br><br>`true` if the value is a primitive or boxed integer within the safe-integer range; otherwise `false`. |
| [`isFloat(value)`](docs/API.md#isfloatvalue) | Checks whether a primitive or boxed number is a finite number with a fractional part. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite non-integer number; otherwise `false`. |
| [`isFinite(value)`](docs/API.md#isfinitevalue) | Checks whether a primitive or boxed number is a finite number. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite number; otherwise `false`. |
| [`isInfinite(value)`](docs/API.md#isinfinitevalue) | Checks whether a primitive or boxed number is positive or negative infinity. | **`boolean`**<br><br>`true` if the value is primitive or boxed positive or negative infinity; otherwise `false`. |
| [`isNaN(value)`](docs/API.md#isnanvalue) | Checks whether a primitive or boxed number is `NaN`. | **`boolean`**<br><br>`true` if the value is primitive or boxed `NaN`; otherwise `false`. |
| [`isNumeric(value)`](docs/API.md#isnumericvalue) | Checks whether a value is a finite number, a bigint, or non-blank numeric text. | **`boolean`**<br><br>`true` if the value is a finite primitive or boxed number, a primitive bigint, or non-blank string text converting to a finite number; otherwise `false`. |

**Object**

| API | Description | Returns |
| --- | --- | --- |
| [`isObject(value)`](docs/API.md#isobjectvalue) | Checks whether a value is a non-null object or function. | **`boolean`**<br><br>`true` if the value is a non-null object or function; otherwise `false`. |
| [`isPlainObject(value)`](docs/API.md#isplainobjectvalue) | Checks whether a value has a null or ordinary `Object` prototype. | **`boolean`**<br><br>`true` if the value has a null or ordinary `Object` prototype; otherwise `false`. |
| [`isCircular(value)`](docs/API.md#iscircularvalue) | Checks whether a value contains a circular reference through enumerable string-keyed properties, Map keys and values, or Set members. | **`boolean`**<br><br>`true` if following the supported references leads back to an object already on the current path; otherwise `false`. |
| [`isIterable(value)`](docs/API.md#isiterablevalue) | Checks whether a value exposes a synchronous iterator method. | **`boolean`**<br><br>`true` if the value has a callable `Symbol.iterator` method; otherwise `false`. |
| [`isAsyncIterable(value)`](docs/API.md#isasynciterablevalue) | Checks whether a value exposes an asynchronous iterator method. | **`boolean`**<br><br>`true` if the async-iterator symbol is available and the value has a callable `Symbol.asyncIterator` method; otherwise `false`. |
| [`isIteratorLike(value)`](docs/API.md#isiteratorlikevalue) | Checks whether a value is an object or function with a callable `next` method. | **`boolean`**<br><br>`true` if the value is a non-null object or function with a callable `next` method; otherwise `false`. |
| [`isFunction(value)`](docs/API.md#isfunctionvalue) | Checks whether JavaScript reports a value as a function. | **`boolean`**<br><br>`true` if `typeof value` is `"function"`; otherwise `false`. |
| [`isDate(value)`](docs/API.md#isdatevalue) | Checks whether a value is a `Date`, valid or invalid. | **`boolean`**<br><br>`true` if the value is a `Date`, valid or invalid; otherwise `false`. |
| [`isValidDate(value)`](docs/API.md#isvaliddatevalue) | Checks whether a value is a `Date` with a finite timestamp. | **`boolean`**<br><br>`true` if the value is a `Date` with a finite timestamp; otherwise `false`. |
| [`isInvalidDate(value)`](docs/API.md#isinvaliddatevalue) | Checks whether a value is a `Date` with a `NaN` timestamp. | **`boolean`**<br><br>`true` if the value is a `Date` with a `NaN` timestamp; otherwise `false`. |
| [`isRegExp(value)`](docs/API.md#isregexpvalue) | Checks whether a value is a `RegExp` object. | **`boolean`**<br><br>`true` if the value is a `RegExp` object; otherwise `false`. |
| [`isPromise(value)`](docs/API.md#ispromisevalue) | Checks whether a value passes the local native `Promise` instance check. | **`boolean`**<br><br>`true` if the value passes the local native `Promise` instance check; otherwise `false`. |
| [`isPromiseLike(value)`](docs/API.md#ispromiselikevalue) | Checks whether a value is an object or function with a callable `then` method. | **`boolean`**<br><br>`true` if the value is a non-null object or function with a callable `then` method; otherwise `false`. |
| [`isError(value)`](docs/API.md#iserrorvalue) | Checks whether a value is recognised as an error by the available native check or fallback. | **`boolean`**<br><br>`true` if the captured native error check, or its conservative fallback, recognises the value as an error; otherwise `false`. |

**Array**

| API | Description | Returns |
| --- | --- | --- |
| [`isArray(value)`](docs/API.md#isarrayvalue) | Checks whether a value is an array, including from another realm. | **`boolean`**<br><br>`true` if the value passes native `Array.isArray`; otherwise `false`. |
| [`isArrayOf(value, matcher)`](docs/API.md#isarrayofvalue-matcher) | Checks whether a value is an array whose items match a type-name string or predicate. | **`boolean`**<br><br>`true` if the value is an array and every element matches the matcher, including an empty array; otherwise `false`. |
| [`isArrayLike(value)`](docs/API.md#isarraylikevalue) | Checks whether a non-function value has a valid numeric length. | **`boolean`**<br><br>`true` if the value is not a function and has a numeric integer length from `0` through `Number.MAX_SAFE_INTEGER`; otherwise `false`. |
| [`isArrayLikeOf(value, matcher)`](docs/API.md#isarraylikeofvalue-matcher) | Checks whether an array-like value contains only items matching a type-name string or predicate. | **`boolean`**<br><br>`true` if the value is array-like and every indexed value matches the matcher, including an empty input; otherwise `false`. |
| [`isPair(value)`](docs/API.md#ispairvalue) | Checks whether a value is an array of length two. | **`boolean`**<br><br>`true` if the value is an array of length `2`; otherwise `false`. |

**Collection**

| API | Description | Returns |
| --- | --- | --- |
| [`isMap(value)`](docs/API.md#ismapvalue) | Checks whether a value is a `Map`. | **`boolean`**<br><br>`true` if the value is a `Map`; otherwise `false`. |
| [`isMapOf(value, keyMatcher, valueMatcher)`](docs/API.md#ismapofvalue-keymatcher-valuematcher) | Checks whether a value is a native Map whose keys and values match their type-name strings or predicates. | **`boolean`**<br><br>`true` if the value is a `Map` whose keys and values match their respective matchers, including an empty `Map`; otherwise `false`. |
| [`isSet(value)`](docs/API.md#issetvalue) | Checks whether a value is a `Set`. | **`boolean`**<br><br>`true` if the value is a `Set`; otherwise `false`. |
| [`isSetOf(value, matcher)`](docs/API.md#issetofvalue-matcher) | Checks whether a value is a native Set whose items match a type-name string or predicate. | **`boolean`**<br><br>`true` if the value is a `Set` whose items all match the matcher, including an empty `Set`; otherwise `false`. |
| [`isWeakMap(value)`](docs/API.md#isweakmapvalue) | Checks whether a value is a `WeakMap`. | **`boolean`**<br><br>`true` if the value is a `WeakMap`; otherwise `false`. |
| [`isWeakSet(value)`](docs/API.md#isweaksetvalue) | Checks whether a value is a `WeakSet`. | **`boolean`**<br><br>`true` if the value is a `WeakSet`; otherwise `false`. |

**DOM**

| API | Description | Returns |
| --- | --- | --- |
| [`isNode(value)`](docs/API.md#isnodevalue) | Checks whether a value is an instance of the local DOM `Node` constructor. | **`boolean`**<br><br>`true` if a local `Node` constructor is available and the value passes its instance check; otherwise `false`. |
| [`isElement(value)`](docs/API.md#iselementvalue) | Checks whether a value is an instance of the local DOM `Element` constructor. | **`boolean`**<br><br>`true` if a local `Element` constructor is available and the value passes its instance check; otherwise `false`. |
| [`isDocumentFragment(value)`](docs/API.md#isdocumentfragmentvalue) | Checks whether a value is an instance of the local DOM `DocumentFragment` constructor. | **`boolean`**<br><br>`true` if a local `DocumentFragment` constructor is available and the value passes its instance check; otherwise `false`. |

**Binary**

| API | Description | Returns |
| --- | --- | --- |
| [`isArrayBuffer(value)`](docs/API.md#isarraybuffervalue) | Checks whether a value is a `ArrayBuffer`. | **`boolean`**<br><br>`true` if the value is a `ArrayBuffer`; otherwise `false`. |
| [`isSharedArrayBuffer(value)`](docs/API.md#issharedarraybuffervalue) | Checks whether a value is a `SharedArrayBuffer`. | **`boolean`**<br><br>`true` if native shared buffers are available and the value is a `SharedArrayBuffer`; otherwise `false`. |
| [`isArrayBufferView(value)`](docs/API.md#isarraybufferviewvalue) | Checks whether a value is a native typed array or `DataView`. | **`boolean`**<br><br>`true` if the value is a native typed array or `DataView`; otherwise `false`. |
| [`isTypedArray(value)`](docs/API.md#istypedarrayvalue) | Checks whether a value is a native typed array, including a Node.js `Buffer`. | **`boolean`**<br><br>`true` if the value is a native typed array, including a Node.js `Buffer`; otherwise `false`. |
| [`isDataView(value)`](docs/API.md#isdataviewvalue) | Checks whether a value is a `DataView`. | **`boolean`**<br><br>`true` if the value is a `DataView`; otherwise `false`. |

**Conversion**

| API | Description | Returns |
| --- | --- | --- |
| [`box(value?)`](docs/API.md#boxvalue) | Wraps non-nullish primitives in their native wrapper objects, preserving objects and nullish values. | **`Boxed<T>`**<br><br>A native wrapper for a non-nullish primitive; otherwise the original object, function or nullish input. |
| [`unbox(value?)`](docs/API.md#unboxvalue) | Extracts the primitive value from a wrapper object, leaving other values unchanged. | **`Unboxed<T>`**<br><br>The wrapper’s primitive value when its native unboxing operation is available; otherwise the original input. |
| [`toRegExp(value?, flags?)`](docs/API.md#toregexpvalue-flags) | Converts a pattern and optional flags to a `RegExp`. | **`RegExp`**<br><br>A `RegExp`, which may retain input identity under native rules. |
| [`toPromise(value?)`](docs/API.md#topromisevalue) | Converts a value to a native `Promise`, adopting thenables and preserving ordinary local promises. | **`Promise<Awaited<T>>`**<br><br>A native `Promise` that adopts the input; ordinary local promises retain identity. |
| [`toArray(value)`](docs/API.md#toarrayvalue) | Converts a synchronous iterable, plain object or supported array-like input to a new shallow array. | **`ArrayElement<T>[]`**<br><br>A new shallow array containing iterable items, plain object property values or indexed array-like values. |
| [`ensureArray(value?)`](docs/API.md#ensurearrayvalue) | Returns an existing array unchanged or wraps a supplied value as one item. Without arguments, returns an empty array. | **`EnsuredArray<T>`**<br><br>A new empty array when no value is supplied; otherwise the original array or a new array containing the supplied value. |
| [`toBigInt(value?)`](docs/API.md#tobigintvalue) | Converts a value to a primitive bigint using native conversion. | **`bigint`**<br><br>The converted primitive bigint. |
| [`toBoolean(value?)`](docs/API.md#tobooleanvalue) | Converts a value to a boolean using JavaScript truthiness. | **`boolean`**<br><br>`true` if the input is truthy under JavaScript boolean coercion; otherwise `false`. |
| [`toDate(value?)`](docs/API.md#todatevalue) | Converts a value to a `Date`, returning existing `Date` objects unchanged. The result can be invalid. | **`Date`**<br><br>The original `Date`, or a new `Date` constructed from the input; it may be invalid. |
| [`toInteger(value?)`](docs/API.md#tointegervalue) | Converts a value to a number and truncates it towards zero. | **`number`**<br><br>The numeric conversion truncated towards zero; it may be `NaN` or infinite. |
| [`toJson(value?, replacer?, space?)`](docs/API.md#tojsonvalue-replacer-space) | Serialises a value to JSON text using native `JSON.stringify` behaviour. | **`string \| undefined`**<br><br>JSON text, or `undefined` when native serialisation produces no text, including omitted input without a replacer. |
| [`parseJson(value, reviver?)`](docs/API.md#parsejsonvalue-reviver) | Parses JSON text into a JavaScript value using native `JSON.parse` behaviour. | **`unknown`**<br><br>The parsed value, or any root value returned by the reviver, including `undefined`. TypeScript returns unknown until the caller validates it. |
| [`toMap(value?)`](docs/API.md#tomapvalue) | Converts a plain object or iterable of key/value pairs to a new Map. | **`ConvertedMap<T>`**<br><br>A new Map containing a plain object's own enumerable properties as entries, or the supplied key/value pairs. Omitted or nullish input produces an empty Map. |
| [`toNumber(value?)`](docs/API.md#tonumbervalue) | Converts a value to a primitive number using JavaScript’s `Number` conversion. | **`number`**<br><br>The converted primitive number; it may be `NaN` or infinite. |
| [`toPlainObject(value)`](docs/API.md#toplainobjectvalue) | Creates a plain object from key/value pairs, or makes a shallow copy of an existing plain object. | **`ConvertedPlainObject<T>`**<br><br>A fresh ordinary object containing the copied enumerable properties or supplied entries. |
| [`toSet(value?)`](docs/API.md#tosetvalue) | Converts a synchronous iterable, plain object or supported array-like input to a new shallow Set. | **`ConvertedSet<T>`**<br><br>A new Set of iterable items, plain object property values or indexed array-like values, or an empty Set for omitted or nullish input. |
| [`ensureSet(value?)`](docs/API.md#ensuresetvalue) | Returns an existing Set unchanged, creates a Set from array items, or treats another supplied value as one member. | **`EnsuredSet<T>`**<br><br>The original Set, or a new Set containing array items or one supplied member. With no arguments, a new empty Set. |
| [`toString(value?)`](docs/API.md#tostringvalue) | Converts a value to a primitive string using JavaScript’s `String` conversion. | **`string`**<br><br>The converted primitive string; nullish inputs become their literal text. |
| [`toSymbol(value?)`](docs/API.md#tosymbolvalue) | Converts a value to a primitive symbol, preserving existing symbols and unboxing `Symbol` wrappers. | **`symbol`**<br><br>The original or unboxed symbol, or a new symbol created from the description. |

**Conditional conversion**

| API | Description | Returns |
| --- | --- | --- |
| [`boxIf(value, condition?)`](docs/API.md#boxifvalue-condition) | Wraps non-nullish primitives in their native wrapper objects when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| Boxed<T>`**<br><br>The `box` result when requested; otherwise the exact original input. |
| [`unboxIf(value, condition?)`](docs/API.md#unboxifvalue-condition) | Extracts the primitive value from a wrapper object when the condition evaluates to `true` and native unboxing is available. Otherwise, returns the original input unchanged. | **`T \| Unboxed<T>`**<br><br>The `unbox` result when requested; otherwise the exact original input. |
| [`toRegExpIf(value, condition?, flags?)`](docs/API.md#toregexpifvalue-condition-flags) | Converts a pattern and optional flags to a `RegExp` when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| RegExp`**<br><br>The `toRegExp` result when requested; otherwise the exact original input. |
| [`toPromiseIf(value, condition?)`](docs/API.md#topromiseifvalue-condition) | Converts a value to a native `Promise` when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| Promise<Awaited<T>>`**<br><br>The `toPromise` result when requested; otherwise the exact original input. |
| [`toArrayIf(value, condition?)`](docs/API.md#toarrayifvalue-condition) | Converts supported iterable, plain object or array-like input to a new shallow array when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ArrayElement<T>[]`**<br><br>A new shallow array when conversion is requested; otherwise the original input, unchanged. |
| [`toBigIntIf(value, condition?)`](docs/API.md#tobigintifvalue-condition) | Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| bigint`**<br><br>The converted primitive bigint when conversion is requested; otherwise the original input, unchanged. |
| [`toBooleanIf(value, condition?)`](docs/API.md#tobooleanifvalue-condition) | Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| boolean`**<br><br>The input’s boolean truthiness when conversion is requested; otherwise the original input, unchanged. |
| [`toDateIf(value, condition?)`](docs/API.md#todateifvalue-condition) | Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| Date`**<br><br>The original `Date` or a new `Date`, possibly invalid, when conversion is requested; otherwise the original input, unchanged. |
| [`toIntegerIf(value, condition?)`](docs/API.md#tointegerifvalue-condition) | Converts a value to a number and truncates it towards zero when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| number`**<br><br>The numeric conversion truncated towards zero, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged. |
| [`toJsonIf(value, condition?, replacer?, space?)`](docs/API.md#tojsonifvalue-condition-replacer-space) | Serialises a value to JSON text when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| string \| undefined`**<br><br>JSON text or `undefined` when conversion is requested; otherwise the original input, unchanged. |
| [`parseJsonIf(value, condition?, reviver?)`](docs/API.md#parsejsonifvalue-condition-reviver) | Parses JSON when the condition evaluates to `true`; otherwise returns the original input unchanged. | **`T \| unknown`**<br><br>The parsed or revived value when requested; otherwise the original input unchanged. |
| [`toMapIf(value, condition?)`](docs/API.md#tomapifvalue-condition) | Converts a plain object or iterable of key/value pairs to a new Map when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedMap<T>`**<br><br>A new Map when conversion is requested; otherwise the original input, unchanged. |
| [`toNumberIf(value, condition?)`](docs/API.md#tonumberifvalue-condition) | Converts a value to a primitive number when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| number`**<br><br>The converted primitive number, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged. |
| [`toPlainObjectIf(value, condition?)`](docs/API.md#toplainobjectifvalue-condition) | Creates a new plain object when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedPlainObject<T>`**<br><br>A fresh plain object when conversion is requested; otherwise the exact original input. |
| [`toSetIf(value, condition?)`](docs/API.md#tosetifvalue-condition) | Converts supported iterable, plain object or array-like input to a new shallow Set when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedSet<T>`**<br><br>A new Set when conversion is requested; otherwise the original input, unchanged. |
| [`toStringIf(value, condition?)`](docs/API.md#tostringifvalue-condition) | Converts a value to a primitive string when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| string`**<br><br>The converted primitive string when conversion is requested; otherwise the original input, unchanged. |
| [`toSymbolIf(value, condition?)`](docs/API.md#tosymbolifvalue-condition) | Converts a value to a primitive symbol when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| symbol`**<br><br>The original or unboxed symbol, or a new symbol from the description, when conversion is requested; otherwise the original input, unchanged. |

`T` is the input type. `ArrayElement<T>[]` preserves inferred iterable elements and record values, with conservative array-like inference, `ConvertedMap<T>` and `ConvertedSet<T>` preserve inferred collection types, and `ConvertedPlainObject<T>` describes fresh plain objects with optional inferred properties and unknown JSON values. Conditional conversions retain `T` when skipped; literal conditions select the corresponding declaration overload. Checks return boolean values, with narrowing available only where described under [TypeScript](docs/API.md#typescript).

## Behaviour

Type checks do not convert their inputs. Scalar conversions follow native coercion: `toBoolean` uses truthiness, `toString` is not JSON serialisation, and numeric/date results can lose precision or be invalid. Conditional conversions require a boolean or synchronous predicate returning a primitive boolean; `false`, omitted or `undefined` conditions leave the input untouched.

`toArray` and `toSet` select synchronous iterable values, then values from own enumerable string and symbol properties, then supported non-plain array-like indices with strict numeric lengths. `toMap` copies object entries (including symbols) or consumes exact two-element array pairs with both own indices. Unsupported inputs throw; see the [conversion guide](docs/conversions.md).

Ordinary failed checks return `false`. Invalid matcher configurations and unsupported inputs can throw; callback, getter, proxy, coercion and iterator errors propagate. These checks are not schema validation or a security boundary.

`isEmpty` and `isBlank` inspect [supported collections](docs/API.md#empty-and-blank-values) and reject unsized iterators and iterables without consuming them. Handle iteration explicitly when consumption is intended.

Collection checks accept a required native `typeof` name or synchronous boolean predicate. For example, `isArrayOf(items, 'number')` accepts primitive numbers; `isArrayOf(items, isNumber)` also accepts Number wrappers. Use `value => value instanceof Account` for class instances. Empty collections pass valid checks. See [type specifications](docs/API.md#type-specifications) for callback and traversal rules.

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
import { ensureSet } from 'go-types';

ensureSet('read').has('read');                     // => true
Array.from(ensureSet(['read', 'write', 'read']));  // => ['read', 'write']
ensureSet().size;                                  // => 0
ensureSet(undefined).has(undefined);               // => true

const permissions = new Set(['read', 'write']);
ensureSet(permissions) === permissions;            // => true
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
import { parseJson, parseJsonIf } from 'go-types';

parseJson('{"a":1}');            // => ({ a: 1 })
parseJson('[1,2]');              // => [1, 2]
parseJson('false');              // => false
parseJson('null');               // => null
parseJsonIf('invalid', false);   // => 'invalid' (parsing skipped; otherwise throws SyntaxError)
```

`parseJson(value, reviver?)` follows native `JSON.parse`, including revivers and parsing errors. Its TypeScript result is `unknown` until validated. The conditional form takes `(value, condition?, reviver?)`. See [JSON parsing](docs/conversions.md#json-parsing) for reviver order, optional source context and coercion rules.

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

`box` preserves existing objects and nullish input. `unbox` extracts primitive values from wrapper objects without invoking custom conversion methods. `toRegExp` uses native pattern syntax; it does not escape text. `toPromise(value)` adopts values and thenables with native `Promise.resolve` semantics. All four have matching `If` variants; conditions remain synchronous booleans. See the [conversion guide](docs/conversions.md#boxing-and-unboxing) for identity, missing-API and TypeScript details.

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
