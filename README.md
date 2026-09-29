# Go Types

**Type-checking and conversion utilities for JavaScript.**

[![Source line coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#development)
[![Documentation](https://img.shields.io/badge/docs-100%25-brightgreen.svg)](#documentation)
[![Donate](https://img.shields.io/badge/donate-blue.svg)](https://www.paypal.com/donate/?business=T7Q29NNMZVW98&no_recurring=0&item_name=Support+Go+Types&currency_code=USD)

*   **version**: 2.0.0
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

All **80 public functions** are documented below, including parameters, usage examples, and return values. Examples assume the functions have been imported from `go-types`; DOM examples run in a web browser.

Type checks do not convert values. For example, `isNumber('42')` returns `false`, while `toNumber('42')` returns `42`. Callbacks, getters, proxy traps, and conversion hooks may throw; the individual notes describe important exceptions and side effects.

#### Table of Contents

*   [Primitive](#primitive)
    *   [isUndefined](#isundefined)
        *   [Parameters](#parameters)
        *   [Examples](#examples)
    *   [isNull](#isnull)
        *   [Parameters](#parameters-1)
        *   [Examples](#examples-1)
    *   [isBoolean](#isboolean)
        *   [Parameters](#parameters-2)
        *   [Examples](#examples-2)
    *   [isNumber](#isnumber)
        *   [Parameters](#parameters-3)
        *   [Examples](#examples-3)
    *   [isString](#isstring)
        *   [Parameters](#parameters-4)
        *   [Examples](#examples-4)
    *   [isSymbol](#issymbol)
        *   [Parameters](#parameters-5)
        *   [Examples](#examples-5)
    *   [isBigInt](#isbigint)
        *   [Parameters](#parameters-6)
        *   [Examples](#examples-6)
    *   [isPrimitive](#isprimitive)
        *   [Parameters](#parameters-7)
        *   [Examples](#examples-7)
*   [Utility](#utility)
    *   [isNullish](#isnullish)
        *   [Parameters](#parameters-8)
        *   [Examples](#examples-8)
    *   [isNonNullish](#isnonnullish)
        *   [Parameters](#parameters-9)
        *   [Examples](#examples-9)
    *   [isEmpty](#isempty)
        *   [Parameters](#parameters-10)
        *   [Examples](#examples-10)
    *   [isBlank](#isblank)
        *   [Parameters](#parameters-11)
        *   [Examples](#examples-11)
    *   [isTruthy](#istruthy)
        *   [Parameters](#parameters-12)
        *   [Examples](#examples-12)
    *   [isFalsy](#isfalsy)
        *   [Parameters](#parameters-13)
        *   [Examples](#examples-13)
    *   [isTypeOf](#istypeof)
        *   [Parameters](#parameters-14)
        *   [Examples](#examples-14)
    *   [createTypeChecker](#createtypechecker)
        *   [Parameters](#parameters-15)
        *   [Examples](#examples-15)
    *   [isJson](#isjson)
        *   [Parameters](#parameters-16)
        *   [Examples](#examples-16)
*   [Number](#number)
    *   [isInteger](#isinteger)
        *   [Parameters](#parameters-17)
        *   [Examples](#examples-17)
    *   [isSafeInteger](#issafeinteger)
        *   [Parameters](#parameters-18)
        *   [Examples](#examples-18)
    *   [isFloat](#isfloat)
        *   [Parameters](#parameters-19)
        *   [Examples](#examples-19)
    *   [isFinite](#isfinite)
        *   [Parameters](#parameters-20)
        *   [Examples](#examples-20)
    *   [isInfinite](#isinfinite)
        *   [Parameters](#parameters-21)
        *   [Examples](#examples-21)
    *   [isNaN](#isnan)
        *   [Parameters](#parameters-22)
        *   [Examples](#examples-22)
    *   [isNumeric](#isnumeric)
        *   [Parameters](#parameters-23)
        *   [Examples](#examples-23)
*   [Object](#object)
    *   [isObject](#isobject)
        *   [Parameters](#parameters-24)
        *   [Examples](#examples-24)
    *   [isObjectLike](#isobjectlike)
        *   [Parameters](#parameters-25)
        *   [Examples](#examples-25)
    *   [isPlainObject](#isplainobject)
        *   [Parameters](#parameters-26)
        *   [Examples](#examples-26)
    *   [isCyclic](#iscyclic)
        *   [Parameters](#parameters-27)
        *   [Examples](#examples-27)
    *   [isIterable](#isiterable)
        *   [Parameters](#parameters-28)
        *   [Examples](#examples-28)
    *   [isAsyncIterable](#isasynciterable)
        *   [Parameters](#parameters-29)
        *   [Examples](#examples-29)
    *   [isIteratorLike](#isiteratorlike)
        *   [Parameters](#parameters-30)
        *   [Examples](#examples-30)
    *   [isEmptyIterable](#isemptyiterable)
        *   [Parameters](#parameters-31)
        *   [Examples](#examples-31)
    *   [isBlankIterable](#isblankiterable)
        *   [Parameters](#parameters-32)
        *   [Examples](#examples-32)
    *   [isFunction](#isfunction)
        *   [Parameters](#parameters-33)
        *   [Examples](#examples-33)
    *   [isDate](#isdate)
        *   [Parameters](#parameters-34)
        *   [Examples](#examples-34)
    *   [isValidDate](#isvaliddate)
        *   [Parameters](#parameters-35)
        *   [Examples](#examples-35)
    *   [isInvalidDate](#isinvaliddate)
        *   [Parameters](#parameters-36)
        *   [Examples](#examples-36)
    *   [isRegExp](#isregexp)
        *   [Parameters](#parameters-37)
        *   [Examples](#examples-37)
    *   [isPromise](#ispromise)
        *   [Parameters](#parameters-38)
        *   [Examples](#examples-38)
    *   [isPromiseLike](#ispromiselike)
        *   [Parameters](#parameters-39)
        *   [Examples](#examples-39)
    *   [isThenable](#isthenable)
        *   [Parameters](#parameters-40)
        *   [Examples](#examples-40)
    *   [isError](#iserror)
        *   [Parameters](#parameters-41)
        *   [Examples](#examples-41)
*   [Array](#array)
    *   [isArray](#isarray)
        *   [Parameters](#parameters-42)
        *   [Examples](#examples-42)
    *   [isNonEmptyArray](#isnonemptyarray)
        *   [Parameters](#parameters-43)
        *   [Examples](#examples-43)
    *   [isArrayOf](#isarrayof)
        *   [Parameters](#parameters-44)
        *   [Examples](#examples-44)
    *   [isArrayLike](#isarraylike)
        *   [Parameters](#parameters-45)
        *   [Examples](#examples-45)
    *   [isArrayLikeOf](#isarraylikeof)
        *   [Parameters](#parameters-46)
        *   [Examples](#examples-46)
    *   [isPair](#ispair)
        *   [Parameters](#parameters-47)
        *   [Examples](#examples-47)
*   [Collection](#collection)
    *   [isMap](#ismap)
        *   [Parameters](#parameters-48)
        *   [Examples](#examples-48)
    *   [isMapOf](#ismapof)
        *   [Parameters](#parameters-49)
        *   [Examples](#examples-49)
    *   [isSet](#isset)
        *   [Parameters](#parameters-50)
        *   [Examples](#examples-50)
    *   [isSetOf](#issetof)
        *   [Parameters](#parameters-51)
        *   [Examples](#examples-51)
    *   [isWeakMap](#isweakmap)
        *   [Parameters](#parameters-52)
        *   [Examples](#examples-52)
    *   [isWeakSet](#isweakset)
        *   [Parameters](#parameters-53)
        *   [Examples](#examples-53)
*   [Node](#node-1)
    *   [isNode](#isnode)
        *   [Parameters](#parameters-54)
        *   [Examples](#examples-54)
    *   [isElement](#iselement)
        *   [Parameters](#parameters-55)
        *   [Examples](#examples-55)
    *   [isFragment](#isfragment)
        *   [Parameters](#parameters-56)
        *   [Examples](#examples-56)
*   [Binary](#binary)
    *   [isArrayBuffer](#isarraybuffer)
        *   [Parameters](#parameters-57)
        *   [Examples](#examples-57)
    *   [isSharedArrayBuffer](#issharedarraybuffer)
        *   [Parameters](#parameters-58)
        *   [Examples](#examples-58)
    *   [isArrayBufferView](#isarraybufferview)
        *   [Parameters](#parameters-59)
        *   [Examples](#examples-59)
    *   [isTypedArray](#istypedarray)
        *   [Parameters](#parameters-60)
        *   [Examples](#examples-60)
    *   [isDataView](#isdataview)
        *   [Parameters](#parameters-61)
        *   [Examples](#examples-61)
*   [Conversion](#conversion)
    *   [toArray](#toarray)
        *   [Parameters](#parameters-62)
        *   [Examples](#examples-62)
    *   [toBigInt](#tobigint)
        *   [Parameters](#parameters-63)
        *   [Examples](#examples-63)
    *   [toBoolean](#toboolean)
        *   [Parameters](#parameters-64)
        *   [Examples](#examples-64)
    *   [toDate](#todate)
        *   [Parameters](#parameters-65)
        *   [Examples](#examples-65)
    *   [toInteger](#tointeger)
        *   [Parameters](#parameters-66)
        *   [Examples](#examples-66)
    *   [toNumber](#tonumber)
        *   [Parameters](#parameters-67)
        *   [Examples](#examples-67)
    *   [toObject](#toobject)
        *   [Parameters](#parameters-68)
        *   [Examples](#examples-68)
    *   [toString](#tostring)
        *   [Parameters](#parameters-69)
        *   [Examples](#examples-69)
    *   [toSymbol](#tosymbol)
        *   [Parameters](#parameters-70)
        *   [Examples](#examples-70)
*   [Conditional conversion](#conditional-conversion)
    *   [toArrayIf](#toarrayif)
        *   [Parameters](#parameters-71)
        *   [Examples](#examples-71)
    *   [toBigIntIf](#tobigintif)
        *   [Parameters](#parameters-72)
        *   [Examples](#examples-72)
    *   [toBooleanIf](#tobooleanif)
        *   [Parameters](#parameters-73)
        *   [Examples](#examples-73)
    *   [toDateIf](#todateif)
        *   [Parameters](#parameters-74)
        *   [Examples](#examples-74)
    *   [toIntegerIf](#tointegerif)
        *   [Parameters](#parameters-75)
        *   [Examples](#examples-75)
    *   [toNumberIf](#tonumberif)
        *   [Parameters](#parameters-76)
        *   [Examples](#examples-76)
    *   [toObjectIf](#toobjectif)
        *   [Parameters](#parameters-77)
        *   [Examples](#examples-77)
    *   [toStringIf](#tostringif)
        *   [Parameters](#parameters-78)
        *   [Examples](#examples-78)
    *   [toSymbolIf](#tosymbolif)
        *   [Parameters](#parameters-79)
        *   [Examples](#examples-79)
*   [Type specifications](#type-specifications)

### Primitive

#### isUndefined

Checks for undefined.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isUndefined(undefined); // => true
```

```javascript
isUndefined("x");       // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

#### isNull

Checks for null.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isNull(null); // => true
```

```javascript
isNull("x");  // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

#### isBoolean

Checks for a primitive boolean or genuine boxed Boolean.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isBoolean(false);              // => true
isBoolean(new Boolean(false)); // => true
```

```javascript
isBoolean(0);                  // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.

#### isNumber

Checks for a primitive number or genuine boxed Number, including NaN and infinities.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isNumber(NaN);           // => true
isNumber(new Number(1)); // => true
```

```javascript
isNumber("1");           // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.

#### isString

Checks for a primitive string or genuine boxed String.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isString("x");             // => true
isString(new String("x")); // => true
```

```javascript
isString(1);               // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Intrinsic identity ignores overridden valueOf/toStringTag properties and rejects prototype-only imitations and proxies around wrappers. Returns boolean in TypeScript because structural wrapper interfaces do not prove native identity. Use an exact primitive isTypeOf matcher for primitive-only narrowing.

#### isSymbol

Checks for a primitive symbol.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isSymbol(Symbol("x")); // => true
```

```javascript
isSymbol("x");         // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Symbol and BigInt checks reject boxed values.

#### isBigInt

Checks for a primitive bigint.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isBigInt(1n);  // => true
```

```javascript
isBigInt("x"); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Symbol and BigInt checks reject boxed values.

#### isPrimitive

Checks for null, undefined, boolean, number, bigint, string or symbol primitives.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isPrimitive(null);          // => true
isPrimitive(1n);            // => true
```

```javascript
isPrimitive(new Number(1)); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

The complement of isObject, including browser document.all as non-primitive. This differs from blindly treating every typeof-undefined value as the undefined primitive.

### Utility

#### isNullish

Checks for null or undefined.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isNullish(null);      // => true
isNullish(undefined); // => true
```

```javascript
isNullish(0);         // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Uses strict null/undefined comparisons. Browser document.all is an object, not a nullish value, despite its historical loose-equality behaviour.

#### isNonNullish

Checks for neither null nor undefined; useful with Array.filter.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isNonNullish(0);     // => true
isNonNullish(false); // => true
```

```javascript
isNonNullish(null);  // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

The generic declaration narrows to `NonNullable<T>` without discarding 0, false, empty strings, NaN or 0n.

#### isEmpty

Non-consuming check for nullish values or empty strings, arrays/array-likes, Maps, Sets and plain dictionaries.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isEmpty(null);                // => true
isEmpty([]);                  // => true
isEmpty(new Map());           // => true
isEmpty(Object.create(null)); // => true
```

```javascript
isEmpty([null]);              // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Checks strings, genuine Maps/Sets and validated array-like lengths before inspecting protocols. Unsized iterator/iterable capabilities take precedence over dictionary keys and throw TypeError without calling next or an iterator method. This also applies to plain objects that expose these capabilities. The consuming variants accept synchronous iterables only; next-only iterators need an adapter, and asynchronous iteration must be handled by the caller.

Remaining plain dictionaries use own enumerable string keys. Other unsupported values, such as numbers or Dates, return false. Length/property getters can run; this is non-consuming, not universally side-effect-free.

#### isBlank

Non-consuming shallow blankness check: nullish, whitespace-only string, or supported container holding only nullish values.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isBlank(" \t\n");                 // => true
isBlank([null,undefined]);        // => true
isBlank(new Map([["key",null]])); // => true
```

```javascript
isBlank([""]);                    // => false
isBlank(0);                       // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Uses the same dispatch order and unsized-input errors as isEmpty. Map blankness concerns values, Set blankness concerns items, and dictionary blankness concerns own enumerable string-keyed values. Unsized protocol capabilities take precedence over plain-dictionary handling. Not recursive: an empty string or object inside a container is not nullish.

#### isTruthy

Applies JavaScript boolean coercion.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isTruthy([]);                 // => true
isTruthy(new Boolean(false)); // => true
```

```javascript
isTruthy(0n);                 // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

#### isFalsy

Returns the complement of JavaScript boolean coercion.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isFalsy(NaN); // => true
isFalsy("");  // => true
```

```javascript
isFalsy([]);  // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

#### isTypeOf

Validates a type specification and checks a value against it.

##### Parameters

*   `value` **any** The value to check.
*   `type` **[Type specification](#type-specifications)** The matcher for the value or collection items. An omitted matcher means `undefined`.

##### Examples

```javascript
class Account {}

isTypeOf(42, 'number');                     // => true
isTypeOf(new Account(), Account);           // => true
isTypeOf('hello', { predicate: isString }); // => true
isTypeOf(null, ['string', null]);           // => true
isTypeOf('42', Number);                     // => false
isTypeOf(42, 'nubmer');                     // => throws TypeError
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

See Type specifications for the matcher contract. No constructor coercion. Invalid type names, descriptors, union arrays and non-callable instance hooks are rejected before value matching. Callable instance targets are evaluated with native instanceof: prototype errors can occur at evaluation time. Omitted type means strict undefined, unlike the native typeof name "undefined", which also matches browser document.all.

#### createTypeChecker

Validates and snapshots a matcher structure once, returning a reusable synchronous checker.

##### Parameters

*   `type` **[Type specification](#type-specifications)** The matcher for the value or collection items. An omitted matcher means `undefined`.

##### Examples

```javascript
const isNumberOrNull = createTypeChecker(['number', null]);

isNumberOrNull(42);                         // => true
isNumberOrNull(null);                       // => true
isNumberOrNull('42');                       // => false

const isText = createTypeChecker('string');
[1, 'hello', null, 'world'].filter(isText); // => ['hello', 'world']

createTypeChecker([])(undefined);           // => false
```

Returns **Function** A reusable synchronous `(value) => boolean` checker.

**Notes**

Validates and snapshots each distinct union array once per compilation. Shared arrays stay shared, so repeated branches do not expand into a large tree. Only pure built-in checks are deduplicated; application predicates and instance hooks keep their order, repeat count and live state.

Compilation and evaluation are iterative. They do not use eval or generated source, and no cache is retained across separate calls. Prepare reusable checkers outside hot loops. An omitted type means undefined. Instance-target prototype errors are deferred to native evaluation; compilation does not probe whether a target can be constructed.

#### isJson

Checks whether primitive/boxed string text parses as JSON.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isJson("null");     // => true
isJson("[1,null]"); // => true
```

```javascript
isJson("{bad}");    // => false
isJson({});         // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Accepts JSON scalars as well as objects/arrays. Does not validate a schema or serialisability of arbitrary JS values. Calls captured JSON.parse and ignores boxed-string coercion overrides. Parse once directly when the parsed value is needed.

### Number

#### isInteger

Checks for a finite integral number.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isInteger(1);             // => true
isInteger(new Number(1)); // => true
```

```javascript
isInteger(1.5);           // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

#### isSafeInteger

Checks for an integer in [-9007199254740991, 9007199254740991].

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isSafeInteger(Number.MAX_SAFE_INTEGER);             // => true
isSafeInteger(new Number(Number.MAX_SAFE_INTEGER)); // => true
```

```javascript
isSafeInteger(Number.MAX_SAFE_INTEGER + 1);         // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

#### isFloat

Checks for a finite non-integer number.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isFloat(0.5);             // => true
isFloat(new Number(0.5)); // => true
```

```javascript
isFloat(1);               // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

#### isFinite

Checks for a finite number.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isFinite(1);             // => true
isFinite(new Number(1)); // => true
```

```javascript
isFinite(Infinity);      // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

#### isInfinite

Checks for positive or negative infinity.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isInfinite(-Infinity);             // => true
isInfinite(new Number(-Infinity)); // => true
```

```javascript
isInfinite(NaN);                   // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

#### isNaN

Checks for NaN.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isNaN(NaN);             // => true
isNaN(new Number(NaN)); // => true
```

```javascript
isNaN("NaN");           // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Accepts primitive and boxed Number values, never other coercible values. Reads native boxed payloads without calling overridden coercion methods. Returns boolean rather than claiming that a failed refinement rules out all numbers.

#### isNumeric

Accepts finite primitive/boxed numbers, primitive bigint values and non-whitespace strings that convert to finite numbers.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isNumeric(" 1e3 ");  // => true
isNumeric("0x10");   // => true
isNumeric(1n);       // => true
```

```javascript
isNumeric("   ");    // => false
isNumeric(Infinity); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Uses standard numeric conversion syntax, not a decimal-only grammar. It rejects NaN, Infinity, empty/whitespace-only strings, boolean values, boxed BigInt values and arbitrary coercible objects.

### Object

#### isObject

Accepts all non-null objects and functions.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isObject(Object.create(null)); // => true
isObject(() => {});            // => true
```

```javascript
isObject(null);                // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Uses the object/function boundary rather than realm-specific instanceof Object. Includes the browser document.all object despite its legacy typeof-undefined behaviour.

#### isObjectLike

Accepts non-null objects but excludes functions.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isObjectLike([]);       // => true
```

```javascript
isObjectLike(() => {}); // => false
isObjectLike(null);     // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

This is not a plain-object or dictionary check. Includes browser document.all as an object. Returns boolean in declarations because TypeScript object also includes functions.

#### isPlainObject

Checks for a null prototype or an ordinary Object prototype, including across realms.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isPlainObject({constructor:null});  // => true
isPlainObject(Object.create(null)); // => true
```

```javascript
isPlainObject(new (class A {})());  // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Prototype-based classification, not proof of allocation history. An own constructor field is ordinary data and is not read. Deliberately assigning null/Object.prototype to another value can change this classification. It is not a schema or security check.

#### isCyclic

Detects a cycle through enumerable string-keyed properties, including inherited properties.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
const value = {};
value.self = value;

isCyclic(value);                    // => true
isCyclic({ a: 1, b: { c: 1 } });    // => false

const shared = {};
isCyclic({ a: shared, b: shared }); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

An active-ancestor edge is a cycle; repeated primitives or shared acyclic children are not. Traversal is iterative and completed shared nodes are visited once. Ignores symbols, non-enumerables and Map/Set entries. Assumes a stable graph; getters and proxy traps can run, mutate the graph or throw.

#### isIterable

Checks for a callable Symbol.iterator method.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isIterable([]);         // => true
isIterable("");         // => true
```

```javascript
isIterable({next(){}}); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Does not invoke the iterator method. Method presence does not prove it returns a valid iterator. A property getter/proxy trap may run or throw.

#### isAsyncIterable

Checks for a callable Symbol.asyncIterator method.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
async function* values() {
    yield 1;
}

isAsyncIterable(values()); // => true
isAsyncIterable([]);       // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Does not invoke the method. Checks only the explicit async protocol, not synchronous iterables that for-await-of can adapt. Method presence does not prove valid iteration.

#### isIteratorLike

Checks for a non-null object/function with a callable next method.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
const iterator = [1, 2][Symbol.iterator]();

isIteratorLike(iterator);      // => true
isIteratorLike({ next() {} }); // => true
isIteratorLike([]);            // => false
isIteratorLike({ next: 1 });   // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Does not call next and cannot distinguish synchronous from asynchronous iteration. Does not assert a correct IteratorResult return shape.

#### isEmptyIterable

Explicitly consuming emptiness check for a synchronous iterable.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
function* values() {
    yield 1;
}

isEmptyIterable([]);       // => true
isEmptyIterable(values()); // => false
isEmptyIterable(null);     // => throws TypeError
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Advances until the first item or completion. Early false closes the iterator through native for-of semantics. May execute iterator return()/generator finally blocks. Rejects non-iterables. Do not reuse a one-shot iterator after the check.

#### isBlankIterable

Explicitly consuming shallow blankness check for a synchronous iterable.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
function* values() {
    yield null;
    yield undefined;
}

isBlankIterable(values());                 // => true
isBlankIterable([0]);                      // => false
isBlankIterable(new Map([['key', null]])); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Checks raw yielded items, so a non-empty Map yields non-nullish entry arrays and is not blank, unlike isBlank(map), which checks values. Early false closes the iterator. A nullish-only infinite iterable never completes. Iteration/closing exceptions propagate.

#### isFunction

Checks typeof value === "function".

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isFunction(() => {});   // => true
isFunction(class A {}); // => true
```

```javascript
isFunction({call(){}}); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Includes classes, generators and callable proxies. It does not guarantee that calling the value will succeed; a class cannot be invoked without new.

#### isDate

Checks genuine Date identity, regardless of timestamp validity.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isDate(new Date(NaN)); // => true
```

```javascript
isDate("2026-01-01");  // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Uses native identity checks across realms, not local instanceof. Ignores overridden getTime methods.

#### isValidDate

Checks Date identity and finite timestamp validity.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isValidDate(new Date(0));   // => true
```

```javascript
isValidDate(new Date(NaN)); // => false
isValidDate(0);             // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Foreign dates are supported; overridden instance getTime methods are ignored. Non-Dates return false.

#### isInvalidDate

Checks Date identity and NaN timestamp invalidity.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isInvalidDate(new Date(NaN)); // => true
```

```javascript
isInvalidDate(new Date(0));   // => false
isInvalidDate(0);             // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Foreign dates are supported; overridden instance getTime methods are ignored. Non-Dates return false.

#### isRegExp

Checks RegExp identity without executing the expression or changing lastIndex.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isRegExp(/x/g);             // => true
```

```javascript
isRegExp(RegExp.prototype); // => false
isRegExp("/x/");            // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

The browser fallback uses the intrinsic source getter; supports foreign instances, rejects RegExp.prototype and prototype/tag imitations.

#### isPromise

Performs a local-realm native Promise instanceof check.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isPromise(Promise.resolve(1));   // => true
```

```javascript
isPromise({then(){},catch(){}}); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

This is not an unforgeable native-brand check. Foreign promises can return false and objects inheriting Promise.prototype can return true. Does not subscribe, call then, or create a derived promise. Returns boolean in declarations.

#### isPromiseLike

Checks for callable then and catch methods on a non-null object/function.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isPromiseLike({then(){},catch(){}}); // => true
```

```javascript
isPromiseLike({then(){}});           // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Retains the library-specific then-and-catch contract, which is stricter than JavaScript thenable detection and differs from TypeScript PromiseLike. Does not invoke either method.

#### isThenable

Checks for a non-null object/function with a callable then method.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isThenable({then(){}}); // => true
```

```javascript
isThenable({then:1});   // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Includes foreign/null-prototype objects. Does not invoke then. Shape detection is not proof of Promise/A+ behaviour.

#### isError

Uses captured Error.isError when available; otherwise checks ordinary untagged Error objects conservatively.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isError(new Error("x"));                 // => true
```

```javascript
isError(Object.create(Error.prototype)); // => false
isError({name:"Error",message:"x"});     // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Fallback refuses custom/inherited Symbol.toStringTag without reading its getter, so genuine tagged errors/DOMExceptions may return false on older runtimes. Native branch follows the runtime. Not a security boundary; proxy traps may run.

### Array

#### isArray

Checks native array identity.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isArray([]);                             // => true
```

```javascript
isArray(new Uint8Array(2));              // => false
isArray(Object.create(Array.prototype)); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Uses a captured Array.isArray reference. Supports foreign arrays and non-revoked proxies around arrays. A revoked proxy throws TypeError, preserving native behaviour.

#### isNonEmptyArray

Checks actual array identity and length greater than zero.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isNonEmptyArray([null]);       // => true
isNonEmptyArray(new Array(1)); // => true
```

```javascript
isNonEmptyArray([]);           // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

A hole still contributes to array length. This is separate from element-type validation. An invalid exposed array length (for example from a Proxy) returns false.

#### isArrayOf

Checks whether every element of the array matches the supplied type specification.

##### Parameters

*   `value` **any** The value to check.
*   `type` **[Type specification](#type-specifications)** The matcher for the value or collection items. An omitted matcher means `undefined`.

##### Examples

```javascript
isArrayOf([1,2], "number");   // => true
isArrayOf([], "number");      // => true
```

```javascript
isArrayOf([1,"x"], "number"); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Snapshots length once; reads values live through ordinary numeric property access. Missing indices read undefined unless inherited numeric properties provide values. Appends beyond the original length are ignored. An invalid exposed array length (for example from a Proxy) returns false.

#### isArrayLike

Checks for a non-function value whose numeric length is an integer from zero through Number.MAX_SAFE_INTEGER.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isArrayLike("");           // => true
isArrayLike({length:0});   // => true
```

```javascript
isArrayLike({length:0.5}); // => false
isArrayLike(() => {});     // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Reads length once and does not require every index to exist. Boxed length numbers, negative lengths, fractions, NaN and infinities are invalid. Accessors/proxy traps can run and throw.

#### isArrayLikeOf

Checks whether every element of the array-like value matches the supplied type specification.

##### Parameters

*   `value` **any** The value to check.
*   `type` **[Type specification](#type-specifications)** The matcher for the value or collection items. An omitted matcher means `undefined`.

##### Examples

```javascript
isArrayLikeOf({0:1,length:1}, "number");   // => true
isArrayLikeOf({length:0}, "number");       // => true
```

```javascript
isArrayLikeOf({0:"x",length:1}, "number"); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Snapshots length once; reads values live through ordinary numeric property access. Missing indices read undefined unless inherited numeric properties provide values. Appends beyond the original length are ignored.

#### isPair

Checks actual array identity and length exactly two.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isPair([1,2]);        // => true
isPair(new Array(2)); // => true
```

```javascript
isPair([1]);          // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

### Collection

#### isMap

Checks genuine Map identity using captured, non-mutating native checks.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isMap(new Map());                    // => true
```

```javascript
isMap(Object.create(Map.prototype)); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.

#### isMapOf

Checks all Map keys and values using separate matchers.

##### Parameters

*   `value` **any** The value to check.
*   `keyType` **[Type specification](#type-specifications)** The matcher for Map keys. An omitted matcher means `undefined`.
*   `valueType` **[Type specification](#type-specifications)** The matcher for Map values. An omitted matcher means `undefined`.

##### Examples

```javascript
isMapOf(new Map([["x",1]]), "string", "number"); // => true
isMapOf(new Map(), "string", "number");          // => true
```

```javascript
isMapOf(new Map([[1,1]]), "string", "number");   // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Validates both matcher configurations before inspecting the input. Checks each key before its associated value. Uses native live entry iteration, ignores overridden iterator methods, and supports foreign Maps. Predicates must not mutate the collection.

#### isSet

Checks genuine Set identity using captured, non-mutating native checks.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isSet(new Set());                    // => true
```

```javascript
isSet(Object.create(Set.prototype)); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.

#### isSetOf

Checks whether every element of the Set matches the supplied type specification.

##### Parameters

*   `value` **any** The value to check.
*   `type` **[Type specification](#type-specifications)** The matcher for the value or collection items. An omitted matcher means `undefined`.

##### Examples

```javascript
isSetOf(new Set([1,2]), "number");   // => true
isSetOf(new Set(), "number");        // => true
```

```javascript
isSetOf(new Set([1,"x"]), "number"); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Compiles and fully validates the matcher before inspecting the input, including empty or non-collection inputs. Empty collections pass. Evaluation short-circuits on the first mismatch. Uses captured native Set iteration, ignoring overridden iterator methods. Predicates must not mutate the collection: iteration is live and mutation can affect termination.

#### isWeakMap

Checks genuine WeakMap identity using captured, non-mutating native checks.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isWeakMap(new WeakMap());                    // => true
```

```javascript
isWeakMap(Object.create(WeakMap.prototype)); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.

#### isWeakSet

Checks genuine WeakSet identity using captured, non-mutating native checks.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isWeakSet(new WeakSet());                    // => true
```

```javascript
isWeakSet(Object.create(WeakSet.prototype)); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Supports foreign instances, ignores custom tags and rejects proxies/prototype imitations. Does not enumerate or modify the collection.

### Node

Run the positive examples in a web browser. Without the corresponding DOM constructors, these checks return `false`.

#### isNode

Checks instanceof the available local Node constructor.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isNode(document);     // => true
```

```javascript
isNode({nodeType:1}); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.

#### isElement

Checks instanceof the available local Element constructor.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isElement(document.createElement("div")); // => true
```

```javascript
isElement({nodeType:1});                  // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.

#### isFragment

Checks instanceof the available local DocumentFragment constructor.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isFragment(document.createDocumentFragment()); // => true
```

```javascript
isFragment({nodeType:1});                      // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Browser-only positive example. Returns false when the global constructor is absent. Foreign-realm nodes are outside this local-instance contract; no property-shape or security guarantee.

### Binary

#### isArrayBuffer

Checks genuine ArrayBuffer identity.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isArrayBuffer(new ArrayBuffer(8)); // => true
```

```javascript
isArrayBuffer(new Uint8Array(8));  // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory.

#### isSharedArrayBuffer

Checks genuine SharedArrayBuffer identity.

##### Parameters

*   `value` **any** The value to check.

##### Examples

The positive example requires a runtime that exposes `SharedArrayBuffer`.

```javascript
isSharedArrayBuffer(new SharedArrayBuffer(8)); // => true
```

```javascript
isSharedArrayBuffer(new Uint8Array(8));        // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory. Returns false if SharedArrayBuffer is unavailable.

#### isArrayBufferView

Uses captured ArrayBuffer.isView: typed arrays and DataView are views.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isArrayBufferView(new Uint8Array(2));                // => true
isArrayBufferView(new DataView(new ArrayBuffer(8))); // => true
```

```javascript
isArrayBufferView(new ArrayBuffer(8));               // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Supports foreign and detached views, rejects proxies and prototype imitations.

#### isTypedArray

Checks any native typed-array identity, excluding DataView and ordinary arrays.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isTypedArray(new Uint8Array(2));                // => true
isTypedArray(new BigInt64Array(2));             // => true
```

```javascript
isTypedArray(new DataView(new ArrayBuffer(8))); // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Includes subclasses, foreign instances, detached/out-of-bounds views and Node Buffers. Uses native view identity plus an intrinsic typed-array tag getter, never an exposed custom tag. The declaration exposes a common structural surface rather than a particular element type.

#### isDataView

Checks genuine DataView identity.

##### Parameters

*   `value` **any** The value to check.

##### Examples

```javascript
isDataView(new DataView(new ArrayBuffer(8))); // => true
```

```javascript
isDataView(new Uint8Array(8));                // => false
```

Returns **boolean** `true` when the value satisfies the check; otherwise `false`.

**Notes**

Supports foreign instances and ignores custom tags/prototype imitations. Rejects proxies. Detached/out-of-bounds objects retain their identity; this does not certify usable memory.

### Conversion

These functions explicitly convert values. Native coercion rules, exceptions, and observable side effects are part of their documented contracts.

#### toArray

Creates a new shallow array from iterable or array-like input using Array.from.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toArray(new Set([1, 2]));     // => [1,2]
toArray('A😀B');              // => ["A","😀","B"]
toArray({0: 'x', length: 1}); // => ["x"]
toArray(42);                  // => []
```

Returns **Array** A new shallow array containing the input items.

**Notes**

Iterable input takes precedence over length. Strings are read as Unicode code points; sparse arrays become dense. Null and undefined throw TypeError. Values with neither an iterator nor a usable length produce an empty array. Native length coercion applies, unlike the stricter isArrayLike validator.

Conversion reads properties and consumes finite iterables; infinite iterables do not finish and large inputs can exhaust memory. No clone of nested values, object-entry conversion or scalar wrapping is performed.

#### toBigInt

Converts a value to a primitive bigint with native BigInt conversion.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toBigInt('9007199254740993'); // => 9007199254740993n
toBigInt(true);               // => 1n
toBigInt('0xff');             // => 255n
toBigInt(1.5);                // => throws RangeError
```

Returns **bigint** The converted primitive bigint.

**Notes**

Accepts booleans, integral numbers and integer text, including hexadecimal, binary and octal forms. Fractional/non-finite numbers throw RangeError; invalid integer text throws SyntaxError; null, undefined and symbols throw TypeError. Empty/whitespace text becomes 0n. Already-rounded Number inputs cannot regain lost precision: pass bigint or integer text when exactness matters.

#### toBoolean

Converts a value to a primitive boolean using JavaScript truthiness.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toBoolean(0);                  // => false
toBoolean('false');            // => true
toBoolean(new Boolean(false)); // => true
```

Returns **boolean** The JavaScript truthiness of the input as a primitive boolean.

**Notes**

This is not a boolean-text parser. Nonempty strings such as 'false' and '0', arrays, and boxed false values are truthy. Object conversion hooks are not invoked. Browser document.all retains its platform-defined falsy behaviour.

#### toDate

Preserves genuine Date instances; otherwise constructs a Date from the input.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toDate(0).toISOString();                      // => '1970-01-01T00:00:00.000Z'
toDate('2024-01-01T00:00:00.000Z').getTime(); // => 1704067200000
isInvalidDate(toDate('not a date'));          // => true
isInvalidDate(toDate(undefined));             // => true

const date = new Date(0);
toDate(date) === date;                        // => true
```

Returns **Date** The original genuine Date, or a Date constructed from the input. The result can be invalid.

**Notes**

Genuine local, foreign, subclass and invalid Date instances are returned unchanged, not cloned. Other values use new Date(value): numbers are millisecond timestamps and strings use native date parsing. Invalid input can produce an invalid Date; symbols, bigint and coercion failures can throw. Omitted/undefined input produces an invalid Date rather than the current time.

Prefer ISO date-time strings with an explicit timezone for portable results; validate with isValidDate when required. The TypeScript return type is Date, not the input subtype: structurally Date-compatible inputs can require construction of a new Date without extra input properties.

#### toInteger

Converts with Number, then truncates toward zero with Math.trunc.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toInteger('12.9');               // => 12
toInteger(-12.9);                // => -12
Number.isNaN(toInteger('12px')); // => true
Object.is(toInteger(-0.5), -0);  // => true
toInteger('1e3');                // => 1000
```

Returns **number** The numeric conversion truncated toward zero. The result can be NaN or infinite.

**Notes**

Converts the entire value, not a numeric prefix: '12px' becomes NaN. Negative fractions truncate toward zero, not toward negative infinity. NaN, infinities and signed zero retain Math.trunc behaviour; this function does not guarantee a finite or safe integer. It does not clamp or substitute defaults. Use isInteger/isSafeInteger to validate the result. Symbols and failed object conversions can throw.

#### toNumber

Converts a value to a primitive number using Number.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toNumber('12.5');               // => 12.5
toNumber('0x10');               // => 16
toNumber(null);                 // => 0
Number.isNaN(toNumber('12px')); // => true
```

Returns **number** The converted primitive number. The result can be NaN or infinite.

**Notes**

Native coercion is intentional: null, false and empty/whitespace strings become 0; true becomes 1; invalid numeric text becomes NaN. Unlike isNumeric, whitespace is not rejected. Symbols throw; object coercion hooks may run and throw. Bigints may lose precision or overflow to infinity. No locale parsing or safe-number guarantee is provided. Omitted/undefined input produces NaN.

#### toObject

Preserves objects and functions, boxes primitives, and creates an empty object for nullish input.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toObject(42).valueOf();      // => 42
typeof toObject(42);         // => 'object'
toObject(null);              // => ({})

const object = { x: 1 };
toObject(object) === object; // => true
```

Returns **object** The original object/function, a boxed primitive, or a fresh empty object for nullish input.

**Notes**

Uses native Object conversion; this is neither JSON parsing nor cloning. Non-nullish primitives become wrapper objects. Objects, arrays, functions and even revoked proxies are returned with their existing identity. Each null/undefined conversion creates a fresh ordinary object. Object-conversion hooks are not invoked.

#### toString

Converts a value to a primitive string using String.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toString(42);            // => "42"
toString(null);          // => "null"
toString(Symbol('key')); // => "Symbol(key)"
toString([1, 2]);        // => "1,2"
```

Returns **string** The converted primitive string.

**Notes**

Null becomes 'null' and undefined becomes 'undefined', not an empty string. Primitive symbols use their descriptive string. Arrays use native string conversion; objects may invoke coercion hooks. This is not JSON serialisation. Native exceptions propagate, including conversion of boxed symbols and objects that cannot produce a primitive.

#### toSymbol

Preserves primitive symbols, unboxes genuine Symbol wrappers, or creates a new symbol from a description.

##### Parameters

*   `value` **any** The value to convert.

##### Examples

```javascript
toSymbol('key').description;         // => 'key'
toSymbol('key') !== toSymbol('key'); // => true

const symbol = Symbol('key');
toSymbol(symbol) === symbol;         // => true
toSymbol(Object(symbol)) === symbol; // => true
```

Returns **symbol** The original/unboxed symbol, or a new symbol created from the description.

**Notes**

Genuine boxed symbols are unboxed intrinsically, including across realms; their overridden conversion hooks are not called. Other values follow native Symbol(description) conversion and may throw. Identical descriptions create distinct symbols; Symbol.for is not used. Omitted/undefined input creates a symbol without a description.

### Conditional conversion

Each `If` function accepts a boolean or synchronous boolean-returning predicate. A false, omitted, or `undefined` condition returns the input unchanged without converting or inspecting it.

#### toArrayIf

Applies toArray only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
toArrayIf('ab', true);  // => ["a","b"]
toArrayIf('ab', false); // => "ab"
```

Returns **any** The result of [toArray](#toarray) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toArray contract.

#### toBigIntIf

Applies toBigInt only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
toBigIntIf('42', true);                               // => 42n
toBigIntIf('42', false);                              // => '42'
toBigIntIf('42');                                     // => '42'
toBigIntIf('42', value => typeof value === 'string'); // => 42n
```

Returns **any** The result of [toBigInt](#tobigint) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toBigInt contract.

#### toBooleanIf

Applies toBoolean only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
toBooleanIf(0, true);        // => false
toBooleanIf('false', false); // => "false"
```

Returns **any** The result of [toBoolean](#toboolean) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toBoolean contract.

#### toDateIf

Applies toDate only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
toDateIf(0, true).getTime(); // => 0
toDateIf(0, false);          // => 0
```

Returns **any** The result of [toDate](#todate) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toDate contract.

#### toIntegerIf

Applies toInteger only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
toIntegerIf('4.8', true);  // => 4
toIntegerIf('4.8', false); // => "4.8"
```

Returns **any** The result of [toInteger](#tointeger) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toInteger contract.

#### toNumberIf

Applies toNumber only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
toNumberIf('12', value => typeof value === 'string'); // => 12
toNumberIf('12', false);                              // => "12"
```

Returns **any** The result of [toNumber](#tonumber) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toNumber contract.

#### toObjectIf

Applies toObject only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
typeof toObjectIf(42, true); // => "object"
toObjectIf(42, false);       // => 42
```

Returns **any** The result of [toObject](#toobject) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toObject contract.

#### toStringIf

Applies toString only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
toStringIf(42, true);  // => "42"
toStringIf(42, false); // => 42
```

Returns **any** The result of [toString](#tostring) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toString contract.

#### toSymbolIf

Applies toSymbol only when a boolean condition or synchronous predicate returns true.

##### Parameters

*   `value` **any** The value to convert.
*   `condition` **(boolean | Function)** Optional boolean or synchronous predicate called with the original value. A predicate must return a primitive boolean. If omitted or `undefined`, conversion is skipped.

##### Examples

```javascript
typeof toSymbolIf('key', true); // => "symbol"
toSymbolIf('key', false);       // => "key"
```

Returns **any** The result of [toSymbol](#tosymbol) when the condition is true; otherwise the original value, unchanged.

**Notes**

Returns the original input unchanged when condition is false, undefined or omitted. Predicates receive the original value once, without an explicit receiver, and must return a primitive boolean. Other conditions/results, including Promise results, throw TypeError. Predicate and conversion errors propagate. A skipped conversion never inspects or coerces the input. The true branch follows the full toSymbol contract.

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

The **docs** badge reports the proportion of public functions with checked reference sections: 80 of 80, or 100%. The documentation generator checks the export catalogue, and the README tests compare its sections with the runtime exports. The API has no additional attached methods or exported constants. This measure does not mean every example or possible behaviour is tested.

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
