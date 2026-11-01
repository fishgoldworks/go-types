# Go Types API

Full API documentation for [go-types 2.0.0](../CHANGELOG.md). [Back to README](../README.md) · [Runtime support](../README.md#runtime-support).

Conversion behaviour is also summarised in the [conversion guide](conversions.md).

## Contents

- [API summary](#api-summary)
- [Primitive](#primitive)
- [Utility](#utility)
- [Number](#number)
- [Object](#object)
- [Array](#array)
- [Collection](#collection)
- [DOM](#dom)
- [Binary](#binary)
- [Conversion](#conversion)
- [Conditional conversion](#conditional-conversion)
- [Behaviour](#behaviour)
  - [Checks and conversions](#checks-and-conversions)
  - [Errors and side effects](#errors-and-side-effects)
  - [Empty and blank values](#empty-and-blank-values)
  - [Type specifications](#type-specifications)
- [TypeScript](#typescript)
- [Shared contracts](#shared-contracts)
- [Matcher specification contract](#matcher-specification-contract)

## API summary

All **91 public functions** are documented below. The summaries link to each function's parameters, return value, examples and behavioural notes.

Examples assume the named functions have been imported from `go-types`, unless an import is shown. DOM examples run in a web browser. `// =>` comments show expected results or exceptions.

Parameter tables describe accepted JavaScript values. `unknown` accepts any JavaScript value; `T` preserves the input type. `?` marks an optional argument; **—** means no explicit default is supplied. See [TypeScript](#typescript) for declaration and narrowing behaviour, and [Errors and side effects](#errors-and-side-effects) for shared error rules.

[Primitive](#primitive) · [Utility](#utility) · [Number](#number) · [Object](#object) · [Array](#array) · [Collection](#collection) · [DOM](#dom) · [Binary](#binary) · [Conversion](#conversion) · [Conditional conversion](#conditional-conversion)

**Primitive**

| API | Description | Returns |
| --- | --- | --- |
| [`isUndefined(value)`](#isundefinedvalue) | Checks whether a value is exactly `undefined`. | **`boolean`**<br><br>`true` if the value is `undefined`; otherwise `false`. |
| [`isNull(value)`](#isnullvalue) | Checks whether a value is exactly `null`. | **`boolean`**<br><br>`true` if the value is `null`; otherwise `false`. |
| [`isBoolean(value)`](#isbooleanvalue) | Checks whether a value is a primitive boolean or a genuine boxed `Boolean`. | **`boolean`**<br><br>`true` if the value is a primitive boolean or genuine boxed `Boolean`; otherwise `false`. |
| [`isNumber(value)`](#isnumbervalue) | Checks whether a value is a primitive number or a genuine boxed `Number`. | **`boolean`**<br><br>`true` if the value is a primitive number or genuine boxed `Number`, including `NaN` and infinities; otherwise `false`. |
| [`isString(value)`](#isstringvalue) | Checks whether a value is a primitive string or a genuine boxed `String`. | **`boolean`**<br><br>`true` if the value is a primitive string or genuine boxed `String`; otherwise `false`. |
| [`isSymbol(value)`](#issymbolvalue) | Checks whether a value is a primitive symbol. | **`boolean`**<br><br>`true` if the value is a primitive symbol; otherwise `false`. |
| [`isBigInt(value)`](#isbigintvalue) | Checks whether a value is a primitive bigint. | **`boolean`**<br><br>`true` if the value is a primitive bigint; otherwise `false`. |
| [`isPrimitive(value)`](#isprimitivevalue) | Checks whether a value is a primitive rather than an object or function. | **`boolean`**<br><br>`true` if the value is a primitive, including `null` or `undefined`; otherwise `false`. |

**Utility**

| API | Description | Returns |
| --- | --- | --- |
| [`isNullish(value)`](#isnullishvalue) | Checks whether a value is `null` or `undefined`. | **`boolean`**<br><br>`true` if the value is `null` or `undefined`; otherwise `false`. |
| [`isNotNullish(value)`](#isnotnullishvalue) | Checks whether a value is neither `null` nor `undefined`. | **`boolean`**<br><br>`true` if the value is neither `null` nor `undefined`; otherwise `false`. |
| [`isEmpty(value)`](#isemptyvalue) | Checks whether a value is nullish, an empty string, or an empty supported collection. | **`boolean`**<br><br>`true` if the value is nullish, an empty string, or an empty supported collection; otherwise `false`. |
| [`isBlank(value)`](#isblankvalue) | Checks whether a value is nullish, an empty or whitespace-only string, or a supported collection containing only nullish values. | **`boolean`**<br><br>`true` if the value is nullish, an empty or whitespace-only string, or a supported collection containing only nullish values; otherwise `false`. |
| [`isTruthy(value)`](#istruthyvalue) | Checks whether JavaScript treats a value as `true` in a condition. | **`boolean`**<br><br>`true` if the value is truthy under JavaScript boolean coercion; otherwise `false`. |
| [`isFalsy(value)`](#isfalsyvalue) | Checks whether JavaScript treats a value as `false` in a condition. | **`boolean`**<br><br>`true` if the value is falsy under JavaScript boolean coercion; otherwise `false`. |
| [`isJson(value)`](#isjsonvalue) | Checks whether primitive or boxed string text is valid JSON. | **`boolean`**<br><br>`true` if the value is primitive or boxed string text that parses as JSON; otherwise `false`. |

**Number**

| API | Description | Returns |
| --- | --- | --- |
| [`isInteger(value)`](#isintegervalue) | Checks whether a primitive or boxed number is an integer. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite integral number; otherwise `false`. |
| [`isSafeInteger(value)`](#issafeintegervalue) | Checks whether a primitive or boxed number is an integer in JavaScript’s safe-integer range. | **`boolean`**<br><br>`true` if the value is a primitive or boxed integer within the safe-integer range; otherwise `false`. |
| [`isFloat(value)`](#isfloatvalue) | Checks whether a primitive or boxed number is a finite number with a fractional part. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite non-integer number; otherwise `false`. |
| [`isFinite(value)`](#isfinitevalue) | Checks whether a primitive or boxed number is a finite number. | **`boolean`**<br><br>`true` if the value is a primitive or boxed finite number; otherwise `false`. |
| [`isInfinite(value)`](#isinfinitevalue) | Checks whether a primitive or boxed number is positive or negative infinity. | **`boolean`**<br><br>`true` if the value is primitive or boxed positive or negative infinity; otherwise `false`. |
| [`isNaN(value)`](#isnanvalue) | Checks whether a primitive or boxed number is `NaN`. | **`boolean`**<br><br>`true` if the value is primitive or boxed `NaN`; otherwise `false`. |
| [`isNumeric(value)`](#isnumericvalue) | Checks whether a value is a finite number, a bigint, or non-blank numeric text. | **`boolean`**<br><br>`true` if the value is a finite primitive or boxed number, a primitive bigint, or non-blank string text converting to a finite number; otherwise `false`. |

**Object**

| API | Description | Returns |
| --- | --- | --- |
| [`isObject(value)`](#isobjectvalue) | Checks whether a value is a non-null object or function. | **`boolean`**<br><br>`true` if the value is a non-null object or function; otherwise `false`. |
| [`isPlainObject(value)`](#isplainobjectvalue) | Checks whether a value has a null or ordinary `Object` prototype. | **`boolean`**<br><br>`true` if the value has a null or ordinary `Object` prototype; otherwise `false`. |
| [`isCircular(value)`](#iscircularvalue) | Checks whether a value contains a circular reference through enumerable string-keyed properties, Map keys and values, or Set members. | **`boolean`**<br><br>`true` if following the supported references leads back to an object already on the current path; otherwise `false`. |
| [`isIterable(value)`](#isiterablevalue) | Checks whether a value exposes a synchronous iterator method. | **`boolean`**<br><br>`true` if the value has a callable `Symbol.iterator` method; otherwise `false`. |
| [`isAsyncIterable(value)`](#isasynciterablevalue) | Checks whether a value exposes an asynchronous iterator method. | **`boolean`**<br><br>`true` if the async-iterator symbol is available and the value has a callable `Symbol.asyncIterator` method; otherwise `false`. |
| [`isIteratorLike(value)`](#isiteratorlikevalue) | Checks whether a value is an object or function with a callable `next` method. | **`boolean`**<br><br>`true` if the value is a non-null object or function with a callable `next` method; otherwise `false`. |
| [`isFunction(value)`](#isfunctionvalue) | Checks whether JavaScript reports a value as a function. | **`boolean`**<br><br>`true` if `typeof value` is `"function"`; otherwise `false`. |
| [`isDate(value)`](#isdatevalue) | Checks whether a value is a genuine `Date`, valid or invalid. | **`boolean`**<br><br>`true` if the value is a genuine `Date`, valid or invalid; otherwise `false`. |
| [`isValidDate(value)`](#isvaliddatevalue) | Checks whether a genuine `Date` contains a finite timestamp. | **`boolean`**<br><br>`true` if the value is a genuine `Date` with a finite timestamp; otherwise `false`. |
| [`isInvalidDate(value)`](#isinvaliddatevalue) | Checks whether a genuine `Date` contains a `NaN` timestamp. | **`boolean`**<br><br>`true` if the value is a genuine `Date` with a `NaN` timestamp; otherwise `false`. |
| [`isRegExp(value)`](#isregexpvalue) | Checks whether a value is a genuine regular-expression object. | **`boolean`**<br><br>`true` if the value is a genuine `RegExp` instance; otherwise `false`. |
| [`isPromise(value)`](#ispromisevalue) | Checks whether a value passes the local native `Promise` instance check. | **`boolean`**<br><br>`true` if the value passes the local native `Promise` instance check; otherwise `false`. |
| [`isPromiseLike(value)`](#ispromiselikevalue) | Checks whether a value is an object or function with a callable `then` method. | **`boolean`**<br><br>`true` if the value is a non-null object or function with a callable `then` method; otherwise `false`. |
| [`isError(value)`](#iserrorvalue) | Checks whether a value is recognised as an error by the available native check or fallback. | **`boolean`**<br><br>`true` if the captured native error check, or its conservative fallback, recognises the value as an error; otherwise `false`. |

**Array**

| API | Description | Returns |
| --- | --- | --- |
| [`isArray(value)`](#isarrayvalue) | Checks whether a value is an array, including from another realm. | **`boolean`**<br><br>`true` if the value passes native `Array.isArray`; otherwise `false`. |
| [`isArrayOf(value, matcher)`](#isarrayofvalue-matcher) | Checks whether a value is an array whose items match a type-name string or predicate. | **`boolean`**<br><br>`true` if the value is an array and every element matches the matcher, including an empty array; otherwise `false`. |
| [`isArrayLike(value)`](#isarraylikevalue) | Checks whether a non-function value has a valid numeric length. | **`boolean`**<br><br>`true` if the value is not a function and has a numeric integer length from `0` through `Number.MAX_SAFE_INTEGER`; otherwise `false`. |
| [`isArrayLikeOf(value, matcher)`](#isarraylikeofvalue-matcher) | Checks whether an array-like value contains only items matching a type-name string or predicate. | **`boolean`**<br><br>`true` if the value is array-like and every indexed value matches the matcher, including an empty input; otherwise `false`. |
| [`isPair(value)`](#ispairvalue) | Checks whether a value is an array of length two. | **`boolean`**<br><br>`true` if the value is an array of length `2`; otherwise `false`. |

**Collection**

| API | Description | Returns |
| --- | --- | --- |
| [`isMap(value)`](#ismapvalue) | Checks whether a value is a genuine `Map`. | **`boolean`**<br><br>`true` if the value is a genuine `Map`; otherwise `false`. |
| [`isMapOf(value, keyMatcher, valueMatcher)`](#ismapofvalue-keymatcher-valuematcher) | Checks whether a value is a native Map whose keys and values match their type-name strings or predicates. | **`boolean`**<br><br>`true` if the value is a `Map` whose keys and values match their respective matchers, including an empty `Map`; otherwise `false`. |
| [`isSet(value)`](#issetvalue) | Checks whether a value is a genuine `Set`. | **`boolean`**<br><br>`true` if the value is a genuine `Set`; otherwise `false`. |
| [`isSetOf(value, matcher)`](#issetofvalue-matcher) | Checks whether a value is a native Set whose items match a type-name string or predicate. | **`boolean`**<br><br>`true` if the value is a `Set` whose items all match the matcher, including an empty `Set`; otherwise `false`. |
| [`isWeakMap(value)`](#isweakmapvalue) | Checks whether a value is a genuine `WeakMap`. | **`boolean`**<br><br>`true` if the value is a genuine `WeakMap`; otherwise `false`. |
| [`isWeakSet(value)`](#isweaksetvalue) | Checks whether a value is a genuine `WeakSet`. | **`boolean`**<br><br>`true` if the value is a genuine `WeakSet`; otherwise `false`. |

**DOM**

| API | Description | Returns |
| --- | --- | --- |
| [`isNode(value)`](#isnodevalue) | Checks whether a value is an instance of the local DOM `Node` constructor. | **`boolean`**<br><br>`true` if a local `Node` constructor is available and the value passes its instance check; otherwise `false`. |
| [`isElement(value)`](#iselementvalue) | Checks whether a value is an instance of the local DOM `Element` constructor. | **`boolean`**<br><br>`true` if a local `Element` constructor is available and the value passes its instance check; otherwise `false`. |
| [`isDocumentFragment(value)`](#isdocumentfragmentvalue) | Checks whether a value is an instance of the local DOM `DocumentFragment` constructor. | **`boolean`**<br><br>`true` if a local `DocumentFragment` constructor is available and the value passes its instance check; otherwise `false`. |

**Binary**

| API | Description | Returns |
| --- | --- | --- |
| [`isArrayBuffer(value)`](#isarraybuffervalue) | Checks whether a value is a genuine `ArrayBuffer`. | **`boolean`**<br><br>`true` if the value is a genuine `ArrayBuffer`; otherwise `false`. |
| [`isSharedArrayBuffer(value)`](#issharedarraybuffervalue) | Checks whether a value is a genuine `SharedArrayBuffer`. | **`boolean`**<br><br>`true` if native shared buffers are available and the value is a genuine `SharedArrayBuffer`; otherwise `false`. |
| [`isArrayBufferView(value)`](#isarraybufferviewvalue) | Checks whether a value is a native typed array or `DataView`. | **`boolean`**<br><br>`true` if the value is a native typed array or `DataView`; otherwise `false`. |
| [`isTypedArray(value)`](#istypedarrayvalue) | Checks whether a value is a native typed array, including a Node.js `Buffer`. | **`boolean`**<br><br>`true` if the value is a native typed array, including a Node.js `Buffer`; otherwise `false`. |
| [`isDataView(value)`](#isdataviewvalue) | Checks whether a value is a genuine `DataView`. | **`boolean`**<br><br>`true` if the value is a genuine `DataView`; otherwise `false`. |

**Conversion**

| API | Description | Returns |
| --- | --- | --- |
| [`box(value?)`](#boxvalue) | Wraps non-nullish primitives in their native wrapper objects, preserving objects and nullish values. | **`Boxed<T>`**<br><br>A native wrapper for a non-nullish primitive; otherwise the original object, function or nullish input. |
| [`unbox(value?)`](#unboxvalue) | Extracts the primitive payload of a genuine wrapper, leaving other values unchanged. | **`Unboxed<T>`**<br><br>The genuine wrapper’s primitive payload when its native unboxing operation is available; otherwise the original input. |
| [`toRegExp(value?, flags?)`](#toregexpvalue-flags) | Converts a native pattern and optional `flags` to a genuine `RegExp`. | **`RegExp`**<br><br>A genuine `RegExp`, which may retain input identity under native rules. |
| [`toPromise(value?)`](#topromisevalue) | Converts a value to a native `Promise`, adopting thenables and preserving ordinary local promises. | **`Promise<Awaited<T>>`**<br><br>A native `Promise` that adopts the input; ordinary local promises retain identity. |
| [`toArray(value)`](#toarrayvalue) | Converts a synchronous iterable, plain object or supported array-like input to a new shallow array. | **`ArrayElement<T>[]`**<br><br>A new shallow array containing iterable items, plain object property values or indexed array-like values. |
| [`ensureArray(value?)`](#ensurearrayvalue) | Returns an existing array unchanged or wraps a supplied value as one item. Without arguments, returns an empty array. | **`EnsuredArray<T>`**<br><br>A new empty array when no value is supplied; otherwise the original array or a new array containing the supplied value. |
| [`toBigInt(value?)`](#tobigintvalue) | Converts a value to a primitive bigint using native conversion. | **`bigint`**<br><br>The converted primitive bigint. |
| [`toBoolean(value?)`](#tobooleanvalue) | Converts a value to a boolean using JavaScript truthiness. | **`boolean`**<br><br>`true` if the input is truthy under JavaScript boolean coercion; otherwise `false`. |
| [`toDate(value?)`](#todatevalue) | Converts a value to a `Date`, returning genuine `Date` objects unchanged. The result can be invalid. | **`Date`**<br><br>The original genuine `Date`, or a new `Date` constructed from the input; it may be invalid. |
| [`toInteger(value?)`](#tointegervalue) | Converts a value to a number and truncates it towards zero. | **`number`**<br><br>The numeric conversion truncated towards zero; it may be `NaN` or infinite. |
| [`toJson(value?, replacer?, space?)`](#tojsonvalue-replacer-space) | Serialises a value to JSON text using native `JSON.stringify` behaviour. | **`string \| undefined`**<br><br>JSON text, or `undefined` when native serialisation produces no text, including omitted input without a replacer. |
| [`fromJson(value, reviver?)`](#fromjsonvalue-reviver) | Parses JSON text into a JavaScript value using native `JSON.parse` behaviour. | **`unknown`**<br><br>The parsed value, or any root value returned by the reviver, including `undefined`. TypeScript returns unknown until the caller validates it. |
| [`toMap(value?)`](#tomapvalue) | Converts a plain object or iterable of key/value pairs to a new Map. | **`ConvertedMap<T>`**<br><br>A new Map containing a plain object's own enumerable properties as entries, or the supplied key/value pairs. Omitted or nullish input produces an empty Map. |
| [`toNumber(value?)`](#tonumbervalue) | Converts a value to a primitive number using JavaScript’s `Number` conversion. | **`number`**<br><br>The converted primitive number; it may be `NaN` or infinite. |
| [`toPlainObject(value)`](#toplainobjectvalue) | Creates a plain object from key/value pairs, or makes a shallow copy of an existing plain object. | **`ConvertedPlainObject<T>`**<br><br>A fresh ordinary object containing the copied enumerable properties or supplied entries. |
| [`toSet(value?)`](#tosetvalue) | Converts a synchronous iterable, plain object or supported array-like input to a new shallow Set. | **`ConvertedSet<T>`**<br><br>A new Set of iterable items, plain object property values or indexed array-like values, or an empty Set for omitted or nullish input. |
| [`ensureSet(value?)`](#ensuresetvalue) | Returns an existing Set unchanged, creates a Set from array items, or treats another supplied value as one member. | **`EnsuredSet<T>`**<br><br>The original Set, or a new Set containing array items or one supplied member. With no arguments, a new empty Set. |
| [`toString(value?)`](#tostringvalue) | Converts a value to a primitive string using JavaScript’s `String` conversion. | **`string`**<br><br>The converted primitive string; nullish inputs become their literal text. |
| [`toSymbol(value?)`](#tosymbolvalue) | Converts a value to a primitive symbol, preserving primitive symbols and unboxing genuine Symbol wrappers. | **`symbol`**<br><br>The original or unboxed symbol, or a new symbol created from the description. |

**Conditional conversion**

| API | Description | Returns |
| --- | --- | --- |
| [`boxIf(value, condition?)`](#boxifvalue-condition) | Wraps non-nullish primitives in their native wrapper objects when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| Boxed<T>`**<br><br>The `box` result when requested; otherwise the exact original input. |
| [`unboxIf(value, condition?)`](#unboxifvalue-condition) | Extracts a genuine wrapper’s primitive payload when the condition evaluates to `true` and native unboxing is available. Otherwise, returns the original input unchanged. | **`T \| Unboxed<T>`**<br><br>The `unbox` result when requested; otherwise the exact original input. |
| [`toRegExpIf(value, condition?, flags?)`](#toregexpifvalue-condition-flags) | Converts a native pattern and optional `flags` to a genuine `RegExp` when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| RegExp`**<br><br>The `toRegExp` result when requested; otherwise the exact original input. |
| [`toPromiseIf(value, condition?)`](#topromiseifvalue-condition) | Converts a value to a native `Promise` when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| Promise<Awaited<T>>`**<br><br>The `toPromise` result when requested; otherwise the exact original input. |
| [`toArrayIf(value, condition?)`](#toarrayifvalue-condition) | Converts supported iterable, plain object or array-like input to a new shallow array when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ArrayElement<T>[]`**<br><br>A new shallow array when conversion is requested; otherwise the original input, unchanged. |
| [`toBigIntIf(value, condition?)`](#tobigintifvalue-condition) | Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| bigint`**<br><br>The converted primitive bigint when conversion is requested; otherwise the original input, unchanged. |
| [`toBooleanIf(value, condition?)`](#tobooleanifvalue-condition) | Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| boolean`**<br><br>The input’s boolean truthiness when conversion is requested; otherwise the original input, unchanged. |
| [`toDateIf(value, condition?)`](#todateifvalue-condition) | Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| Date`**<br><br>The original genuine `Date` or a new `Date`, possibly invalid, when conversion is requested; otherwise the original input, unchanged. |
| [`toIntegerIf(value, condition?)`](#tointegerifvalue-condition) | Converts a value to a number and truncates it towards zero when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| number`**<br><br>The numeric conversion truncated towards zero, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged. |
| [`toJsonIf(value, condition?, replacer?, space?)`](#tojsonifvalue-condition-replacer-space) | Serialises a value to JSON text when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| string \| undefined`**<br><br>JSON text or `undefined` when conversion is requested; otherwise the original input, unchanged. |
| [`fromJsonIf(value, condition?, reviver?)`](#fromjsonifvalue-condition-reviver) | Parses JSON when the condition evaluates to `true`; otherwise returns the original input unchanged. | **`T \| unknown`**<br><br>The parsed or revived value when requested; otherwise the original input unchanged. |
| [`toMapIf(value, condition?)`](#tomapifvalue-condition) | Converts a plain object or iterable of key/value pairs to a new Map when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedMap<T>`**<br><br>A new Map when conversion is requested; otherwise the original input, unchanged. |
| [`toNumberIf(value, condition?)`](#tonumberifvalue-condition) | Converts a value to a primitive number when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| number`**<br><br>The converted primitive number, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged. |
| [`toPlainObjectIf(value, condition?)`](#toplainobjectifvalue-condition) | Creates a new plain object when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedPlainObject<T>`**<br><br>A fresh plain object when conversion is requested; otherwise the exact original input. |
| [`toSetIf(value, condition?)`](#tosetifvalue-condition) | Converts supported iterable, plain object or array-like input to a new shallow Set when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedSet<T>`**<br><br>A new Set when conversion is requested; otherwise the original input, unchanged. |
| [`toStringIf(value, condition?)`](#tostringifvalue-condition) | Converts a value to a primitive string when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| string`**<br><br>The converted primitive string when conversion is requested; otherwise the original input, unchanged. |
| [`toSymbolIf(value, condition?)`](#tosymbolifvalue-condition) | Converts a value to a primitive symbol when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| symbol`**<br><br>The original or unboxed symbol, or a new symbol from the description, when conversion is requested; otherwise the original input, unchanged. |

`T` is the input type. `ArrayElement<T>[]` preserves inferred iterable elements and record values, with conservative array-like inference, `ConvertedMap<T>` and `ConvertedSet<T>` preserve inferred collection types, and `ConvertedPlainObject<T>` describes fresh plain objects with optional inferred properties and unknown JSON values. Conditional conversions retain `T` when skipped; literal conditions select the corresponding declaration overload. Checks return boolean values, with narrowing available only where described under [TypeScript](#typescript).

## Primitive

### `isUndefined(value)`

Checks whether a value is exactly `undefined`.

Use this check to distinguish `undefined` from `null` and other empty-looking values. It does not convert the input.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is `undefined`; otherwise `false`.

**Examples**

```javascript
isUndefined(undefined);        // => true
isUndefined("x");              // => false
```

---

### `isNull(value)`

Checks whether a value is exactly `null`.

Use this check when `null` has a different meaning from `undefined`. To accept both, use `isNullish`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is `null`; otherwise `false`.

**Examples**

```javascript
isNull(null);                  // => true
isNull("x");                   // => false
```

---

### `isBoolean(value)`

Checks whether a value is a primitive boolean or a genuine boxed `Boolean`.

Accepts both primitive boolean values and wrapper objects such as `new Boolean(false)`, including wrappers from another realm. It checks the stored native value without converting other inputs.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive boolean or genuine boxed `Boolean`; otherwise `false`.

**Examples**

```javascript
isBoolean(false);                // => true
isBoolean(new Boolean(false));   // => true
isBoolean(0);                    // => false
```

**Notes**

Uses the built-in wrapper operation to read the stored value. Overridden `valueOf` methods and `Symbol.toStringTag` properties are ignored; prototype imitations and proxies around wrappers return `false`.

The TypeScript result is `boolean`: a structural wrapper interface does not prove native identity. For primitive-only narrowing, use native `typeof` checks.

---

### `isNumber(value)`

Checks whether a value is a primitive number or a genuine boxed `Number`.

Accepts both primitive number values and wrapper objects such as `new Number(42)`, including wrappers from another realm. It checks the stored native value without converting other inputs. `NaN` and positive or negative infinity are numbers for this check.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive number or genuine boxed `Number`, including `NaN` and infinities; otherwise `false`.

**Examples**

```javascript
isNumber(NaN);                 // => true
isNumber(new Number(1));       // => true
isNumber("1");                 // => false
```

**Notes**

Uses the built-in wrapper operation to read the stored value. Overridden `valueOf` methods and `Symbol.toStringTag` properties are ignored; prototype imitations and proxies around wrappers return `false`.

The TypeScript result is `boolean`: a structural wrapper interface does not prove native identity. For primitive-only narrowing, use native `typeof` checks.

---

### `isString(value)`

Checks whether a value is a primitive string or a genuine boxed `String`.

Accepts both primitive string values and wrapper objects such as `new String('hello')`, including wrappers from another realm. It checks the stored native value without converting other inputs.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive string or genuine boxed `String`; otherwise `false`.

**Examples**

```javascript
isString("x");                 // => true
isString(new String("x"));     // => true
isString(1);                   // => false
```

**Notes**

Uses the built-in wrapper operation to read the stored value. Overridden `valueOf` methods and `Symbol.toStringTag` properties are ignored; prototype imitations and proxies around wrappers return `false`.

The TypeScript result is `boolean`: a structural wrapper interface does not prove native identity. For primitive-only narrowing, use native `typeof` checks.

---

### `isSymbol(value)`

Checks whether a value is a primitive symbol.

Accepts symbols such as `Symbol("key")`. A boxed symbol, created with `Object(symbol)`, returns `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive symbol; otherwise `false`.

**Examples**

```javascript
isSymbol(Symbol("x"));         // => true
isSymbol("x");                 // => false
```

**Notes**

Unlike `isBoolean`, `isNumber` and `isString`, this check does not accept a wrapper object. Use `toSymbol` to unbox a genuine Symbol wrapper when conversion is intended.

---

### `isBigInt(value)`

Checks whether a value is a primitive bigint.

Accepts primitive bigint values without converting strings or numbers. A boxed bigint returns `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive bigint; otherwise `false`.

**Examples**

Examples using bigint literals require native BigInt support.

```javascript
isBigInt(1n);                  // => true
isBigInt("x");                 // => false
```

**Notes**

Unlike `isBoolean`, `isNumber` and `isString`, this check does not accept a wrapper object. Strings and numbers are not converted; use `toBigInt` when conversion is intended.

---

### `isPrimitive(value)`

Checks whether a value is a primitive rather than an object or function.

Accepts `null`, `undefined`, booleans, numbers, strings, bigints and symbols. Wrapper objects and functions return `false`. This is the complement of `isObject`, including for the browser object `document.all`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive, including `null` or `undefined`; otherwise `false`.

**Examples**

Examples using bigint literals require native BigInt support.

```javascript
isPrimitive(null);             // => true
isPrimitive(1n);               // => true
isPrimitive(new Number(1));    // => false
```

**Notes**

The browser object `document.all` returns `false`, even though its historical `typeof` result is `"undefined"`. The check uses the same object/function boundary as `isObject`.

## Utility

### `isNullish(value)`

Checks whether a value is `null` or `undefined`.

Use this check for absent values while retaining `0`, `false` and the empty string. Unlike loose comparison with `null`, it does not treat the browser object `document.all` as absent.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is `null` or `undefined`; otherwise `false`.

**Examples**

```javascript
isNullish(null);               // => true
isNullish(undefined);          // => true
isNullish(0);                  // => false
```

**Notes**

Uses strict comparisons with `null` and `undefined`. The browser object `document.all` returns `false`, despite its historical loose equality with `null`.

---

### `isNotNullish(value)`

Checks whether a value is neither `null` nor `undefined`.

Use this check to retain present values, including `0`, `false` and the empty string. It can be passed to `Array.filter` and narrows the TypeScript result to `NonNullable<T>`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | The value to check. |

**Returns:** `boolean` — `true` if the value is neither `null` nor `undefined`; otherwise `false`.

**Examples**

```javascript
isNotNullish(0);               // => true
isNotNullish(false);           // => true
isNotNullish(null);            // => false
```

**Notes**

The generic declaration narrows to `NonNullable<T>`. Values such as `0`, `false`, `""`, `NaN` and `0n` are retained.

---

### `isEmpty(value)`

Checks whether a value is nullish, an empty string, or an empty supported collection.

Checks strings and [supported collections](#empty-and-blank-values) without consuming an iterator. `null` and `undefined` count as empty; `[null]` does not. Unsized iterators and iterables throw because their contents cannot be checked without consumption.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is nullish, an empty string, or an empty supported collection; otherwise `false`.

**Errors**

- `TypeError` for unsized iterators or iterables.
- Property getters and proxy traps may throw.
- See [Empty and blank values](#empty-and-blank-values).

**Examples**

```javascript
isEmpty(null);                 // => true
isEmpty([]);                   // => true
isEmpty(new Map());            // => true
isEmpty(Object.create(null));  // => true
isEmpty([null]);               // => false
```

**Notes**

Strings, genuine Maps and Sets, and validated array-like lengths are checked first. For other inputs, callable iterator methods or `next` take precedence over dictionary keys and cause `TypeError`. These methods are detected but never called. This also applies to plain dictionaries exposing those capabilities.

Remaining plain dictionaries are empty when they have no own enumerable string keys. Unsupported values, such as numbers or Dates, return `false`. Property getters and proxy traps can still run: avoiding iteration does not guarantee a check without side effects.

Handle iteration explicitly when consumption is intended. Unavailable native collection types do not prevent loading or checks of other supported values. If a detected collection lacks the required native size or iteration operation, the check throws `TypeError`.

---

### `isBlank(value)`

Checks whether a value is nullish, an empty or whitespace-only string, or a supported collection containing only nullish values.

Accepts nullish values, empty or whitespace-only strings, and [supported collections](#empty-and-blank-values) whose contents are all `null` or `undefined`. The check is shallow: `[null]` is blank, but `[""]` is not. Unsized iterators and iterables throw instead of being consumed.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is nullish, an empty or whitespace-only string, or a supported collection containing only nullish values; otherwise `false`.

**Errors**

- `TypeError` for unsized iterators or iterables.
- Property getters and proxy traps may throw.
- See [Empty and blank values](#empty-and-blank-values).

**Examples**

```javascript
isBlank(" \t\n");                  // => true
isBlank([null,undefined]);         // => true
isBlank(new Map([["key",null]]));  // => true
isBlank([""]);                     // => false
isBlank(0);                        // => false
```

**Notes**

Uses the same input order and unsized-input errors as `isEmpty`. Map checks examine values, Set checks examine items, and dictionary checks examine own enumerable string-keyed values. Iterator capabilities take precedence over plain-dictionary handling.

The check is shallow: every inspected value must be `null` or `undefined`. Empty strings and empty objects inside a collection are not nullish. Unavailable native collection types do not prevent loading or checks of other supported values. If a detected collection lacks the required native size or iteration operation, the check throws `TypeError`.

---

### `isTruthy(value)`

Checks whether JavaScript treats a value as `true` in a condition.

Uses ordinary boolean coercion: non-empty strings and objects are truthy, including `"false"`, `[]` and `new Boolean(false)`. It does not parse boolean text.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is truthy under JavaScript boolean coercion; otherwise `false`.

**Examples**

```javascript
isTruthy([]);                  // => true
isTruthy(new Boolean(false));  // => true
isTruthy(0n);                  // => false
```

---

### `isFalsy(value)`

Checks whether JavaScript treats a value as `false` in a condition.

Returns the opposite of `isTruthy`. This includes values such as `false`, `0`, `""`, `null`, `undefined` and `NaN`; it does not mean only absent values.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is falsy under JavaScript boolean coercion; otherwise `false`.

**Examples**

```javascript
isFalsy(NaN);                  // => true
isFalsy("");                   // => true
isFalsy([]);                   // => false
```

---

### `isJson(value)`

Checks whether primitive or boxed string text is valid JSON.

Accepts text representing JSON objects, arrays or scalar values such as `"42"` and `"null"`. It does not return the parsed value, check a schema, or test whether an arbitrary object can be serialised. Use `fromJson` when you need the parsed result.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is primitive or boxed string text that parses as JSON; otherwise `false`.

**Examples**

```javascript
isJson("null");                // => true
isJson("[1,null]");            // => true
isJson("{bad}");               // => false
isJson({});                    // => false
```

**Notes**

Uses the captured `JSON.parse` function and ignores boxed-string conversion overrides. JSON scalar text passes as well as object or array text. Parse errors produce `false`; no parsed value is retained for the caller. Syntax validity does not enforce unique object keys, finite numeric results or lossless numeric parsing.

## Number

### `isInteger(value)`

Checks whether a primitive or boxed number is an integer.

Finite whole numbers pass; fractional values, `NaN` and infinities do not. Genuine `Number` wrappers are inspected without calling overridden conversion methods. Numeric strings and other coercible values return `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive or boxed finite integral number; otherwise `false`.

**Examples**

```javascript
isInteger(1);                  // => true
isInteger(new Number(1));      // => true
isInteger(1.5);                // => false
```

**Notes**

Reads genuine Number wrappers with the built-in unboxing operation, ignoring overridden conversion methods. Other coercible values are rejected.

The TypeScript result is `boolean`. A failed numeric refinement must not imply that the input is no longer a number.

---

### `isSafeInteger(value)`

Checks whether a primitive or boxed number is an integer in JavaScript’s safe-integer range.

Accepts integers from `-9007199254740991` through `9007199254740991`, inclusive. Genuine `Number` wrappers are inspected without calling overridden conversion methods. Numeric strings and other coercible values return `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive or boxed integer within the safe-integer range; otherwise `false`.

**Examples**

```javascript
isSafeInteger(Number.MAX_SAFE_INTEGER);              // => true
isSafeInteger(new Number(Number.MAX_SAFE_INTEGER));  // => true
isSafeInteger(Number.MAX_SAFE_INTEGER + 1);          // => false
```

**Notes**

Reads genuine Number wrappers with the built-in unboxing operation, ignoring overridden conversion methods. Other coercible values are rejected.

The TypeScript result is `boolean`. A failed numeric refinement must not imply that the input is no longer a number.

---

### `isFloat(value)`

Checks whether a primitive or boxed number is a finite number with a fractional part.

A number such as `1.5` passes; whole numbers, `NaN` and infinities do not. Genuine `Number` wrappers are inspected without calling overridden conversion methods. Numeric strings and other coercible values return `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive or boxed finite non-integer number; otherwise `false`.

**Examples**

```javascript
isFloat(0.5);                  // => true
isFloat(new Number(0.5));      // => true
isFloat(1);                    // => false
```

**Notes**

Reads genuine Number wrappers with the built-in unboxing operation, ignoring overridden conversion methods. Other coercible values are rejected.

The TypeScript result is `boolean`. A failed numeric refinement must not imply that the input is no longer a number.

---

### `isFinite(value)`

Checks whether a primitive or boxed number is a finite number.

Rejects `NaN` and positive or negative infinity. Genuine `Number` wrappers are inspected without calling overridden conversion methods. Numeric strings and other coercible values return `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a primitive or boxed finite number; otherwise `false`.

**Examples**

```javascript
isFinite(1);                   // => true
isFinite(new Number(1));       // => true
isFinite(Infinity);            // => false
```

**Notes**

Reads genuine Number wrappers with the built-in unboxing operation, ignoring overridden conversion methods. Other coercible values are rejected.

The TypeScript result is `boolean`. A failed numeric refinement must not imply that the input is no longer a number.

---

### `isInfinite(value)`

Checks whether a primitive or boxed number is positive or negative infinity.

Accepts `Infinity` and `-Infinity`; finite numbers and `NaN` do not pass. Genuine `Number` wrappers are inspected without calling overridden conversion methods. Numeric strings and other coercible values return `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is primitive or boxed positive or negative infinity; otherwise `false`.

**Examples**

```javascript
isInfinite(-Infinity);               // => true
isInfinite(new Number(-Infinity));   // => true
isInfinite(NaN);                     // => false
```

**Notes**

Reads genuine Number wrappers with the built-in unboxing operation, ignoring overridden conversion methods. Other coercible values are rejected.

The TypeScript result is `boolean`. A failed numeric refinement must not imply that the input is no longer a number.

---

### `isNaN(value)`

Checks whether a primitive or boxed number is `NaN`.

Detects the not-a-number value without converting strings or other inputs. Genuine `Number` wrappers are inspected without calling overridden conversion methods. Numeric strings and other coercible values return `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is primitive or boxed `NaN`; otherwise `false`.

**Examples**

```javascript
isNaN(NaN);                    // => true
isNaN(new Number(NaN));        // => true
isNaN("NaN");                  // => false
```

**Notes**

Reads genuine Number wrappers with the built-in unboxing operation, ignoring overridden conversion methods. Other coercible values are rejected.

The TypeScript result is `boolean`. A failed numeric refinement must not imply that the input is no longer a number.

---

### `isNumeric(value)`

Checks whether a value is a finite number, a bigint, or non-blank numeric text.

Use this check when numeric strings should be accepted without converting the caller’s value. Primitive and boxed finite numbers, primitive bigints, and primitive or boxed strings that convert to finite numbers pass. Empty or whitespace-only strings do not.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a finite primitive or boxed number, a primitive bigint, or non-blank string text converting to a finite number; otherwise `false`.

**Examples**

```javascript
isNumeric(" 1e3 ");            // => true
isNumeric("0x10");             // => true
isNumeric(1n);                 // => true
isNumeric("   ");              // => false
isNumeric(Infinity);           // => false
```

**Notes**

Uses standard numeric conversion syntax, not a decimal-only grammar. It rejects `NaN`, `Infinity`, empty/whitespace-only strings, boolean values, boxed `BigInt` values and arbitrary coercible objects. A passing string need not be exactly representable or within the safe-integer range; underflow to zero still passes.

## Object

### `isObject(value)`

Checks whether a value is a non-null object or function.

Accepts objects of any supported shape, including arrays, dates, wrapper objects and functions. It does not require a plain dictionary or a particular prototype. `null` returns `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a non-null object or function; otherwise `false`.

**Examples**

```javascript
isObject(Object.create(null));   // => true
isObject(() => {});              // => true
isObject(null);                  // => false
```

**Notes**

Uses the JavaScript object/function boundary, so objects from another realm pass without needing a local `instanceof Object` match. The browser object `document.all` also passes despite its legacy `typeof` result.

---

### `isPlainObject(value)`

Checks whether a value has a null or ordinary `Object` prototype.

Recognises ordinary object literals and null-prototype dictionaries, including from another realm. Arrays and class instances with their usual prototypes do not pass. This classifies the current prototype; it does not prove how the value was created or validate its fields.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value has a null or ordinary `Object` prototype; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
isPlainObject({constructor:null});   // => true
isPlainObject(Object.create(null));  // => true
isPlainObject(new (class A {})());   // => false
```

**Notes**

An own `constructor` field is ordinary data and is not read. Assigning `null` or `Object.prototype` as another object’s prototype can change the result. The browser object `document.all` follows this current-prototype rule too; its usual `HTMLAllCollection` prototype does not pass. This is a prototype classification, not a record of how the value was allocated or a validation of its fields.

---

### `isCircular(value)`

Checks whether a value contains a circular reference through enumerable string-keyed properties, Map keys and values, or Set members.

Includes inherited enumerable properties and follows genuine Map keys and values and Set members. Shared references without a cycle are allowed. Ordinary properties are inspected before collection contents.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if following the supported references leads back to an object already on the current path; otherwise `false`.

**Errors**

- Property getters and proxy traps may throw; their errors propagate.
- Requested Map/Set content inspection throws `TypeError` when native traversal support is unavailable.

**Examples**

```javascript
const value = {};
value.self = value;

isCircular(value);                                     // => true
isCircular({ a: 1, b: { c: 1 } });                     // => false

const shared = {};
isCircular({ a: shared, b: shared });                  // => false

const team = { members: new Set() };
team.members.add({ team });
isCircular(team);                                      // => true

const lookup = new Map();
lookup.set(lookup, "self");
isCircular(lookup);                                    // => true
```

**Additional examples**

```javascript
isCircular({a:1,b:{c:1}});                             // => false
isCircular((()=>{const x={};x.self=x;return x;})());   // => true
isCircular(new Map([["item", {}]]));                   // => false
isCircular(new Set([{}]));                             // => false
```

**Notes**

A cycle must lead back to an object on the current path. Shared acyclic objects are allowed; a `false` result does not establish that objects are independently copied or detached from another model. Symbols, non-enumerable properties, WeakMap/WeakSet entries and arbitrary iterable contents are excluded.

Property keys are captured when an object is first visited; their values are read as traversal proceeds. Map keys precede their corresponding values. Stored collection references are collected through captured native `forEach` operations after ordinary properties. Application iterators and method overrides do not select collection contents; their eligible ordinary properties are still inspected.

Keep the graph stable during inspection, including from getters. The result concerns references observed during the call, not an immutable snapshot. Iterative traversal avoids recursive stack growth, and completed shared objects are inspected once. Internal reference tracking falls back to local arrays when weak collections are unavailable; no platform globals are changed.

Native collection recognition uses available captured local operations and supports genuine foreign instances. If native detection is unavailable, only ordinary properties are inspected. A recognised Map or Set without native `forEach` support throws `TypeError` when its contents are reached. Missing optional capabilities do not prevent package loading or checks of unrelated objects. This check does not establish JSON serialisability or safety for an operation that follows different references.

---

### `isIterable(value)`

Checks whether a value exposes a synchronous iterator method.

Returns `true` when `Symbol.iterator` is callable. The method is not invoked, so this detects the capability without consuming the value or proving that iteration will work.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value has a callable `Symbol.iterator` method; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
isIterable([]);                // => true
isIterable("");                // => true
isIterable({next(){}});        // => false
```

**Notes**

The `Symbol.iterator` property is read, but its method is not called. A getter or proxy trap can run or throw, and a callable method can still return an invalid iterator.

---

### `isAsyncIterable(value)`

Checks whether a value exposes an asynchronous iterator method.

Returns `true` when `Symbol.asyncIterator` is available and callable on the value. It does not invoke the method, and a synchronous-only iterable does not pass just because `for await...of` could adapt it.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the async-iterator symbol is available and the value has a callable `Symbol.asyncIterator` method; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

The positive example requires native async-generator support.

```javascript
async function* values() {
  yield 1;
}

isAsyncIterable(values());                 // => true
isAsyncIterable([]);                       // => false
```

**Additional examples**

```javascript
isAsyncIterable((async function*(){})());  // => true
isAsyncIterable([]);                       // => false
```

**Notes**

Checks the explicit `Symbol.asyncIterator` protocol. A synchronous iterable does not pass solely because `for await...of` could adapt it. A callable method need not return a valid iterator.

When `Symbol.asyncIterator` is unavailable, the result is `false` and the input is not inspected. Returns `false` without inspecting the input when `Symbol` itself or `Symbol.asyncIterator` is unavailable.

---

### `isIteratorLike(value)`

Checks whether a value is an object or function with a callable `next` method.

Detects the shape of an iterator without advancing it. The method may be synchronous or asynchronous; this check does not validate the values returned by `next`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a non-null object or function with a callable `next` method; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
const iterator = [1, 2][Symbol.iterator]();

isIteratorLike(iterator);        // => true
isIteratorLike({ next() {} });   // => true
isIteratorLike([]);              // => false
isIteratorLike({ next: 1 });     // => false
```

**Additional examples**

```javascript
isIteratorLike({next(){}});      // => true
isIteratorLike([]);              // => false
isIteratorLike({next:1});        // => false
```

**Notes**

Reads `next` without calling it. This cannot distinguish synchronous from asynchronous iteration or guarantee a valid `IteratorResult` object.

---

### `isFunction(value)`

Checks whether JavaScript reports a value as a function.

Uses `typeof value === "function"`, which includes ordinary functions, classes, generators and callable proxies. Passing does not mean the value can be invoked without `new` or without throwing.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if `typeof value` is `"function"`; otherwise `false`.

**Examples**

```javascript
isFunction(() => {});          // => true
isFunction(class A {});        // => true
isFunction({call(){}});        // => false
```

**Notes**

Classes, generators and callable proxies pass the native `typeof` check. A class still requires `new`, and a proxy or function can throw when called.

---

### `isDate(value)`

Checks whether a value is a genuine `Date`, valid or invalid.

Recognises native Date objects, including from another realm, without relying on their exposed `getTime` method. Use `isValidDate` when a usable timestamp is required.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `Date`, valid or invalid; otherwise `false`.

**Examples**

```javascript
isDate(new Date(NaN));         // => true
isDate("2026-01-01");          // => false
```

**Notes**

Uses a captured native Date operation across realms. Overridden instance `getTime` methods are ignored. The existence of a Date object and the validity of its timestamp are separate checks.

---

### `isValidDate(value)`

Checks whether a genuine `Date` contains a finite timestamp.

Use this after constructing or converting a date when invalid dates must be rejected. Non-Date inputs return `false`; native Date objects from another realm are supported.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `Date` with a finite timestamp; otherwise `false`.

**Examples**

```javascript
isValidDate(new Date(0));      // => true
isValidDate(new Date(NaN));    // => false
isValidDate(0);                // => false
```

**Notes**

Reads the timestamp through a captured native Date operation, ignoring overridden instance `getTime` methods. Dates from another realm are supported; non-Date values return `false`.

---

### `isInvalidDate(value)`

Checks whether a genuine `Date` contains a `NaN` timestamp.

Detects an invalid Date object, such as `new Date("not a date")`. It does not classify non-Date values as invalid dates; those return `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `Date` with a `NaN` timestamp; otherwise `false`.

**Examples**

```javascript
isInvalidDate(new Date(NaN));  // => true
isInvalidDate(new Date(0));    // => false
isInvalidDate(0);              // => false
```

**Notes**

Reads the timestamp through a captured native Date operation, ignoring overridden instance `getTime` methods. Dates from another realm are supported; non-Date values return `false`.

---

### `isRegExp(value)`

Checks whether a value is a genuine regular-expression object.

Recognises `RegExp` instances, including from another realm, without executing the expression or changing `lastIndex`. Prototype or tag imitations do not pass.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `RegExp` instance; otherwise `false`.

**Examples**

```javascript
isRegExp(/x/g);                // => true
isRegExp(RegExp.prototype);    // => false
isRegExp("/x/");               // => false
```

**Notes**

The browser fallback reads the native regular-expression source getter without executing the expression. Objects from another realm are supported; `RegExp.prototype`, proxies and prototype or tag imitations are rejected.

---

### `isPromise(value)`

Checks whether a value passes the local native `Promise` instance check.

Use this for `instanceof Promise` behaviour in the current realm. A promise from another realm can return `false`, while an object inheriting `Promise.prototype` can return `true`. The check does not call `then` or subscribe to the promise.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value passes the local native `Promise` instance check; otherwise `false`.

**Errors**

- Native `instanceof` errors propagate, including errors from proxy prototype access or a custom `Symbol.hasInstance` method.

**Examples**

```javascript
isPromise(Promise.resolve(1));     // => true
isPromise({then(){},catch(){}});   // => false
```

**Notes**

The local `Promise` constructor is checked at call time. A promise from another realm can fail, and an object inheriting `Promise.prototype` can pass. The check neither subscribes to a promise nor creates a derived promise. It returns `boolean` in TypeScript.

---

### `isPromiseLike(value)`

Checks whether a value is an object or function with a callable `then` method.

Recognises promise-like values without requiring a native Promise instance, `catch` or `finally`. It does not invoke `then` or verify promise behaviour.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a non-null object or function with a callable `then` method; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
isPromiseLike(Promise.resolve(1));   // => true
isPromiseLike({then(){}});           // => true
isPromiseLike({then:1});             // => false
```

**Notes**

Inherited methods, objects from another realm and null-prototype objects can pass. The `then` property is read once; getters or proxy traps may run and throw. The return type is `boolean`: a callable method alone cannot establish TypeScript’s full `PromiseLike<T>` contract.

---

### `isError(value)`

Checks whether a value is recognised as an error by the available native check or fallback.

Uses the captured `Error.isError` function when the host provides it. Otherwise, it recognises ordinary untagged Error objects conservatively and rejects custom tags without reading the tag getter. The fallback returns `false` if `Symbol.toStringTag` is unavailable, including for genuine errors.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the captured native error check, or its conservative fallback, recognises the value as an error; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
isError(new Error("x"));                   // => true
isError(Object.create(Error.prototype));   // => false
isError({name:"Error",message:"x"});       // => false
```

**Notes**

When `Error.isError` is unavailable, the fallback refuses an own or inherited `Symbol.toStringTag` without reading its getter. If the tag key is also unavailable, it returns `false` without inspecting the object rather than trusting a possibly customised tag. Genuine errors can therefore fail when detection capabilities are missing. When available, the captured native check determines the result. Proxy traps can still run when the fallback has a usable tag key; the result is not a security guarantee.

## Array

### `isArray(value)`

Checks whether a value is an array, including from another realm.

Uses native `Array.isArray` behaviour. Arrays and non-revoked proxies around arrays pass; array-like objects do not. A revoked proxy throws.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value passes native `Array.isArray`; otherwise `false`.

**Errors**

- `TypeError` for a revoked proxy, following native `Array.isArray` behaviour.

**Examples**

```javascript
isArray([]);                               // => true
isArray(new Uint8Array(2));                // => false
isArray(Object.create(Array.prototype));   // => false
```

**Notes**

Uses the `Array.isArray` function captured when the module loads. This retains native behaviour for arrays from another realm and proxies, including `TypeError` for a revoked proxy.

---

### `isArrayOf(value, matcher)`

Checks whether a value is an array whose items match a type-name string or predicate.

Accepts a native `typeof` name or a synchronous predicate returning a primitive boolean. Valid empty collections pass without calling predicates. Invalid or missing matchers throw before the input is inspected.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `matcher` | [`TypeMatcher`](#type-specifications) | A required native `typeof` name or synchronous boolean predicate for collection items. |

**Returns:** `boolean` — `true` if the value is an array and every element matches the matcher, including an empty array; otherwise `false`.

**Errors**

- `TypeError` for invalid or missing matchers, or a non-boolean predicate result.
- Callback, property-access and native iteration errors propagate.

**Examples**

```javascript
isArrayOf([1,2], "number");    // => true
isArrayOf([], "number");       // => true

isArrayOf([1,"x"], "number");  // => false
```

**Additional examples**

```javascript
isArrayOf([1,2], "number");    // => true
isArrayOf([1,"x"], "number");  // => false
isArrayOf([], "number");       // => true
```

**Notes**

A type-name string uses native `typeof`: `"object"` includes `null`, and `"number"` excludes Number wrappers. Pass `isNumber` to include genuine Number wrappers. Functions are always predicates; for instance checks, use `value => value instanceof Account`. Length is read once. Empty slots use ordinary indexed reads, including inherited values; a missing value is `undefined`. Matching stops at the first failure.

---

### `isArrayLike(value)`

Checks whether a non-function value has a valid numeric length.

Accepts lengths that are integers from `0` through `Number.MAX_SAFE_INTEGER`. It does not require an iterator or stored values at every index. The length is read once; getters and proxy traps may run.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is not a function and has a numeric integer length from `0` through `Number.MAX_SAFE_INTEGER`; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
isArrayLike("");               // => true
isArrayLike({length:0});       // => true
isArrayLike({length:0.5});     // => false
isArrayLike(() => {});         // => false
```

**Notes**

The `length` must already be a primitive number in the accepted range; boxed lengths, negative values, fractions, `NaN` and infinities are rejected. Missing indices are allowed. Reading `length` can invoke a getter or proxy trap.

---

### `isArrayLikeOf(value, matcher)`

Checks whether an array-like value contains only items matching a type-name string or predicate.

Accepts a native `typeof` name or a synchronous predicate returning a primitive boolean. Valid empty collections pass without calling predicates. Invalid or missing matchers throw before the input is inspected.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `matcher` | [`TypeMatcher`](#type-specifications) | A required native `typeof` name or synchronous boolean predicate for collection items. |

**Returns:** `boolean` — `true` if the value is array-like and every indexed value matches the matcher, including an empty input; otherwise `false`.

**Errors**

- `TypeError` for invalid or missing matchers, or a non-boolean predicate result.
- Callback, property-access and native iteration errors propagate.

**Examples**

```javascript
isArrayLikeOf({0:1,length:1}, "number");     // => true
isArrayLikeOf({length:0}, "number");         // => true

isArrayLikeOf({0:"x",length:1}, "number");   // => false
```

**Additional examples**

```javascript
isArrayLikeOf({0:1,length:1}, "number");     // => true
isArrayLikeOf({0:"x",length:1}, "number");   // => false
isArrayLikeOf({length:0}, "number");         // => true
```

**Notes**

A type-name string uses native `typeof`: `"object"` includes `null`, and `"number"` excludes Number wrappers. Pass `isNumber` to include genuine Number wrappers. Functions are always predicates; for instance checks, use `value => value instanceof Account`. Length is read once. Empty slots use ordinary indexed reads, including inherited values; a missing value is `undefined`. Matching stops at the first failure.

---

### `isPair(value)`

Checks whether a value is an array of length two.

Checks the array’s length rather than whether both positions contain values. Sparse arrays of length two pass; array-like objects do not. See [`toMap`](#tomapvalue) and [`toPlainObject`](#toplainobjectvalue) for stricter entry requirements.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is an array of length `2`; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.
- Native `Array.isArray` also throws `TypeError` for a revoked proxy.

**Examples**

```javascript
isPair([1,2]);                 // => true
isPair(new Array(2));          // => true
isPair([1]);                   // => false
```

## Collection

### `isMap(value)`

Checks whether a value is a genuine `Map`.

Recognises native `Map` instances, including from another realm. It does not enumerate or modify the collection. Proxies, prototype imitations and matching tags do not establish native identity.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `Map`; otherwise `false`.

**Examples**

```javascript
isMap(new Map());                      // => true
isMap(Object.create(Map.prototype));   // => false
```

**Notes**

Uses native collection identity across realms without enumerating or changing the contents. A custom `Symbol.toStringTag` is ignored. A proxy or an object merely inheriting the collection prototype returns `false`. Returns `false` when the local native detection capability is unavailable.

---

### `isMapOf(value, keyMatcher, valueMatcher)`

Checks whether a value is a native Map whose keys and values match their type-name strings or predicates.

Accepts a native `typeof` name or a synchronous predicate returning a primitive boolean. Valid empty collections pass without calling predicates. Invalid or missing matchers throw before the input is inspected.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `keyMatcher` | [`TypeMatcher`](#type-specifications) | A required native `typeof` name or synchronous boolean predicate for Map keys. |
| `valueMatcher` | [`TypeMatcher`](#type-specifications) | A required native `typeof` name or synchronous boolean predicate for Map values. |

**Returns:** `boolean` — `true` if the value is a `Map` whose keys and values match their respective matchers, including an empty `Map`; otherwise `false`.

**Errors**

- `TypeError` for invalid or missing matchers, or a non-boolean predicate result.
- Callback, property-access and native iteration errors propagate.

**Examples**

```javascript
isMapOf(new Map([["x",1]]), "string", "number");   // => true
isMapOf(new Map(), "string", "number");            // => true
isMapOf(new Map([[1,1]]), "string", "number");     // => false
```

**Notes**

A type-name string uses native `typeof`: `"object"` includes `null`, and `"number"` excludes Number wrappers. Pass `isNumber` to include genuine Number wrappers. Functions are always predicates; for instance checks, use `value => value instanceof Account`. Uses captured native iteration and ignores overridden instance iterators. Iteration is live; predicates must not mutate the collection. Matching stops at the first failure. Both matchers are validated in key/value order before inspection; each key is checked before its associated value.

---

### `isSet(value)`

Checks whether a value is a genuine `Set`.

Recognises native `Set` instances, including from another realm. It does not enumerate or modify the collection. Proxies, prototype imitations and matching tags do not establish native identity.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `Set`; otherwise `false`.

**Examples**

```javascript
isSet(new Set());                      // => true
isSet(Object.create(Set.prototype));   // => false
```

**Notes**

Uses native collection identity across realms without enumerating or changing the contents. A custom `Symbol.toStringTag` is ignored. A proxy or an object merely inheriting the collection prototype returns `false`. Returns `false` when the local native detection capability is unavailable.

---

### `isSetOf(value, matcher)`

Checks whether a value is a native Set whose items match a type-name string or predicate.

Accepts a native `typeof` name or a synchronous predicate returning a primitive boolean. Valid empty collections pass without calling predicates. Invalid or missing matchers throw before the input is inspected.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `matcher` | [`TypeMatcher`](#type-specifications) | A required native `typeof` name or synchronous boolean predicate for collection items. |

**Returns:** `boolean` — `true` if the value is a `Set` whose items all match the matcher, including an empty `Set`; otherwise `false`.

**Errors**

- `TypeError` for invalid or missing matchers, or a non-boolean predicate result.
- Callback, property-access and native iteration errors propagate.

**Examples**

```javascript
isSetOf(new Set([1,2]), "number");     // => true
isSetOf(new Set(), "number");          // => true

isSetOf(new Set([1,"x"]), "number");   // => false
```

**Additional examples**

```javascript
isSetOf(new Set([1,2]), "number");     // => true
isSetOf(new Set([1,"x"]), "number");   // => false
isSetOf(new Set(), "number");          // => true
```

**Notes**

A type-name string uses native `typeof`: `"object"` includes `null`, and `"number"` excludes Number wrappers. Pass `isNumber` to include genuine Number wrappers. Functions are always predicates; for instance checks, use `value => value instanceof Account`. Uses captured native iteration and ignores overridden instance iterators. Iteration is live; predicates must not mutate the collection. Matching stops at the first failure.

---

### `isWeakMap(value)`

Checks whether a value is a genuine `WeakMap`.

Recognises native `WeakMap` instances, including from another realm. It does not enumerate or modify the collection. Proxies, prototype imitations and matching tags do not establish native identity.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `WeakMap`; otherwise `false`.

**Examples**

```javascript
isWeakMap(new WeakMap());                      // => true
isWeakMap(Object.create(WeakMap.prototype));   // => false
```

**Notes**

Uses native collection identity across realms without enumerating or changing the contents. A custom `Symbol.toStringTag` is ignored. A proxy or an object merely inheriting the collection prototype returns `false`. Returns `false` when the local native detection capability is unavailable.

---

### `isWeakSet(value)`

Checks whether a value is a genuine `WeakSet`.

Recognises native `WeakSet` instances, including from another realm. It does not enumerate or modify the collection. Proxies, prototype imitations and matching tags do not establish native identity.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `WeakSet`; otherwise `false`.

**Examples**

```javascript
isWeakSet(new WeakSet());                      // => true
isWeakSet(Object.create(WeakSet.prototype));   // => false
```

**Notes**

Uses native collection identity across realms without enumerating or changing the contents. A custom `Symbol.toStringTag` is ignored. A proxy or an object merely inheriting the collection prototype returns `false`. Returns `false` when the local native detection capability is unavailable.

## DOM

Run the positive examples in a web browser. Without the corresponding DOM constructors, these checks return `false`.

### `isNode(value)`

Checks whether a value is an instance of the local DOM `Node` constructor.

Use this for DOM objects from the current browser realm. Returns `false` when the constructor is unavailable; objects from an iframe or another realm may fail the local instance check.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if a local `Node` constructor is available and the value passes its instance check; otherwise `false`.

**Errors**

- Native `instanceof` errors propagate, including errors from proxy prototype access or a custom `Symbol.hasInstance` method.

**Examples**

```javascript
isNode(document);              // => true
isNode({nodeType:1});          // => false
```

**Notes**

Positive examples require a browser with the corresponding DOM constructor. The constructor is checked at call time; absence produces `false`. Native local-instance rules apply, so this does not validate an object’s properties or recognise every DOM object from another realm.

---

### `isElement(value)`

Checks whether a value is an instance of the local DOM `Element` constructor.

Use this for DOM objects from the current browser realm. Returns `false` when the constructor is unavailable; objects from an iframe or another realm may fail the local instance check.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if a local `Element` constructor is available and the value passes its instance check; otherwise `false`.

**Errors**

- Native `instanceof` errors propagate, including errors from proxy prototype access or a custom `Symbol.hasInstance` method.

**Examples**

```javascript
isElement(document.createElement("div"));  // => true
isElement({nodeType:1});                   // => false
```

**Notes**

Positive examples require a browser with the corresponding DOM constructor. The constructor is checked at call time; absence produces `false`. Native local-instance rules apply, so this does not validate an object’s properties or recognise every DOM object from another realm.

---

### `isDocumentFragment(value)`

Checks whether a value is an instance of the local DOM `DocumentFragment` constructor.

Use this for DOM objects from the current browser realm. Returns `false` when the constructor is unavailable; objects from an iframe or another realm may fail the local instance check.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if a local `DocumentFragment` constructor is available and the value passes its instance check; otherwise `false`.

**Errors**

- Native `instanceof` errors propagate, including errors from proxy prototype access or a custom `Symbol.hasInstance` method.

**Examples**

```javascript
isDocumentFragment(document.createDocumentFragment());   // => true
isDocumentFragment({nodeType:1});                        // => false
```

**Notes**

Positive examples require a browser with the corresponding DOM constructor. The constructor is checked at call time; absence produces `false`. Native local-instance rules apply, so this does not validate an object’s properties or recognise every DOM object from another realm.

## Binary

### `isArrayBuffer(value)`

Checks whether a value is a genuine `ArrayBuffer`.

Recognises native ArrayBuffer objects, including from another realm. Proxies and prototype or tag imitations do not pass. A detached buffer still passes: this check does not establish that its memory can be used.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `ArrayBuffer`; otherwise `false`.

**Examples**

```javascript
isArrayBuffer(new ArrayBuffer(8));   // => true
isArrayBuffer(new Uint8Array(8));    // => false
```

**Notes**

Custom tags are ignored. A detached ArrayBuffer retains its native identity; use the intended buffer operation to determine whether memory is usable. Returns `false` when the local native detection capability is unavailable.

---

### `isSharedArrayBuffer(value)`

Checks whether a value is a genuine `SharedArrayBuffer`.

Recognises native shared buffers, including from another realm, without accepting proxies or prototype or tag imitations. Returns `false` when the host does not provide `SharedArrayBuffer`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if native shared buffers are available and the value is a genuine `SharedArrayBuffer`; otherwise `false`.

**Examples**

The positive example requires native `SharedArrayBuffer` support.

```javascript
isSharedArrayBuffer(new SharedArrayBuffer(8));   // => true
isSharedArrayBuffer(new Uint8Array(8));          // => false
```

**Notes**

Custom tags are ignored. This identifies a shared buffer; it does not validate the memory access or synchronisation required by the caller. Returns `false` when the local native detection capability is unavailable.

---

### `isArrayBufferView(value)`

Checks whether a value is a native typed array or `DataView`.

Uses native `ArrayBuffer.isView` to recognise views, including detached views and views from another realm. Ordinary arrays, proxies and prototype imitations return `false`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a native typed array or `DataView`; otherwise `false`.

**Examples**

```javascript
isArrayBufferView(new Uint8Array(2));                  // => true
isArrayBufferView(new DataView(new ArrayBuffer(8)));   // => true
isArrayBufferView(new ArrayBuffer(8));                 // => false
```

**Notes**

Native view identity survives detachment. Proxies and objects that merely inherit a view prototype are rejected. A passing result does not guarantee that a later memory operation will succeed. Falls back to native DataView and typed-array identity checks when `ArrayBuffer.isView` is unavailable; returns `false` if none of those checks is available.

---

### `isTypedArray(value)`

Checks whether a value is a native typed array, including a Node.js `Buffer`.

Accepts number and bigint typed arrays, subclasses and foreign instances. Ordinary arrays and `DataView` objects are excluded. Detached or out-of-bounds views still pass because this checks identity, not memory usability.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a native typed array, including a Node.js `Buffer`; otherwise `false`.

**Examples**

```javascript
isTypedArray(new Uint8Array(2));                 // => true
isTypedArray(new BigInt64Array(2));              // => true
isTypedArray(new DataView(new ArrayBuffer(8)));  // => false
```

**Notes**

Includes subclasses, foreign instances, Node.js Buffers and detached or out-of-bounds views. Uses native view identity and the built-in typed-array tag getter rather than an exposed custom tag.

The declaration describes the common typed-array surface; it does not identify the element type or guarantee usable memory. Uses captured native tag or length getters; returns `false` if no usable native detection getter is available. Missing `Symbol`, `Reflect` or `ArrayBuffer.isView` does not prevent loading.

---

### `isDataView(value)`

Checks whether a value is a genuine `DataView`.

Recognises native `DataView` identity, including from another realm, without accepting proxies or prototype/tag imitations. Identity does not guarantee usable memory: detached or out-of-bounds objects retain their identity.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a genuine `DataView`; otherwise `false`.

**Examples**

```javascript
isDataView(new DataView(new ArrayBuffer(8)));  // => true
isDataView(new Uint8Array(8));                 // => false
```

**Notes**

Custom tags are ignored; proxies and prototype imitations return `false`. Detached and out-of-bounds views retain their identity, so a passing result does not guarantee that a later memory operation will succeed. Returns `false` when the local native detection capability is unavailable.

## Conversion

These functions convert or normalise values. Each function documents its input, copying and coercion rules.

### `box(value?)`

Wraps non-nullish primitives in their native wrapper objects, preserving objects and nullish values.

Creates native wrappers for primitive values without invoking conversion hooks. Existing objects, functions, `null` and `undefined` retain their identity; this is a shallow operation.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `T` | `undefined` | The value to convert. |

**Returns:** `Boxed<T>` — A native wrapper for a non-nullish primitive; otherwise the original object, function or nullish input.

**Examples**

```javascript
box(3).valueOf();                                              // => 3
box(false).valueOf();                                          // => false
box(null) === null;                                            // => true
box() === undefined;                                           // => true
(() => { const value = {}; return box(value) === value; })();  // => true
```

**Notes**

No input coercion hooks are called. Uses captured native `Object` boxing. Strings, numbers, booleans, symbols and bigints become genuine wrappers. Omitted input returns `undefined`. Held symbol and bigint primitives can still be boxed when their public constructors are unavailable. No recursive transformation is performed.

---

### `unbox(value?)`

Extracts the primitive payload of a genuine wrapper, leaving other values unchanged.

Reads the stored primitive value of native wrappers without calling overridden conversion hooks. Other values retain their identity; missing native `Symbol`/`BigInt` unboxing support leaves those wrappers unchanged.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `T` | `undefined` | The value to convert. |

**Returns:** `Unboxed<T>` — The genuine wrapper’s primitive payload when its native unboxing operation is available; otherwise the original input.

**Examples**

```javascript
unbox(new Number(3));                                                                  // => 3
unbox(new Boolean(false));                                                             // => false
unbox(new String("text"));                                                             // => "text"
unbox(null) === null;                                                                  // => true
(() => { const value = {valueOf() {return 1;}}; return unbox(value) === value; })();   // => true
```

**Notes**

No input coercion hooks are called. Supports genuine `Boolean`, `Number`, `String`, `Symbol` and `BigInt` wrappers from any realm, including subclasses. Does not call arbitrary `valueOf`, `toString` or `Symbol.toPrimitive` methods, read custom tags, or traverse proxies. Dates, ordinary objects, functions, prototype imitations and proxies around wrappers are returned unchanged. Omitted input remains `undefined`. If a corresponding native unboxing intrinsic was unavailable during module initialisation, that wrapper remains unchanged. TypeScript retains the original object type and all possible primitive payload types: structural properties cannot prove a wrapper brand, even when an object is typed as `Number` or has custom properties.

---

### `toRegExp(value?, flags?)`

Converts a native pattern and optional `flags` to a genuine `RegExp`.

Uses native pattern syntax without escaping text or parsing slash-delimited strings as regex literals. Genuine local RegExps can retain identity when `flags` are omitted or `undefined`; copied expressions start with `lastIndex` zero.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |
| `flags?` | `string` | `undefined` | Native RegExp flags. Omitted or `undefined` preserves a RegExp input’s flags; explicit flags replace them. |

**Returns:** `RegExp` — A genuine `RegExp`, which may retain input identity under native rules.

**Errors**

- Invalid patterns or `flags` throw `SyntaxError`.
- Native coercion, getters and proxy errors propagate unchanged.

**Examples**

```javascript
toRegExp('a.b', 'i').test('AxB');                                      // => true
toRegExp().source;                                                     // => "(?:)"
toRegExp('/a/i').test('a');                                            // => false
(() => { const value = /a/g; return toRegExp(value) === value; })();   // => true
```

**Notes**

Uses native `RegExp` function-call semantics for genuine expressions and construction for other input. A genuine local `RegExp` with its ordinary constructor and omitted or `undefined` `flags` retains identity and `lastIndex`. Foreign expressions, subclasses with their ordinary constructors, and inputs with explicit `flags` produce a new expression. Regex-shaped ordinary objects never receive the native identity shortcut. Native `Symbol.match`, `source`, `flags` and coercion rules still apply, including observable getters. Pattern text is not escaped, and slash-delimited text is not parsed as a JavaScript regex literal. Omitted or `undefined` input creates an empty expression. Supported syntax and `flags` depend on the host; this function does not execute or bound the cost of matching.

---

### `toPromise(value?)`

Converts a value to a native `Promise`, adopting thenables and preserving ordinary local promises.

Uses captured native `Promise.resolve` semantics to adopt a promise or thenable, or fulfil with another value. Functions remain values; they are not callbacks to invoke.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `T` | `undefined` | The value to convert. |

**Returns:** `Promise<Awaited<T>>` — A native `Promise` that adopts the input; ordinary local promises retain identity.

**Errors**

- Missing `Promise.resolve` support throws `TypeError` before input inspection.
- Native synchronous errors propagate; native resolution failures produce rejected promises.

**Examples**

```javascript
isPromise(toPromise(3));                                                             // => true
(() => { const value = Promise.resolve(3); return toPromise(value) === value; })();  // => true
```

**Notes**

Omitted input fulfils with `undefined`. Foreign promises and thenables are adopted with native resolution timing and receiver rules. Then getter or method errors become rejections; native `Promise` constructor lookup can throw synchronously. Rejections are not swallowed. Functions are not called, callbacks are not promisified, and errors thrown while evaluating arguments occur before conversion. TypeScript returns `Promise<Awaited<T>>`. If `Promise` or its resolve operation was unavailable at module initialisation, requested conversion throws before reading the input. No polyfill is installed.

---

### `toArray(value)`

Converts a synchronous iterable, plain object or supported array-like input to a new shallow array.

Consumes synchronous iterables first, copies plain object property values second, and reads supported non-plain array-like inputs third. Plain object copying includes own enumerable string and symbol properties, including a property named length. Nullish input and unsupported values throw instead of producing an empty array.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | The value to convert. |

**Returns:** `ArrayElement<T>[]` — A new shallow array containing iterable items, plain object property values or indexed array-like values.

**Errors**

- TypeError for nullish or unsupported input, malformed iterators or invalid array-like lengths.
- Oversized array results can throw RangeError.
- Getter, proxy and iterator errors propagate.
- Missing native Array.from throws before conversion; object copying requires symbol-enumeration support.

**Examples**

```javascript
toArray(new Set([1, 2]));                                                    // => [1,2]
toArray('A😀B');                                                             // => ["A","😀","B"]
toArray({0: 'x', length: 1});                                                // => ["x",1]
toArray({a: 1, b: 2});                                                       // => [1,2]
(() => { const key = Symbol('key'); return toArray({a: 1, [key]: 2}); })();  // => [1,2]
```

**Notes**

Functions, boxed primitives, Dates and RegExps are rejected before inspecting iterator or length properties. Other non-string primitives are unsupported. On eligible inputs a synchronous iterator takes precedence over object properties and indexed values. The iterator method is read once and called with the original input as receiver; null or undefined permits fallback, while other non-callable methods throw.

Plain objects include null-prototype and foreign-realm objects. Own string and symbol keys are snapshotted in property order; each current enumerable descriptor is checked and each included value is read once. Inherited and non-enumerable properties are excluded, newly added keys are not copied, and deleted or newly hidden keys are skipped. A length property is ordinary property data.

Only non-plain array-like inputs use indexed fallback. Their length must be a primitive number that is an integer between zero and Number.MAX_SAFE_INTEGER, matching isArrayLike; strings, fractions and coercible objects are rejected. Length is read once and indexed values are read live. Missing slots become explicit undefined and inherited numeric values are included. Strings iterate by Unicode code point. Nested values retain identity.

Ordinary promises and native async-only collections without a supported synchronous source are rejected. No input is awaited. A plain async-only object is copied as data, including an enumerable async-iterator symbol and its value. Finite one-shot iterators are consumed; infinite iterables do not finish and very large inputs can exhaust memory. Requires native Array.from. Object copying requires Reflect.ownKeys or Object.getOwnPropertySymbols; if both are missing it throws instead of silently discarding possible symbol keys.

If a copied object has an enumerable nullish Symbol.iterator value, the value captured during source dispatch is reused; its getter is not read a second time. Other selected property values are read live after checking their current descriptor.

---

### `ensureArray(value?)`

Returns an existing array unchanged or wraps a supplied value as one item. Without arguments, returns an empty array.

Use this for inputs that accept one item or an array. Omission differs from an explicitly supplied undefined value. Use [toArray](#toarrayvalue) to extract supported input contents into a new shallow array.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value?` | `T` | The value to normalise. Omit to create an empty array; explicit undefined or null remains one item. |

**Returns:** `EnsuredArray<T>` — A new empty array when no value is supplied; otherwise the original array or a new array containing the supplied value.

**Errors**

- Native `Array.isArray` errors propagate, including `TypeError` for revoked proxies.

**Examples**

```javascript
ensureArray();                                                               // => []
ensureArray(1);                                                              // => [1]
ensureArray('hello');                                                        // => ['hello']
ensureArray(null);                                                           // => [null]
ensureArray(undefined);                                                      // => [undefined]

const items = [1, 2];
ensureArray(items) === items;                                                // => true
```

**Additional examples**

```javascript
ensureArray();                                                               // => []
ensureArray(1);                                                              // => [1]
ensureArray("hello");                                                        // => ["hello"]
ensureArray({id: 1});                                                        // => [{"id":1}]
ensureArray(null);                                                           // => [null]
ensureArray(undefined)[0] === undefined;                                     // => true
(()=>{const items=[1,2];return ensureArray(items)===items;})();              // => true
(()=>{const value=new Set([1,2]);return ensureArray(value)[0]===value;})();  // => true
```

**Notes**

Arrays retain their identity, including empty, sparse, frozen, subclassed and foreign arrays. Other supplied values, including `null` and `undefined`, are single items; strings and other collections are not expanded. A preserved array is not an independent copy. Omitting the argument creates a fresh empty array. Additional callback arguments are ignored.

TypeScript infers item, array and tuple types while preserving readonly restrictions. It does not promise custom array-subtype properties. Inputs typed only as `object`, `unknown` or `{}` have conservative `readonly unknown[]` results because they may hide arrays. Inference follows declared array structure; TypeScript cannot prove native array identity for fabricated array-shaped objects. Pass such inputs as `unknown` when their native identity is uncertain. Direct `map(ensureArray)` calls work but infer broad results; use `map(value => ensureArray(value))` for precise element inference. A zero-argument call can select the element type, for example `ensureArray<number>()`.

---

### `toBigInt(value?)`

Converts a value to a primitive bigint using native conversion.

Accepts booleans, integral numbers and integer text, including hexadecimal, binary and octal forms. Use bigint or integer text when exactness matters: conversion cannot recover precision already lost in a Number. Native BigInt support is required only when this conversion is called.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |

**Returns:** `bigint` — The converted primitive bigint.

**Errors**

- `RangeError` for fractional or non-finite numbers; `SyntaxError` for invalid integer text; `TypeError` for nullish values, symbols, or unavailable native BigInt support.
- Object-coercion errors propagate.

**Examples**

Examples using bigint literals require native BigInt support.

```javascript
toBigInt('9007199254740993');                        // => 9007199254740993n
toBigInt(true);                                      // => 1n
toBigInt('0xff');                                    // => 255n
toBigInt(1.5);                                       // => throws RangeError
```

**Additional examples**

```javascript
toBigInt('9007199254740993') === 9007199254740993n;  // => true
toBigInt(true) === 1n;                               // => true
toBigInt('0xff') === 255n;                           // => true
```

**Notes**

Empty and whitespace-only strings become `0n`. Fractional or non-finite numbers throw `RangeError`; invalid integer text throws `SyntaxError`; `null`, `undefined` and symbols throw `TypeError`. Number inputs may already have lost precision before conversion.

Native BigInt support requires Node.js 10.4 or later. Without it, this operation throws `TypeError` before coercing the input. Importing the package and using other functions still works.

---

### `toBoolean(value?)`

Converts a value to a boolean using JavaScript truthiness.

Returns the input’s JavaScript truthiness. It does not parse text: `"false"`, `"0"`, arrays and boxed `false` values are truthy. Object conversion hooks are not called.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |

**Returns:** `boolean` — `true` if the input is truthy under JavaScript boolean coercion; otherwise `false`.

**Examples**

```javascript
toBoolean(0);                    // => false
toBoolean('false');              // => true
toBoolean(new Boolean(false));   // => true
```

**Notes**

Non-empty strings such as `"false"` and `"0"`, arrays and boxed `false` values are truthy. Objects are not unboxed and their conversion hooks are not called. The browser object `document.all` retains its platform-defined falsy behaviour.

For deliberate text parsing, use a separate parser such as go-booleans parseBool. Boolean parsing is not part of this helper and go-types does not add a runtime dependency on that package.

---

### `toDate(value?)`

Converts a value to a `Date`, returning genuine `Date` objects unchanged. The result can be invalid.

Genuine Date objects retain their identity, including invalid dates and dates from another realm. Other inputs use `new Date(value)`. Invalid text and omitted input can produce an invalid Date; use `isValidDate` when a valid timestamp is required.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |

**Returns:** `Date` — The original genuine `Date`, or a new `Date` constructed from the input; it may be invalid.

**Errors**

- Symbols, bigints and failed object coercion can throw.
- Invalid date text can instead produce an invalid `Date`; check with [`isValidDate`](#isvaliddatevalue).

**Examples**

```javascript
toDate(0).toISOString();                                                 // => '1970-01-01T00:00:00.000Z'
toDate('2024-01-01T00:00:00.000Z').getTime();                            // => 1704067200000
isInvalidDate(toDate('not a date'));                                     // => true
isInvalidDate(toDate(undefined));                                        // => true

const date = new Date(0);
toDate(date) === date;                                                   // => true
```

**Additional examples**

```javascript
toDate(0).toISOString();                                                 // => "1970-01-01T00:00:00.000Z"
toDate('2024-01-01T00:00:00.000Z').getTime();                            // => 1704067200000
isInvalidDate(toDate('not a date'));                                     // => true
(() => { const date = new Date(0); return toDate(date) === date; })();   // => true
```

**Notes**

Genuine Dates from any realm, subclasses and invalid Dates are returned unchanged. For other inputs, `new Date(value)` treats numbers as millisecond timestamps and strings as date text. Invalid text can produce an invalid Date; symbols, bigints and failed coercions can throw. Omitted or `undefined` input produces an invalid Date rather than the current time.

Prefer ISO date-time strings with an explicit timezone for portable string input. Standard date-only strings use UTC, while date-time strings without a timezone use local time; non-ISO parsing is runtime-dependent. Validate with `isValidDate` when needed. The TypeScript result is `Date`, not the input subtype: a structurally compatible input can require a new Date that lacks the input’s extra properties.

---

### `toInteger(value?)`

Converts a value to a number and truncates it towards zero.

Uses `Number` followed by `Math.trunc`, so `"12px"` becomes `NaN` rather than `12`. Negative fractions move towards zero. The result can still be `NaN`, infinite or outside the safe-integer range.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |

**Returns:** `number` — The numeric conversion truncated towards zero; it may be `NaN` or infinite.

**Errors**

- Symbols and failed object conversions can throw.
- `NaN` and infinity are returned rather than rejected.

**Examples**

```javascript
toInteger('12.9');                 // => 12
toInteger(-12.9);                  // => -12
Number.isNaN(toInteger('12px'));   // => true
Object.is(toInteger(-0.5), -0);    // => true
toInteger('1e3');                  // => 1000
```

**Notes**

Converts the whole value, so `"12px"` becomes `NaN` rather than `12`. Negative fractions truncate towards zero, unlike `Math.floor`. `NaN`, infinities and signed zero follow `Math.trunc` behaviour.

Number rounding, overflow and underflow happen before truncation. The operation does not clamp values or substitute defaults. Use `isInteger` or `isSafeInteger` to validate the result. Symbols and failing object conversions can throw.

---

### `toJson(value?, replacer?, space?)`

Serialises a value to JSON text using native `JSON.stringify` behaviour.

Produces JSON text from objects, arrays and scalar values. Strings are encoded as JSON strings, even when they already contain JSON text. Accepts a native replacer callback or property-name list and optional indentation.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |
| `replacer?` | `((this: unknown, key: string, value: unknown) => unknown) \| readonly (string \| number)[] \| null` | `undefined` | A native JSON replacer callback or property-name list. Callbacks receive the containing object as `this`; omitted or `null` uses ordinary serialisation. |
| `space?` | `string \| number` | `undefined` | Native JSON indentation, capped at ten spaces or ten string code units. |

**Returns:** `string | undefined` — JSON text, or `undefined` when native serialisation produces no text, including omitted input without a replacer.

**Errors**

- Cycles and unhandled bigints throw `TypeError`.
- Getter, proxy, `toJSON` and replacer exceptions propagate unchanged.

**Examples**

```javascript
toJson({a: 1});                                                                    // => "{\"a\":1}"
toJson([1, 2]);                                                                    // => "[1,2]"
toJson('hello');                                                                   // => "\"hello\""
toJson(undefined) === undefined;                                                   // => true
toJson({a: 1, b: 2}, ['a'], 2);                                                    // => "{\n  \"a\": 1\n}"
toJson({a: 1, secret: 2}, (key, value) => key === 'secret' ? undefined : value);   // => "{\"a\":1}"
```

**Notes**

Without a replacer, top-level `undefined`, functions and symbols produce `undefined`; corresponding object properties are omitted and array positions become `null`. Non-finite numbers become `null`. Native `toJSON` methods apply, including Date serialisation. Ordinary Maps and Sets produce `{}` unless their own properties or custom hooks provide content.

A replacer callback receives `(key, value)` with the containing object as `this`, including a root call with key `""`. It runs after `toJSON` and may replace the root, omit properties or handle bigints. A replacer array selects string/number property names, including at nested object levels; duplicates are ignored. Other replacer-array elements are ignored except boxed strings/numbers, which native serialisation accepts. The `space` argument controls indentation, capped at ten spaces or ten string code units; non-whitespace indentation can produce text that is not valid JSON.

Native errors propagate unchanged. Shared references are allowed; circular traversal throws. Hooks may mutate input or throw, and no input or hook result is awaited. No cycle marker, Map/Set encoding, bigint representation or global polyfill is introduced. Exact escaping follows the host JSON implementation; output is not an HTML-safe escaping or canonicalisation service.

---

### `fromJson(value, reviver?)`

Parses JSON text into a JavaScript value using native `JSON.parse` behaviour.

Parses JSON text representing objects, arrays or scalar values. An optional native reviver can transform or delete parsed values, including replacing the root.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | — | The value to convert. |
| `reviver?` | `((this: unknown, key: string, value: unknown, context?: { source?: string }) => unknown) \| null` | `undefined` | A native JSON reviver, called for children before parents and finally for the root. Returning `undefined` deletes a property or replaces the root with `undefined`. Newer hosts may supply optional source context. |

**Returns:** `unknown` — The parsed value, or any root value returned by the reviver, including `undefined`. TypeScript returns unknown until the caller validates it.

**Errors**

- Invalid JSON, omitted input and `undefined` throw `SyntaxError`.
- Symbols throw `TypeError`.
- Input coercion and reviver errors propagate unchanged.

**Examples**

```javascript
fromJson('{"a":1}');                                                           // => {"a":1}
fromJson('[1,2]');                                                             // => [1,2]
fromJson('false');                                                             // => false
fromJson('null');                                                              // => null
fromJson('1', (key, value) => typeof value === 'number' ? value + 1 : value);  // => 2
fromJson('1', () => undefined) === undefined;                                  // => true
```

**Notes**

Native input coercion happens once before parsing; non-string inputs such as numbers, booleans and `null` follow `JSON.parse` rules. Omitted or `undefined` input and invalid JSON throw `SyntaxError`; symbol input throws `TypeError`. Nested strings that contain JSON text remain strings. Duplicate object names use the last value, and JSON numbers follow native `Number` precision and range.

A reviver is called for children before parents, then for the root with key "". Its this value is the containing object. Returning `undefined` deletes an object property, leaves an array hole or replaces the root with `undefined`. Other return values are retained as-is, including promises. Non-callable revivers are ignored by the native parser. Newer hosts may pass `source` context as a third argument; older supported runtimes do not. Both the context and its `source` property are optional in the declarations.

Native parsing creates own data properties for names such as `__proto__`; no property-copying or prototype assignment is added. Revivers may deliberately mutate their holder, return arbitrary objects or throw. JSON input coercion and reviver errors propagate unchanged. No automatic `Date`/`Map`/`Set` revival, JSON5 parsing, fallback value or generic type assertion is introduced.

---

### `toMap(value?)`

Converts a plain object or iterable of key/value pairs to a new Map.

Copies own enumerable string and symbol properties of plain objects, or consumes synchronous iterables of exact two-element array pairs. Synchronous iteration takes precedence on eligible inputs. Keys may have any type and are never coerced. Omitted, null or undefined input creates an empty Map.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `T` | `undefined` | The value to convert. |

**Returns:** `ConvertedMap<T>` — A new Map containing a plain object's own enumerable properties as entries, or the supplied key/value pairs. Omitted or nullish input produces an empty Map.

**Errors**

- TypeError for unsupported input, malformed iterators or entry pairs that are not exact two-element arrays with both own indices.
- Getter, proxy and iterator errors propagate.
- Entry validation errors close the outer iterator.
- Missing native Map throws before conversion; object copying requires symbol-enumeration support.

**Examples**

```javascript
Array.from(toMap({a: 1, b: 2}));                                               // => [["a",1],["b",2]]
Array.from(toMap([['a', 1], ['b', 2], ['a', 3]]));                             // => [["a",3],["b",2]]
(() => { const key = Symbol('key'); return toMap({[key]: 2}).get(key); })();   // => 2
toMap([[undefined, undefined]]).has(undefined);                                // => true
toMap().size;                                                                  // => 0
toMap(null).size;                                                              // => 0
```

**Notes**

Functions, boxed primitives, Dates and RegExps are rejected before iterator inspection. Plain objects include null-prototype and foreign-realm objects. Own string and symbol keys are captured once in property order; each current descriptor is checked before its enumerable value is read once. Inherited and non-enumerable properties are excluded, deleted or newly hidden keys are skipped, newly added keys are excluded, and nested values retain identity. Numeric property names become string keys; symbol keys stay symbols. An own constructor or length field is ordinary data.

A synchronous iterator takes precedence over object properties on eligible inputs. Its method is read once and called with the original input as receiver. A null or undefined iterator permits object conversion; other non-callable methods throw. Async iterators are never invoked or awaited. A plain async-only object is copied as a record, including enumerable symbol properties. Ordinary promises and native async-only collections without a supported synchronous source are rejected.

Each iterable entry must be an actual array of length exactly two, with own properties at both indices 0 and 1. Explicit undefined keys and values are valid. Holes, inherited-only indices, extra elements, strings and array-like entry objects are rejected. Any key type is allowed, without string coercion. Non-empty strings yield primitive entries and throw; an empty string yields no entries. There is no array-like source fallback.

Native SameValueZero key equality merges repeated NaN keys and treats negative and positive zero as the same key. The last value for a repeated key wins without moving its insertion position. Entry validation and property-access errors inside the loop close the outer iterator; the original error wins over a cleanup error. Native for-of failures while reading next, done or value propagate without an additional close attempt.

Finite one-shot iterators are consumed once; infinite inputs do not finish and no work limit is imposed. Requires native Map. Object copying requires Reflect.ownKeys or Object.getOwnPropertySymbols; missing both throws instead of dropping possible symbol keys.

If a copied object has an enumerable nullish Symbol.iterator value, the value captured during source dispatch is reused; its getter is not read a second time. Other selected property values are read live after checking their current descriptor.

---

### `toNumber(value?)`

Converts a value to a primitive number using JavaScript’s `Number` conversion.

Converts the entire input: `null`, `false` and blank strings become `0`; `true` becomes `1`; `undefined` and invalid numeric text become `NaN`. Text and bigints may lose precision; large magnitudes may overflow and tiny magnitudes may underflow to zero. This does not parse locale-specific numbers or guarantee a finite or safe result.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |

**Returns:** `number` — The converted primitive number; it may be `NaN` or infinite.

**Errors**

- Symbols throw `TypeError`.
- Object-coercion errors propagate; invalid numeric text returns `NaN`.

**Examples**

```javascript
toNumber('12.5');                // => 12.5
toNumber('0x10');                // => 16
toNumber(null);                  // => 0
Number.isNaN(toNumber('12px'));  // => true
```

**Notes**

Native conversion accepts whitespace, unlike `isNumeric`. It does not parse locale-specific formats or enforce a safe numeric range. Decimal text and bigints can round to the nearest representable number. Large magnitudes can overflow to infinity and tiny magnitudes can underflow to zero; no exact-decimal or safe-integer guarantee is made.

Symbols throw `TypeError`. Object conversion hooks may run and throw. Omitting the argument passes `undefined` to native conversion and produces `NaN`, unlike a zero-argument call to `Number()`.

---

### `toPlainObject(value)`

Creates a plain object from key/value pairs, or makes a shallow copy of an existing plain object.

Shallow-copies a plain object or consumes synchronous entry pairs. Every result has the local Object.prototype. Strings, nullish input and other unsupported values throw TypeError.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | The value to convert. |

**Returns:** `ConvertedPlainObject<T>` — A fresh ordinary object containing the copied enumerable properties or supplied entries.

**Errors**

- Unsupported inputs, malformed entry pairs and unsupported keys throw TypeError.
- Getter, proxy and iterator errors propagate without replacement.

**Examples**

```javascript
toPlainObject({ a: 1 });                                                         // => ({ a: 1 })
toPlainObject([['a', 1]]);                                                       // => ({ a: 1 })

const object = { x: 1 };
toPlainObject(object) === object;                                                // => false
```

**Additional examples**

```javascript
toPlainObject({a:1});                                                            // => {"a":1}
toPlainObject([['a', 1], ['a', 2]]);                                             // => {"a":2}
(() => { const object = {x: 1}; return toPlainObject(object) === object; })();   // => false
```

**Notes**

Strings, other primitives, boxed primitives, functions, Dates, RegExps and non-iterable class instances are unsupported. Use `fromJson` to parse JSON text and `isPlainObject` to check the parsed result when an object is required.

A synchronous iterator takes precedence over copying object properties. Each entry must be an actual two-element array with both own slots present; an explicit undefined value is allowed. Extra or missing elements, strings and array-like entry objects are rejected. Duplicate keys use the last value. Keys are primitive strings or symbols and are never coerced. Special names such as __proto__, constructor, prototype and toString become ordinary own data properties.

Object copying snapshots own keys, checks each current enumerable descriptor and reads each included value once. Inherited and non-enumerable properties are omitted. Getters may mutate the source or throw. Results have writable, enumerable, configurable data properties and preserve nested references. TypeScript makes inferred properties optional because enumerability and presence cannot be proved structurally. Prototype-name properties and broad string-keyed objects also have unknown values because an omitted own key can expose an inherited property.

Consumes a synchronous iterable once; infinite inputs do not finish. Entry validation or property access in the loop closes the outer iterator, running return/finally cleanup. The original conversion error takes precedence over a cleanup error. Native for-of protocol failures in next, done or value propagate without an additional close attempt. Async iteration is never consumed or awaited. Async generators are unsupported; a plain async-only object is copied as a record, including enumerable symbol properties. Symbol enumeration requires Reflect.ownKeys or Object.getOwnPropertySymbols when copying records; missing both throws rather than silently discarding symbol keys. Array-entry conversion remains available.

If a copied object has an enumerable nullish Symbol.iterator value, the value captured during source dispatch is reused; its getter is not read a second time. Other selected property values are read live after checking their current descriptor.

---

### `toSet(value?)`

Converts a synchronous iterable, plain object or supported array-like input to a new shallow Set.

Uses the same source order as toArray: synchronous iterable values, then values from a plain object's own enumerable string and symbol properties, then supported non-plain array-like indices. Native Set equality removes duplicates while preserving first-insertion order. Omitted, null or undefined input creates an empty Set.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `T` | `undefined` | The value to convert. |

**Returns:** `ConvertedSet<T>` — A new Set of iterable items, plain object property values or indexed array-like values, or an empty Set for omitted or nullish input.

**Errors**

- TypeError for unsupported input, malformed iterators or invalid array-like lengths.
- Getter, proxy and iterator errors propagate.
- Missing native Set throws before conversion; object copying requires symbol-enumeration support.

**Examples**

```javascript
Array.from(toSet([3, 1, 3]));            // => [3,1]
Array.from(toSet('A😀A'));               // => ["A","😀"]
Array.from(toSet({a: 1, b: 2, c: 1}));   // => [1,2]
Array.from(toSet({0: 'x', length: 1}));  // => ["x",1]
toSet().size;                            // => 0
toSet(null).size;                        // => 0
```

**Notes**

Functions, boxed primitives, Dates and RegExps are rejected before inspecting iterator or length properties; non-string primitives other than nullish input are also unsupported. A synchronous iterator takes precedence over object and indexed data. Its method is read once and called with the original input as receiver; null or undefined permits fallback, while other non-callable methods throw.

Plain objects include null-prototype and foreign-realm objects. Own string and symbol keys are snapshotted in property order, current enumerability is checked, and each included value is read once. Inherited and non-enumerable properties are excluded. A length property is copied as ordinary data. Object copying requires Reflect.ownKeys or Object.getOwnPropertySymbols; missing both throws instead of omitting possible symbol keys.

Only non-plain array-like inputs use indexed fallback. Length must be a primitive number that is an integer between zero and Number.MAX_SAFE_INTEGER, matching isArrayLike. Length is read once and values are read live; missing slots yield undefined and inherited indices can supply values. Strings yield Unicode code points and Maps yield entry arrays. Values retain their identities.

Native SameValueZero equality merges repeated NaN values and treats negative and positive zero as the same value. Distinct objects remain distinct; repeated references collapse. The result is a fresh local Set.

Ordinary promises and native async-only collections without a supported synchronous source are rejected. Plain async-only objects are copied as data, including enumerable symbol values, without invoking their async iterator. No input is awaited. Iterators are consumed once; infinite iterables do not finish and no work limit is imposed. Requires native Set but does not require Array.from.

If a copied object has an enumerable nullish Symbol.iterator value, the value captured during source dispatch is reused; its getter is not read a second time. Other selected property values are read live after checking their current descriptor.

---

### `ensureSet(value?)`

Returns an existing Set unchanged, creates a Set from array items, or treats another supplied value as one member.

Use this for inputs that accept one item, an array or a Set. Strings remain whole. Use [toSet](#tosetvalue) to extract other supported collection contents into a new Set.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value?` | `T` | The value to normalise. Omit to create an empty Set; explicit undefined or null remains one member. |

**Returns:** `EnsuredSet<T>` — The original Set, or a new Set containing array items or one supplied member. With no arguments, a new empty Set.

**Errors**

- Missing native Set support throws TypeError before input inspection.
- Opaque object inputs throw when all captured native identity checks are unavailable.
- Native construction, revoked-proxy and array-iterator errors propagate; native iteration closes when adding a member fails.

**Examples**

```javascript
ensureSet().size;                                                          // => 0
ensureSet("read").has("read");                                             // => true
Array.from(ensureSet([1, 2, 1]));                                          // => [1, 2]
ensureSet(null).has(null);                                                 // => true
ensureSet(undefined).has(undefined);                                       // => true

const permissions = new Set(["read", "write"]);
ensureSet(permissions) === permissions;                                    // => true
```

**Additional examples**

```javascript
ensureSet().size;                                                          // => 0
ensureSet("read").has("read");                                             // => true
Array.from(ensureSet([1, 2, 1]));                                          // => [1,2]
ensureSet(null).has(null);                                                 // => true
ensureSet(undefined).has(undefined);                                       // => true
(()=>{const values=new Set([1,2]);return ensureSet(values)===values;})();  // => true
(()=>{const value={id:1};return ensureSet(value).has(value);})();          // => true
```

**Notes**

Existing Sets retain their identity, including empty, frozen, subclassed and foreign Sets. Own properties and iterator overrides are not read when preserving a Set. Changes through a mutable result also affect the original Set. `Object.freeze` does not prevent adding or removing Set members.

Arrays produce a new local Set using native array iteration. Duplicate values are removed using native Set equality; nested arrays and objects remain references. Sparse array slots normally supply `undefined`. Custom array iterators are honoured and may run application code or throw. Other inputs, including strings, Maps, typed arrays, generators, functions and promises, are stored as single members without iteration, coercion or awaiting.

Omitting the argument creates a fresh empty Set. Explicit `null` and `undefined` create one member. Additional callback arguments are ignored. Native construction and iterator-closing errors propagate unchanged.

Requires native `Set`. Captured native receiver checks recognise existing Sets without consuming their members. If none remain, opaque non-array object inputs throw rather than risk nesting an existing Set. Empty construction, primitive members and array input remain usable where native construction permits them. Missing `Set.prototype.add` prevents construction from supplied members, but preserving a recognised Set and creating an empty Set remain available. See the [runtime guide](runtime.md#optional-capabilities) for the supported receiver checks.

TypeScript infers declared Set and array members, preserves `ReadonlySet` restrictions, and does not promise custom subtype properties. Broad `object` and `unknown` inputs remain conservative. Structural types cannot prove native Set or array identity; treat uncertain imitations as `unknown`. Direct `map(ensureSet)` calls infer broad results; use `map(value => ensureSet(value))` for precise inference.

---

### `toString(value?)`

Converts a value to a primitive string using JavaScript’s `String` conversion.

Uses ordinary string conversion rather than JSON serialisation. `null` becomes `"null"`, `undefined` becomes `"undefined"`, and primitive symbols use their descriptive text. Arrays and objects follow their native conversion rules.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |

**Returns:** `string` — The converted primitive string; nullish inputs become their literal text.

**Errors**

- Native conversion errors propagate, including boxed symbols and objects that cannot produce a primitive.

**Examples**

```javascript
toString(42);                  // => "42"
toString(null);                // => "null"
toString(Symbol('key'));       // => "Symbol(key)"
toString([1, 2]);              // => "1,2"
```

**Notes**

`null` becomes `"null"` and `undefined` becomes `"undefined"`, not an empty string. Primitive symbols use their descriptive string. Arrays and objects use native string conversion, which may call object hooks.

Boxed symbols do not use the primitive-symbol path and throw under native conversion. Objects that cannot produce a primitive also throw.

---

### `toSymbol(value?)`

Converts a value to a primitive symbol, preserving primitive symbols and unboxing genuine Symbol wrappers.

Primitive symbols retain identity, and genuine wrappers are unboxed without invoking their overridden conversion hooks. Other inputs use `Symbol(description)`: repeated descriptions create distinct symbols, and no global registry is used.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `unknown` | `undefined` | The value to convert. |

**Returns:** `symbol` — The original or unboxed symbol, or a new symbol created from the description.

**Errors**

- Native description-conversion errors propagate.
- Unavailable native `Symbol` support throws `TypeError` before conversion.

**Examples**

```javascript
toSymbol('key').toString();                                                                // => 'Symbol(key)'
toSymbol('key') !== toSymbol('key');                                                       // => true

const symbol = Symbol('key');
toSymbol(symbol) === symbol;                                                               // => true
toSymbol(Object(symbol)) === symbol;                                                       // => true
```

**Additional examples**

```javascript
toSymbol('key').toString();                                                                // => "Symbol(key)"
toSymbol('key') !== toSymbol('key');                                                       // => true
(() => { const symbol = Symbol('key'); return toSymbol(Object(symbol)) === symbol; })();   // => true
```

**Notes**

Genuine Symbol wrappers, including those from another realm, are unboxed without calling overridden conversion hooks. Other inputs use `Symbol(description)`, which may execute description-conversion hooks and throw.

Each description creates a fresh symbol; `Symbol.for` is never called implicitly. An existing registry symbol keeps its identity when passed in. Omitted or `undefined` input creates a symbol without a description. Requires native `Symbol`; missing support does not prevent loading. Requested conversion throws `TypeError` before inspecting the input when it is unavailable.

## Conditional conversion

Each `If` function accepts a boolean or synchronous boolean-returning predicate. A `false`, omitted, or `undefined` condition returns the input unchanged without converting or inspecting it.

### `boxIf(value, condition?)`

Wraps non-nullish primitives in their native wrapper objects when the condition evaluates to `true`. Otherwise, returns the original input unchanged.

Applies the full `box` contract only when a primitive boolean condition or synchronous predicate requests conversion.

Requested conversion uses `box`. Does not call conversion hooks. Existing objects and functions, `null` and `undefined` are returned unchanged.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | Boxed<T>` — The `box` result when requested; otherwise the exact original input.

**Errors**

- Invalid conditions and non-boolean predicate results throw `TypeError`.
- Predicate errors propagate; requested conversion follows `box` error behaviour.

**Examples**

```javascript
boxIf(3, false);               // => 3
boxIf(3) === 3;                // => true
```

**Notes**

A predicate receives the original input once without an explicit receiver. Predicate errors propagate, and deliberate mutation is visible to a requested conversion. No asynchronous predicate is awaited. Skipping reads neither the input nor conversion options.

---

### `unboxIf(value, condition?)`

Extracts a genuine wrapper’s primitive payload when the condition evaluates to `true` and native unboxing is available. Otherwise, returns the original input unchanged.

Applies the full `unbox` contract only when a primitive boolean condition or synchronous predicate requests conversion.

Requested conversion uses `unbox`. Uses captured native `valueOf` intrinsics without calling custom conversion hooks. Missing `Symbol` or `BigInt` unboxing support leaves those wrappers unchanged.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | Unboxed<T>` — The `unbox` result when requested; otherwise the exact original input.

**Errors**

- Invalid conditions and non-boolean predicate results throw `TypeError`.
- Predicate errors propagate; requested conversion follows `unbox` error behaviour.

**Examples**

```javascript
unboxIf(3, false);             // => 3
unboxIf(3) === 3;              // => true
```

**Notes**

A predicate receives the original input once without an explicit receiver. Predicate errors propagate, and deliberate mutation is visible to a requested conversion. No asynchronous predicate is awaited. Skipping reads neither the input nor conversion options.

---

### `toRegExpIf(value, condition?, flags?)`

Converts a native pattern and optional `flags` to a genuine `RegExp` when the condition evaluates to `true`. Otherwise, returns the original input unchanged.

Applies the full `toRegExp` contract only when a primitive boolean condition or synchronous predicate requests conversion.

Requested conversion uses `toRegExp`. Uses native `RegExp` syntax and `flags`. May reuse a genuine local `RegExp` without explicit `flags`; copied expressions start with `lastIndex` zero.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |
| `flags?` | `string` | `undefined` | Native RegExp flags. Omitted or `undefined` preserves a RegExp input’s flags; explicit flags replace them. |

**Returns:** `T | RegExp` — The `toRegExp` result when requested; otherwise the exact original input.

**Errors**

- Invalid conditions and non-boolean predicate results throw `TypeError`.
- Predicate errors propagate; requested conversion follows `toRegExp` error behaviour.

**Examples**

```javascript
toRegExpIf(3, false);          // => 3
toRegExpIf(3) === 3;           // => true
```

**Notes**

A predicate receives the original input once without an explicit receiver. Predicate errors propagate, and deliberate mutation is visible to a requested conversion. No asynchronous predicate is awaited. Skipping reads neither the input nor conversion options.

---

### `toPromiseIf(value, condition?)`

Converts a value to a native `Promise` when the condition evaluates to `true`. Otherwise, returns the original input unchanged.

Applies the full `toPromise` contract only when a primitive boolean condition or synchronous predicate requests conversion.

Requested conversion uses `toPromise`. Preserves ordinary local `Promise` identity, assimilates thenables and wraps other values. Requires native `Promise.resolve`; functions are values, not callbacks.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | Promise<Awaited<T>>` — The `toPromise` result when requested; otherwise the exact original input.

**Errors**

- Invalid conditions and non-boolean predicate results throw `TypeError`.
- Predicate errors propagate; requested conversion follows `toPromise` error behaviour.

**Examples**

```javascript
toPromiseIf(3, false);         // => 3
toPromiseIf(3) === 3;          // => true
```

**Notes**

A predicate receives the original input once without an explicit receiver. Predicate errors propagate, and deliberate mutation is visible to a requested conversion. No asynchronous predicate is awaited. Skipping reads neither the input nor conversion options. The skipped result is the input itself, not a `Promise` wrapper.

---

### `toArrayIf(value, condition?)`

Converts supported iterable, plain object or array-like input to a new shallow array when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toArray` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toArray`. Consumes iterable input, copies values from own enumerable string and symbol properties, or reads supported array-like indices. Array-like lengths must already be numeric safe integers at least zero. Nullish and unsupported inputs throw. Requires native `Array.from`; missing support throws `TypeError` before inspecting the input.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | ArrayElement<T>[]` — A new shallow array when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toArray`](#toarrayvalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
toArrayIf('ab', true);         // => ["a","b"]
toArrayIf('ab', false);        // => "ab"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toArray` contract.

---

### `toBigIntIf(value, condition?)`

Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toBigInt` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toBigInt`. Requires native BigInt. Fractional numbers and invalid integer text throw; input conversion hooks may run.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | bigint` — The converted primitive bigint when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toBigInt`](#tobigintvalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

Examples using bigint literals require native BigInt support.

```javascript
toBigIntIf('42', true);                                // => 42n
toBigIntIf('42', false);                               // => '42'
toBigIntIf('42');                                      // => '42'
toBigIntIf('42', value => typeof value === 'string');  // => 42n
```

**Additional examples**

```javascript
toBigIntIf('42', true) === 42n;                        // => true
toBigIntIf('42', false);                               // => "42"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toBigInt` contract. Skipping also works when native BigInt support is unavailable.

---

### `toBooleanIf(value, condition?)`

Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toBoolean` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toBoolean`. Uses truthiness rather than parsing boolean text. Does not invoke object conversion hooks.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | boolean` — The input’s boolean truthiness when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toBoolean`](#tobooleanvalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
toBooleanIf(0, true);          // => false
toBooleanIf('false', false);   // => "false"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toBoolean` contract.

---

### `toDateIf(value, condition?)`

Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toDate` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toDate`. Preserves genuine Date identity. May return an invalid Date; omitted input does not mean the current time. Symbols, bigints and conversion hooks can throw.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | Date` — The original genuine `Date` or a new `Date`, possibly invalid, when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toDate`](#todatevalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
toDateIf(0, true).getTime();   // => 0
toDateIf(0, false);            // => 0
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toDate` contract.

---

### `toIntegerIf(value, condition?)`

Converts a value to a number and truncates it towards zero when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toInteger` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toInteger`. Does not guarantee a finite or safe integer. Symbols and failing conversion hooks can throw.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | number` — The numeric conversion truncated towards zero, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toInteger`](#tointegervalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
toIntegerIf('4.8', true);      // => 4
toIntegerIf('4.8', false);     // => "4.8"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toInteger` contract.

---

### `toJsonIf(value, condition?, replacer?, space?)`

Serialises a value to JSON text when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toJson` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toJson`. May return `undefined`. Does not transform Maps, Sets or bigints automatically. Cycles and unhandled bigints throw; getters, `toJSON` methods and replacer callbacks can run.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |
| `replacer?` | `((this: unknown, key: string, value: unknown) => unknown) \| readonly (string \| number)[] \| null` | `undefined` | A native JSON replacer callback or property-name list. Callbacks receive the containing object as `this`; omitted or `null` uses ordinary serialisation. |
| `space?` | `string \| number` | `undefined` | Native JSON indentation, capped at ten spaces or ten string code units. |

**Returns:** `T | string | undefined` — JSON text or `undefined` when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toJson`](#tojsonvalue-replacer-space) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
toJsonIf({a: 1}, true);                                  // => "{\"a\":1}"
toJsonIf({a: 1}, false);                                 // => {"a":1}
toJsonIf({a: 1, b: 2}, value => value.a === 1, ['a']);   // => "{\"a\":1}"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toJson` contract. The condition is the second argument; replacer and indentation follow it. Skipping does not inspect the value, replacer or indentation. Replacer callbacks retain native JSON receiver and return-value rules; only the condition uses the strict boolean predicate contract.

---

### `fromJsonIf(value, condition?, reviver?)`

Parses JSON when the condition evaluates to `true`; otherwise returns the original input unchanged.

Uses the full `fromJson` contract when a primitive boolean condition or synchronous predicate requests conversion.

Requested conversion uses `fromJson`. Uses captured native `JSON.parse`, including input coercion, reviver order and errors. Parsing does not validate an application schema; reviver results are not awaited.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |
| `reviver?` | `((this: unknown, key: string, value: unknown, context?: { source?: string }) => unknown) \| null` | `undefined` | A native JSON reviver, called for children before parents and finally for the root. Returning `undefined` deletes a property or replaces the root with `undefined`. Newer hosts may supply optional source context. |

**Returns:** `T | unknown` — The parsed or revived value when requested; otherwise the original input unchanged.

**Errors**

- Invalid conditions and non-boolean predicate results throw `TypeError`.
- Predicate errors propagate; requested conversion follows `fromJson` error behaviour.

**Examples**

```javascript
fromJsonIf('{"a":1}', true);                                                                                         // => {"a":1}
fromJsonIf('{"a":1}', false);                                                                                        // => "{\"a\":1}"
fromJsonIf('invalid');                                                                                               // => "invalid"
fromJsonIf('2', value => typeof value === 'string', (key, value) => typeof value === 'number' ? value * 2 : value);  // => 4
```

**Notes**

The condition is the second argument and the optional reviver follows it. A predicate receives the original input once without an explicit receiver. Deliberate predicate mutation is visible to requested parsing; predicate errors propagate. Skipping inspects neither the input nor the reviver. A requested parse follows native `fromJson` input coercion and reviver behaviour. Only the condition requires a synchronous primitive boolean result; the reviver may return any value without awaiting.

---

### `toMapIf(value, condition?)`

Converts a plain object or iterable of key/value pairs to a new Map when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toMap` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toMap`. Plain object entries come from own enumerable properties with string or symbol keys. Iterable pairs must be exact two-element arrays with both own indices present. Duplicate keys keep their first position and take the last value. Nullish input creates an empty Map. Requires native `Map`; missing support throws before inspecting the input.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | ConvertedMap<T>` — A new Map when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toMap`](#tomapvalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
Array.from(toMapIf([['key', 1]], true));   // => [["key",1]]
toMapIf(42, false);                        // => 42
toMapIf({ a: 1 }, true).get('a');          // => 1
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toMap` contract.

---

### `toNumberIf(value, condition?)`

Converts a value to a primitive number when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toNumber` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toNumber`. May return `NaN` or infinity, lose bigint precision, round numeric text, underflow to zero, or invoke object conversion hooks. Symbols throw.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | number` — The converted primitive number, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toNumber`](#tonumbervalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
toNumberIf('12', value => typeof value === 'string');  // => 12
toNumberIf('12', false);                               // => "12"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toNumber` contract.

---

### `toPlainObjectIf(value, condition?)`

Creates a new plain object when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toPlainObject` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toPlainObject`. Returns a fresh ordinary object. Copies own enumerable string and symbol properties, preserving nested references. Entry pairs must be two-element arrays with string or symbol keys. Strings and nullish input throw.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | ConvertedPlainObject<T>` — A fresh plain object when conversion is requested; otherwise the exact original input.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toPlainObject`](#toplainobjectvalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
toPlainObjectIf({a:1}, true);        // => {"a":1}
toPlainObjectIf(null, false);        // => null
toPlainObjectIf('{"a":1}', false);   // => "{\"a\":1}"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toPlainObject` contract.

---

### `toSetIf(value, condition?)`

Converts supported iterable, plain object or array-like input to a new shallow Set when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toSet` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toSet`. Copies iterable values, values from own enumerable string and symbol properties, or supported array-like indices. Lengths must be numeric safe integers at least zero. Nullish input creates an empty Set; unsupported inputs throw. Requires native `Set`, independently of `Array.from`; missing support throws before inspecting the input.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | ConvertedSet<T>` — A new Set when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toSet`](#tosetvalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
Array.from(toSetIf('aba', true));  // => ["a","b"]
toSetIf('aba', false);             // => "aba"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toSet` contract.

---

### `toStringIf(value, condition?)`

Converts a value to a primitive string when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toString` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toString`. May invoke conversion hooks and throw, including for boxed symbols. Does not perform JSON serialisation.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | string` — The converted primitive string when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toString`](#tostringvalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
toStringIf(42, true);          // => "42"
toStringIf(42, false);         // => 42
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toString` contract.

---

### `toSymbolIf(value, condition?)`

Converts a value to a primitive symbol when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toSymbol` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toSymbol`. Preserves primitive symbol identity and unboxes genuine wrappers. Other inputs create a new symbol and may invoke description-conversion hooks. Requires native `Symbol`; missing support does not prevent loading. Requested conversion throws `TypeError` before inspecting the input when it is unavailable.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | The value to convert. |
| `condition?` | `boolean \| ((this: undefined, value: T) => boolean)` | `undefined` | A boolean or synchronous predicate called once with the original value. Omitted or `undefined` skips conversion; a predicate must return a primitive boolean. |

**Returns:** `T | symbol` — The original or unboxed symbol, or a new symbol from the description, when conversion is requested; otherwise the original input, unchanged.

**Errors**

- Invalid conditions or non-boolean predicate results throw `TypeError`.
- Predicate errors propagate.
- A requested conversion also follows [`toSymbol`](#tosymbolvalue) error behaviour; a skipped conversion does not inspect or coerce the value.

**Examples**

```javascript
typeof toSymbolIf('key', true);  // => "symbol"
toSymbolIf('key', false);        // => "key"
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toSymbol` contract.

## Behaviour

### Checks and conversions

Type checks do not convert values. For example, `isNumber('42')` returns `false`, while `toNumber('42')` returns `42`. Scalar conversions follow native coercion rules: they may invoke object hooks, lose numeric precision, underflow to zero, or return `NaN`, infinity or an invalid `Date`. `toBoolean` uses truthiness rather than parsing text, and `toString` does not perform JSON serialisation. Use `fromJson` to parse any JSON value with native `JSON.parse` semantics and an optional reviver; its result is `unknown` until validated. Use `toJson` to serialise with native `JSON.stringify` semantics, including replacer/indentation options and a possible `undefined` result.

`toArray` and `toSet` consume synchronous iterable values first, copy values from own enumerable string and symbol properties second, and read supported non-plain array-like indices third. Array-like lengths must already be numeric safe integers at least zero; a plain object's length property is ordinary data. `toMap` copies object entries including symbols or consumes exact two-element array pairs with both own indices. `toPlainObject` copies a plain object's own enumerable properties into a new plain object, or builds one from the same strict pairs with primitive string/symbol keys. Unsupported inputs throw instead of being boxed or silently converted to empty collections.

`box` preserves nullish input and existing objects; `unbox` extracts genuine native wrapper payloads without custom coercion. `toRegExp` uses native patterns and flags without literal escaping. `toPromise` adopts values and thenables through native `Promise.resolve`; its resolution failures reject, while some native errors can throw synchronously.

Conditional converters evaluate a boolean condition or synchronous predicate once. A `false`, omitted or `undefined` condition returns the original input without inspecting or converting it. See the [conversion guide](conversions.md) for identity, coercion and precision details.

### Errors and side effects

An ordinary failed check returns `false`. Invalid matcher configuration and unsupported inputs documented by an individual API can throw. Application callbacks, property getters, proxy traps, conversion hooks and iterator operations may also throw; their errors propagate.

Checks are not schema validation or a security boundary. Native identity, local-instance and capability checks have different guarantees. For example, a callable `then` property does not prove correct Promise behaviour. See the [runtime guide](runtime.md) and each function's notes for those boundaries.

Protocol method checks test callability without invoking the method. This includes the browser's callable `document.all` value even though its `typeof` result is `"undefined"`. The separate `isFunction()` predicate deliberately retains its literal `typeof === "function"` contract. A callable class or revoked callable proxy can still throw when invoked; a capability check is not an execution guarantee.

### Empty and blank values

For these checks, **supported collections** are arrays, array-like values, Maps, Sets and plain objects.

`isEmpty` and `isBlank` inspect sized inputs without consuming unsized iterators. They handle strings, native Maps and Sets, and valid array-like lengths before protocol checks. Unsized iterator or iterable capabilities throw `TypeError`; remaining plain dictionaries use own enumerable string keys.

Handle iteration explicitly when consumption is intended.

Blankness is shallow. `[null, undefined]` is blank, but `['']` and `[{}]` are not. Map blankness checks values; Set blankness checks items.

### Type specifications

The four collection checks accept a required type-name string or predicate:

- **Type-name string:** One of the native `typeof` names: `'undefined'`, `'object'`, `'boolean'`, `'number'`, `'bigint'`, `'string'`, `'symbol'` or `'function'`. Names are case-sensitive. As with `typeof`, `'object'` includes `null`.
- **Predicate:** A synchronous function returning a primitive boolean. It receives one value without a supplied `this` receiver. Bind methods that require a receiver, or use an arrow function.

<!-- prettier-ignore -->
```javascript
class Account {}

isArrayOf([1, 2], 'number');                                     // => true
isArrayOf([1, new Number(2)], 'number');                         // => false
isArrayOf([1, new Number(2)], isNumber);                         // => true
isArrayLikeOf({ 0: 'a', length: 1 }, 'string');                  // => true
isSetOf(new Set([null]), value => value === null);               // => true
isMapOf(new Map([['score', 1]]), 'string', isNumber);            // => true
isArrayOf([new Account()], value => value instanceof Account);   // => true
```

Functions are always predicates. A local `instanceof` predicate follows native realm rules; pass `isDate` to recognise genuine Dates from other realms. Combine checks with an ordinary predicate, such as `value => typeof value === 'number' || value === null`, or with the logic utilities in go-fns.

Invalid or missing matchers throw `TypeError` before the collection is inspected, even for empty collections or values of the wrong type. Boxed strings, matcher arrays and descriptor objects are not accepted. Valid empty collections pass without calling predicates. Non-boolean results, including promises, throw when the predicate runs; callback exceptions propagate unchanged.

See [Matcher specification contract](#matcher-specification-contract) for traversal and callback rules.

## TypeScript

TypeScript declarations are included; no separate `@types` package is required. They support root and per-function imports. Default imports compiled to CommonJS require `esModuleInterop`.

Named function subpath imports require native ESM with Node16, NodeNext or Bundler resolution. For CommonJS or legacy resolution, use named root imports, direct `require()` calls or default subpath imports.

<!-- prettier-ignore -->
```typescript
const value: unknown = 'hello';

if (typeof value === 'string') {
  value.toUpperCase();         // => 'HELLO'
}
```

Use native `typeof` checks for primitive narrowing. `isNotNullish` also narrows filtered values. Collection-content checks return `boolean`, even when passed a type guard: sparse arrays and native identity cannot be proved by structural TypeScript types.

`ensureArray` infers item and array element types and retains readonly tuple shapes. Broad `object` and `unknown` inputs remain conservative. Declarations follow TypeScript array structure and do not promise native identity or custom subtype properties; see [`ensureArray`](#ensurearrayvalue) for the boundaries and callback inference.

`ensureSet` infers Set or array members and preserves `ReadonlySet` restrictions; it wraps other declared inputs as members. Broad inputs remain conservative and custom subtype properties are not promised. See [`ensureSet`](#ensuresetvalue) for native identity and callback inference boundaries.

`unbox` retains the original object type plus possible primitive payloads because structural properties cannot prove a native wrapper brand. `box` uses `Boxed<T>`; `toPromise` uses `Promise<Awaited<T>>`.

`toDate()` returns `Date`; it does not promise to preserve extra input properties during conversion. See the [runtime guide](runtime.md#typescript-boundaries) for declaration boundaries.

`toArray()`, `toSet()` and `toMap()` infer definite iterable contents before object or indexed contents. Known symbol properties contribute to inferred values and Map keys. A visibly optional or nullable iterator that may be callable keeps inferred contents conservative because it can override the fallback source; an iterator declared only as `null`/`undefined` permits fallback inference. Structural types cannot prove a plain prototype, enumerability or complete pair indices. Skipped conversions preserve the original input type.

Root and focused CommonJS declarations support strict consumers targeting ES2017 with ES2017 libraries and `skipLibCheck: false`. Runtime support for optional native features remains separate: selecting a newer compiler library does not add BigInt to Node 8. See the [runtime guide](runtime.md#typescript-boundaries) for declaration details.

## Shared contracts

These checks classify values; they do not validate an application schema or provide a security boundary. A successful identity check does not guarantee that replaceable methods or properties are intact. A capability check establishes method presence, not that calling it will succeed.

Application callback, getter, proxy and iterator errors propagate. Native identity checks deliberately catch incompatible-receiver errors when probing a value with a built-in operation; this turns a normal type mismatch into `false`. See [Errors and side effects](#errors-and-side-effects).

TypeScript interfaces describe structure, which does not always prove native identity. Similarly, a failed refinement such as `isInteger` does not rule out every number, and a failed collection check can still leave a typed sparse array. Declarations therefore return `boolean` where narrowing either branch would be unsafe. See [TypeScript](#typescript) and the [runtime guide](runtime.md#typescript-boundaries).

## Matcher specification contract

Matchers are required for `isArrayOf(value, matcher)`, `isArrayLikeOf(value, matcher)`, `isSetOf(value, matcher)` and `isMapOf(value, keyMatcher, valueMatcher)`. Both Map matchers are validated in key/value order before input inspection; validation never probes a callback.

Indexed checks read length once and then use ordinary property reads. Empty slots therefore match `'undefined'` unless an inherited indexed value is present. Matching stops at the first failure. Map checks test each key before its associated value; Map and Set checks use captured native iteration. Iteration is live, so predicates must not mutate those collections.

Predicate results are checked as primitive booleans without coercion, awaiting or thenable inspection. Results are not cached: each reached value is passed to the predicate. Callback closures and instance hooks inside explicit predicates retain their live state. There is no built-in work limit for collection traversal or callback work.

The shared `TypeMatcher` declaration accepts `TypeName | ((this: undefined, value: unknown) => boolean)`. Callback input remains `unknown`, including for typed collections; explicit incompatible receiver requirements are rejected. TypeScript cannot recover a receiver requirement erased from a function type. All four checks return `boolean` and do not narrow either branch.
