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

All **95 public functions** are documented below. The summaries link to each function's parameters, return value, examples and behavioural notes.

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
| [`isNonNullish(value)`](#isnonnullishvalue) | Checks whether a value is neither `null` nor `undefined`. | **`boolean`**<br><br>`true` if the value is neither `null` nor `undefined`; otherwise `false`. |
| [`isEmpty(value)`](#isemptyvalue) | Checks whether a value is nullish or a supported string or container has no items. | **`boolean`**<br><br>`true` if the value is nullish or a supported string or container with no items; otherwise `false`. |
| [`isBlank(value)`](#isblankvalue) | Checks whether a value is nullish, an empty or whitespace-only string, or a supported container containing only nullish values. | **`boolean`**<br><br>`true` if the value is nullish, a whitespace-only string, or a supported container containing only nullish values; otherwise `false`. |
| [`isTruthy(value)`](#istruthyvalue) | Checks whether JavaScript treats a value as `true` in a condition. | **`boolean`**<br><br>`true` if the value is truthy under JavaScript boolean coercion; otherwise `false`. |
| [`isFalsy(value)`](#isfalsyvalue) | Checks whether JavaScript treats a value as `false` in a condition. | **`boolean`**<br><br>`true` if the value is falsy under JavaScript boolean coercion; otherwise `false`. |
| [`isTypeOf(value, type?)`](#istypeofvalue-type) | Checks whether a value matches a type name, instance target, predicate or union of matchers. | **`boolean`**<br><br>`true` if the value matches the type specification (omission matches `undefined`); otherwise `false`. |
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
| [`isObjectLike(value)`](#isobjectlikevalue) | Checks whether a value is a non-null object, excluding functions. | **`boolean`**<br><br>`true` if the value is a non-null object other than a function; otherwise `false`. |
| [`isPlainObject(value)`](#isplainobjectvalue) | Checks whether a value has a null or ordinary `Object` prototype. | **`boolean`**<br><br>`true` if the value has a null or ordinary `Object` prototype; otherwise `false`. |
| [`isCyclic(value)`](#iscyclicvalue) | Checks whether following enumerable string-keyed properties leads back to an ancestor. | **`boolean`**<br><br>`true` if enumerable string-keyed property traversal reaches an active ancestor; otherwise `false`. |
| [`isIterable(value)`](#isiterablevalue) | Checks whether a value exposes a synchronous iterator method. | **`boolean`**<br><br>`true` if the value has a callable `Symbol.iterator` method; otherwise `false`. |
| [`isAsyncIterable(value)`](#isasynciterablevalue) | Checks whether a value exposes an asynchronous iterator method. | **`boolean`**<br><br>`true` if the async-iterator symbol is available and the value has a callable `Symbol.asyncIterator` method; otherwise `false`. |
| [`isIteratorLike(value)`](#isiteratorlikevalue) | Checks whether a value is an object or function with a callable `next` method. | **`boolean`**<br><br>`true` if the value is a non-null object or function with a callable `next` method; otherwise `false`. |
| [`isEmptyIterable(value)`](#isemptyiterablevalue) | Checks whether a synchronous iterable is empty by advancing its iterator. | **`boolean`**<br><br>`true` if the synchronous iterable yields no items; otherwise `false`. |
| [`isBlankIterable(value)`](#isblankiterablevalue) | Checks whether every item yielded by a synchronous iterable is nullish by advancing its iterator. | **`boolean`**<br><br>`true` if the synchronous iterable yields no items or only nullish items; otherwise `false`. |
| [`isFunction(value)`](#isfunctionvalue) | Checks whether JavaScript reports a value as a function. | **`boolean`**<br><br>`true` if `typeof value` is `"function"`; otherwise `false`. |
| [`isDate(value)`](#isdatevalue) | Checks whether a value is a genuine `Date`, valid or invalid. | **`boolean`**<br><br>`true` if the value is a genuine `Date`, valid or invalid; otherwise `false`. |
| [`isValidDate(value)`](#isvaliddatevalue) | Checks whether a genuine `Date` contains a finite timestamp. | **`boolean`**<br><br>`true` if the value is a genuine `Date` with a finite timestamp; otherwise `false`. |
| [`isInvalidDate(value)`](#isinvaliddatevalue) | Checks whether a genuine `Date` contains a `NaN` timestamp. | **`boolean`**<br><br>`true` if the value is a genuine `Date` with a `NaN` timestamp; otherwise `false`. |
| [`isRegExp(value)`](#isregexpvalue) | Checks whether a value is a genuine regular-expression object. | **`boolean`**<br><br>`true` if the value is a genuine `RegExp` instance; otherwise `false`. |
| [`isPromise(value)`](#ispromisevalue) | Checks whether a value passes the local native `Promise` instance check. | **`boolean`**<br><br>`true` if the value passes the local native `Promise` instance check; otherwise `false`. |
| [`isPromiseLike(value)`](#ispromiselikevalue) | Checks whether a value is an object or function with callable `then` and `catch` methods. | **`boolean`**<br><br>`true` if the value is a non-null object or function with callable `then` and `catch` methods; otherwise `false`. |
| [`isThenable(value)`](#isthenablevalue) | Checks whether a value is an object or function with a callable `then` method. | **`boolean`**<br><br>`true` if the value is a non-null object or function with a callable `then` method; otherwise `false`. |
| [`isError(value)`](#iserrorvalue) | Checks whether a value is recognised as an error by the available native check or fallback. | **`boolean`**<br><br>`true` if the captured native error check, or its conservative fallback, recognises the value as an error; otherwise `false`. |

**Array**

| API | Description | Returns |
| --- | --- | --- |
| [`isArray(value)`](#isarrayvalue) | Checks whether a value is an array, including from another realm. | **`boolean`**<br><br>`true` if the value passes native `Array.isArray`; otherwise `false`. |
| [`isNonEmptyArray(value)`](#isnonemptyarrayvalue) | Checks whether a value is an array with a valid length greater than zero. | **`boolean`**<br><br>`true` if the value is an array with a valid length greater than zero; otherwise `false`. |
| [`isArrayOf(value, type?)`](#isarrayofvalue-type) | Checks whether an array contains only values matching a type specification. | **`boolean`**<br><br>`true` if the value is an array and every element matches the specification, including an empty array; otherwise `false`. |
| [`isArrayLike(value)`](#isarraylikevalue) | Checks whether a non-function value has a valid numeric length. | **`boolean`**<br><br>`true` if the value is not a function and has a numeric integer length from `0` through `Number.MAX_SAFE_INTEGER`; otherwise `false`. |
| [`isArrayLikeOf(value, type?)`](#isarraylikeofvalue-type) | Checks whether an array-like value contains only values matching a type specification. | **`boolean`**<br><br>`true` if the value is array-like and every indexed value matches the specification, including an empty input; otherwise `false`. |
| [`isPair(value)`](#ispairvalue) | Checks whether a value is an array of length two. | **`boolean`**<br><br>`true` if the value is an array of length `2`; otherwise `false`. |

**Collection**

| API | Description | Returns |
| --- | --- | --- |
| [`isMap(value)`](#ismapvalue) | Checks whether a value is a genuine `Map`. | **`boolean`**<br><br>`true` if the value is a genuine `Map`; otherwise `false`. |
| [`isMapOf(value, keyType?, valueType?)`](#ismapofvalue-keytype-valuetype) | Checks whether every Map key and value matches its respective specification. | **`boolean`**<br><br>`true` if the value is a `Map` whose keys and values match their respective specifications, including an empty `Map`; otherwise `false`. |
| [`isSet(value)`](#issetvalue) | Checks whether a value is a genuine `Set`. | **`boolean`**<br><br>`true` if the value is a genuine `Set`; otherwise `false`. |
| [`isSetOf(value, type?)`](#issetofvalue-type) | Checks whether a Set contains only values matching a type specification. | **`boolean`**<br><br>`true` if the value is a `Set` whose items all match the specification, including an empty `Set`; otherwise `false`. |
| [`isWeakMap(value)`](#isweakmapvalue) | Checks whether a value is a genuine `WeakMap`. | **`boolean`**<br><br>`true` if the value is a genuine `WeakMap`; otherwise `false`. |
| [`isWeakSet(value)`](#isweaksetvalue) | Checks whether a value is a genuine `WeakSet`. | **`boolean`**<br><br>`true` if the value is a genuine `WeakSet`; otherwise `false`. |

**DOM**

| API | Description | Returns |
| --- | --- | --- |
| [`isNode(value)`](#isnodevalue) | Checks whether a value is an instance of the local DOM `Node` constructor. | **`boolean`**<br><br>`true` if a local `Node` constructor is available and the value passes its instance check; otherwise `false`. |
| [`isElement(value)`](#iselementvalue) | Checks whether a value is an instance of the local DOM `Element` constructor. | **`boolean`**<br><br>`true` if a local `Element` constructor is available and the value passes its instance check; otherwise `false`. |
| [`isFragment(value)`](#isfragmentvalue) | Checks whether a value is an instance of the local DOM `DocumentFragment` constructor. | **`boolean`**<br><br>`true` if a local `DocumentFragment` constructor is available and the value passes its instance check; otherwise `false`. |

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
| [`toArray(value)`](#toarrayvalue) | Converts a synchronous iterable, plain record or supported array-like input to a new shallow array. | **`ArrayElement<T>[]`**<br><br>A new shallow array containing iterable items, own enumerable record values or indexed array-like values. |
| [`toBigInt(value?)`](#tobigintvalue) | Converts a value to a primitive bigint using native conversion. | **`bigint`**<br><br>The converted primitive bigint. |
| [`toBoolean(value?)`](#tobooleanvalue) | Converts a value to a boolean using JavaScript truthiness. | **`boolean`**<br><br>`true` if the input is truthy under JavaScript boolean coercion; otherwise `false`. |
| [`toDate(value?)`](#todatevalue) | Converts a value to a `Date`, returning genuine `Date` objects unchanged. The result can be invalid. | **`Date`**<br><br>The original genuine `Date`, or a new `Date` constructed from the input; it may be invalid. |
| [`toInteger(value?)`](#tointegervalue) | Converts a value to a number and truncates it towards zero. | **`number`**<br><br>The numeric conversion truncated towards zero; it may be `NaN` or infinite. |
| [`toJson(value?, replacer?, space?)`](#tojsonvalue-replacer-space) | Serialises a value to JSON text using native `JSON.stringify` behaviour. | **`string \| undefined`**<br><br>JSON text, or `undefined` when native serialisation produces no text, including omitted input without a replacer. |
| [`fromJson(value, reviver?)`](#fromjsonvalue-reviver) | Parses JSON text into a JavaScript value using native `JSON.parse` behaviour. | **`unknown`**<br><br>The parsed value, or any root value returned by the reviver, including `undefined`. TypeScript returns unknown until the caller validates it. |
| [`toMap(value?)`](#tomapvalue) | Converts a plain record or synchronous iterable of strict key/value pairs to a new shallow Map. | **`ConvertedMap<T>`**<br><br>A new Map containing own enumerable string and symbol record entries or strict iterable pairs, or an empty Map for omitted or nullish input. |
| [`toNumber(value?)`](#tonumbervalue) | Converts a value to a primitive number using JavaScript’s `Number` conversion. | **`number`**<br><br>The converted primitive number; it may be `NaN` or infinite. |
| [`toPlainObject(value)`](#toplainobjectvalue) | Converts JSON object text, a plain object, or entry pairs into a fresh plain object. | **`ConvertedPlainObject<T>`**<br><br>A fresh ordinary object containing the parsed properties, copied enumerable properties, or supplied entries. |
| [`toSet(value?)`](#tosetvalue) | Converts a synchronous iterable, plain record or supported array-like input to a new shallow Set. | **`ConvertedSet<T>`**<br><br>A new Set of iterable items, own enumerable record values or indexed array-like values, or an empty Set for omitted or nullish input. |
| [`toString(value?)`](#tostringvalue) | Converts a value to a primitive string using JavaScript’s `String` conversion. | **`string`**<br><br>The converted primitive string; nullish inputs become their literal text. |
| [`toSymbol(value?)`](#tosymbolvalue) | Converts a value to a primitive symbol, preserving primitive symbols and unboxing genuine Symbol wrappers. | **`symbol`**<br><br>The original or unboxed symbol, or a new symbol created from the description. |

**Conditional conversion**

| API | Description | Returns |
| --- | --- | --- |
| [`boxIf(value, condition?)`](#boxifvalue-condition) | Wraps non-nullish primitives in their native wrapper objects when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| Boxed<T>`**<br><br>The `box` result when requested; otherwise the exact original input. |
| [`unboxIf(value, condition?)`](#unboxifvalue-condition) | Extracts a genuine wrapper’s primitive payload when the condition evaluates to `true` and native unboxing is available. Otherwise, returns the original input unchanged. | **`T \| Unboxed<T>`**<br><br>The `unbox` result when requested; otherwise the exact original input. |
| [`toRegExpIf(value, condition?, flags?)`](#toregexpifvalue-condition-flags) | Converts a native pattern and optional `flags` to a genuine `RegExp` when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| RegExp`**<br><br>The `toRegExp` result when requested; otherwise the exact original input. |
| [`toPromiseIf(value, condition?)`](#topromiseifvalue-condition) | Converts a value to a native `Promise` when the condition evaluates to `true`. Otherwise, returns the original input unchanged. | **`T \| Promise<Awaited<T>>`**<br><br>The `toPromise` result when requested; otherwise the exact original input. |
| [`toArrayIf(value, condition?)`](#toarrayifvalue-condition) | Converts supported iterable, record or array-like input to a new shallow array when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ArrayElement<T>[]`**<br><br>A new shallow array when conversion is requested; otherwise the original input, unchanged. |
| [`toBigIntIf(value, condition?)`](#tobigintifvalue-condition) | Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| bigint`**<br><br>The converted primitive bigint when conversion is requested; otherwise the original input, unchanged. |
| [`toBooleanIf(value, condition?)`](#tobooleanifvalue-condition) | Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| boolean`**<br><br>The input’s boolean truthiness when conversion is requested; otherwise the original input, unchanged. |
| [`toDateIf(value, condition?)`](#todateifvalue-condition) | Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| Date`**<br><br>The original genuine `Date` or a new `Date`, possibly invalid, when conversion is requested; otherwise the original input, unchanged. |
| [`toIntegerIf(value, condition?)`](#tointegerifvalue-condition) | Converts a value to a number and truncates it towards zero when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| number`**<br><br>The numeric conversion truncated towards zero, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged. |
| [`toJsonIf(value, condition?, replacer?, space?)`](#tojsonifvalue-condition-replacer-space) | Serialises a value to JSON text when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| string \| undefined`**<br><br>JSON text or `undefined` when conversion is requested; otherwise the original input, unchanged. |
| [`fromJsonIf(value, condition?, reviver?)`](#fromjsonifvalue-condition-reviver) | Parses JSON when the condition evaluates to `true`; otherwise returns the original input unchanged. | **`T \| unknown`**<br><br>The parsed or revived value when requested; otherwise the original input unchanged. |
| [`toMapIf(value, condition?)`](#tomapifvalue-condition) | Converts a plain record or synchronous iterable of strict entry pairs to a new Map when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedMap<T>`**<br><br>A new Map when conversion is requested; otherwise the original input, unchanged. |
| [`toNumberIf(value, condition?)`](#tonumberifvalue-condition) | Converts a value to a primitive number when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| number`**<br><br>The converted primitive number, possibly `NaN` or infinite, when conversion is requested; otherwise the original input, unchanged. |
| [`toPlainObjectIf(value, condition?)`](#toplainobjectifvalue-condition) | Converts a supported value to a fresh plain object when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedPlainObject<T>`**<br><br>A fresh plain object when conversion is requested; otherwise the exact original input. |
| [`toSetIf(value, condition?)`](#tosetifvalue-condition) | Converts supported iterable, record or array-like input to a new shallow Set when the condition evaluates to `true`. Otherwise, returns the original value unchanged. | **`T \| ConvertedSet<T>`**<br><br>A new Set when conversion is requested; otherwise the original input, unchanged. |
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

The TypeScript result is `boolean`: a structural wrapper interface does not prove native identity. For primitive-only narrowing, use an exact name such as `"boolean"`, `"number"` or `"string"` with `isTypeOf`.

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

The TypeScript result is `boolean`: a structural wrapper interface does not prove native identity. For primitive-only narrowing, use an exact name such as `"boolean"`, `"number"` or `"string"` with `isTypeOf`.

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

The TypeScript result is `boolean`: a structural wrapper interface does not prove native identity. For primitive-only narrowing, use an exact name such as `"boolean"`, `"number"` or `"string"` with `isTypeOf`.

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

### `isNonNullish(value)`

Checks whether a value is neither `null` nor `undefined`.

Use this check to retain present values, including `0`, `false` and the empty string. It can be passed to `Array.filter` and narrows the TypeScript result to `NonNullable<T>`.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | The value to check. |

**Returns:** `boolean` — `true` if the value is neither `null` nor `undefined`; otherwise `false`.

**Examples**

```javascript
isNonNullish(0);               // => true
isNonNullish(false);           // => true
isNonNullish(null);            // => false
```

**Notes**

The generic declaration narrows to `NonNullable<T>`. Values such as `0`, `false`, `""`, `NaN` and `0n` are retained.

---

### `isEmpty(value)`

Checks whether a value is nullish or a supported string or container has no items.

Checks strings, arrays, array-like values, native Maps and Sets, and plain dictionaries without consuming an iterator. `null` and `undefined` count as empty; `[null]` does not. Unsized iterators and iterables throw because their contents cannot be checked without consumption.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is nullish or a supported string or container with no items; otherwise `false`.

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

Use `isEmptyIterable` to consume a synchronous iterable. A `next`-only iterator needs an iterable adapter; asynchronous iteration must be handled by the caller. Unavailable native collection types do not prevent loading or checks of other supported values. If a detected collection lacks the required native size or iteration operation, the check throws `TypeError`.

---

### `isBlank(value)`

Checks whether a value is nullish, an empty or whitespace-only string, or a supported container containing only nullish values.

Accepts nullish values, empty or whitespace-only strings, and supported containers whose contents are all `null` or `undefined`. The check is shallow: `[null]` is blank, but `[""]` is not. Unsized iterators and iterables throw instead of being consumed.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is nullish, a whitespace-only string, or a supported container containing only nullish values; otherwise `false`.

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

The check is shallow: every inspected value must be `null` or `undefined`. Empty strings and empty objects inside a container are not nullish. Unavailable native collection types do not prevent loading or checks of other supported values. If a detected collection lacks the required native size or iteration operation, the check throws `TypeError`.

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

### `isTypeOf(value, type?)`

Checks whether a value matches a type name, instance target, predicate or union of matchers.

Matches one value immediately, without converting it or invoking constructor bodies. Use a string such as `"number"` for a native `typeof` check, `{ predicate: fn }` for a custom check, or an array for alternatives.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | — | The value to check. |
| `type?` | [`TypeMatcher`](#type-specifications) | `undefined` | The matcher for the value or collection items. An omitted matcher matches `undefined`. |

**Returns:** `boolean` — `true` if the value matches the type specification (omission matches `undefined`); otherwise `false`.

**Errors**

- Invalid matcher configuration throws `TypeError`.
- Callback, property-access and native instance-matching errors propagate; see [Type specifications](#type-specifications).

**Examples**

```javascript
class Account {}

isTypeOf(42, 'number');                      // => true
isTypeOf(new Account(), Account);            // => true
isTypeOf('hello', { predicate: isString });  // => true
isTypeOf(null, ['string', null]);            // => true
isTypeOf('42', Number);                      // => false
isTypeOf(42, 'nubmer');                      // => throws TypeError
```

**Additional examples**

```javascript
isTypeOf(1,"number");                        // => true
isTypeOf(null,"object");                     // => true
isTypeOf("12",Number);                       // => false
isTypeOf([], {predicate:Array.isArray});     // => true
```

**Notes**

The whole specification is validated before matching, including branches that evaluation would skip. Invalid names, descriptors, unions and non-callable instance hooks throw `TypeError`. No constructor body is invoked and no input conversion occurs.

Callable instance targets use native `instanceof`; an invalid target prototype can therefore throw during matching. An omitted `type` matches only `undefined`. By contrast, the string matcher `"undefined"` follows native `typeof` and also matches browser `document.all`. See [Type specifications](#type-specifications).

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

### `isObjectLike(value)`

Checks whether a value is a non-null object, excluding functions.

Use this check when functions should be excluded from the object category. Arrays, dates and wrapper objects still pass; use `isPlainObject` for plain dictionaries.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a non-null object other than a function; otherwise `false`.

**Examples**

```javascript
isObjectLike([]);              // => true
isObjectLike(() => {});        // => false
isObjectLike(null);            // => false
```

**Notes**

Includes browser `document.all`, but does not require a plain dictionary. The declaration returns `boolean` because TypeScript’s `object` type also includes functions.

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

### `isCyclic(value)`

Checks whether following enumerable string-keyed properties leads back to an ancestor.

Detects a cycle in an object graph, including through inherited enumerable properties. Two properties sharing the same acyclic child do not form a cycle. Getters and proxy traps may run as properties are inspected.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if enumerable string-keyed property traversal reaches an active ancestor; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
const value = {};
value.self = value;

isCyclic(value);                                     // => true
isCyclic({ a: 1, b: { c: 1 } });                     // => false

const shared = {};
isCyclic({ a: shared, b: shared });                  // => false
```

**Additional examples**

```javascript
isCyclic({a:1,b:{c:1}});                             // => false
isCyclic((()=>{const x={};x.self=x;return x;})());   // => true
```

**Notes**

A cycle must lead back to a value on the current traversal path; shared acyclic children do not count. Traversal is iterative, and completed shared nodes are visited once. Symbols, non-enumerable properties and Map/Set entries are ignored.

The graph is expected to remain stable during the check. Getters and proxy traps can mutate it or throw. Internal reference tracking falls back to local arrays when weak collections are unavailable; no platform globals are changed.

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

### `isEmptyIterable(value)`

Checks whether a synchronous iterable is empty by advancing its iterator.

Advances the iterable until the first item or completion. An item produces `false` and closes the iterator early; completion without an item produces `true`. This can consume or close a one-shot iterator, so do not reuse it after inspection.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the synchronous iterable yields no items; otherwise `false`.

**Errors**

- `TypeError` for non-iterable input.
- Iterator and iterator-closing errors propagate.

**Examples**

```javascript
function* values() {
  yield 1;
}

isEmptyIterable([]);                         // => true
isEmptyIterable(values());                   // => false
isEmptyIterable(null);                       // => throws TypeError
```

**Additional examples**

```javascript
isEmptyIterable([]);                         // => true
isEmptyIterable((function*(){yield 1;})());  // => false
```

**Notes**

A non-iterable input throws `TypeError`. Finding an item produces an early `false` and closes the iterator using native `for...of` rules. Closing can call `return()` or run generator `finally` blocks. Do not reuse a one-shot iterator after inspection.

---

### `isBlankIterable(value)`

Checks whether every item yielded by a synchronous iterable is nullish by advancing its iterator.

Returns `true` for an empty iterable or one yielding only `null` and `undefined`. Stops and closes the iterator at the first other item. The check is shallow and can consume or close one-shot input.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the synchronous iterable yields no items or only nullish items; otherwise `false`.

**Errors**

- `TypeError` for non-iterable input.
- Iterator and iterator-closing errors propagate.

**Examples**

```javascript
function* values() {
  yield null;
  yield undefined;
}

isBlankIterable(values());                                       // => true
isBlankIterable([0]);                                            // => false
isBlankIterable(new Map([['key', null]]));                       // => false
```

**Additional examples**

```javascript
isBlankIterable((function*(){yield null;yield undefined;})());   // => true
isBlankIterable([0]);                                            // => false
```

**Notes**

Checks yielded items themselves. A non-empty Map yields entry arrays, so it returns `false` even when every Map value is nullish; `isBlank(map)` instead checks the Map’s values.

Finding a non-nullish item closes the iterator early, which can run cleanup code. Iteration and closing errors propagate. A nullish-only infinite iterable never completes.

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

Checks whether a value is an object or function with callable `then` and `catch` methods.

Use this for the library’s two-method Promise-like convention. Unlike `isThenable`, it requires both methods; unlike `isPromise`, it does not require a local native instance. Neither method is called.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a non-null object or function with callable `then` and `catch` methods; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
isPromiseLike({then(){},catch(){}});   // => true
isPromiseLike({then(){}});             // => false
```

**Notes**

The library requires both `then` and `catch`. This is stricter than `isThenable` and differs from TypeScript’s `PromiseLike` interface. Neither method is invoked, but reading the properties can execute getters or proxy traps.

---

### `isThenable(value)`

Checks whether a value is an object or function with a callable `then` method.

Detects the shape used by promise resolution, without invoking `then` or requiring a `catch` method. A passing result does not prove that the object follows Promise behaviour.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is a non-null object or function with a callable `then` method; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.

**Examples**

```javascript
isThenable({then(){}});        // => true
isThenable({then:1});          // => false
```

**Notes**

Objects from another realm and null-prototype objects can pass. The `then` method is read but not invoked. Its presence does not prove compliance with the Promises/A+ rules.

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

### `isNonEmptyArray(value)`

Checks whether a value is an array with a valid length greater than zero.

Checks array identity and length without validating the elements. A hole contributes to length, so `Array(1)` is non-empty even though it has no stored element.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

**Returns:** `boolean` — `true` if the value is an array with a valid length greater than zero; otherwise `false`.

**Errors**

- Property getters or proxy traps may throw; their errors propagate.
- Native `Array.isArray` also throws `TypeError` for a revoked proxy.

**Examples**

```javascript
isNonEmptyArray([null]);         // => true
isNonEmptyArray(new Array(1));   // => true
isNonEmptyArray([]);             // => false
```

**Notes**

A hole contributes to array length without storing a value. Element types are not checked. An invalid exposed array length, for example through a proxy, returns `false`.

---

### `isArrayOf(value, type?)`

Checks whether an array contains only values matching a type specification.

Validates the entire matcher before checking the container, then checks each element until a mismatch is found. An empty container passes a valid matcher. Invalid configuration throws even when the input is empty or is not the expected container type.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | — | The value to check. |
| `type?` | [`TypeMatcher`](#type-specifications) | `undefined` | The matcher for the value or collection items. An omitted matcher matches `undefined`. |

**Returns:** `boolean` — `true` if the value is an array and every element matches the specification, including an empty array; otherwise `false`.

**Errors**

- Invalid matcher configuration throws `TypeError`.
- Callback, property-access and native instance-matching errors propagate; see [Type specifications](#type-specifications).

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

The length is read once; indexed values are read as matching proceeds. Missing positions read as `undefined` unless an inherited numeric property supplies a value. Appends beyond the original length are ignored.

Matcher validation happens before any container check. Invalid configuration throws for empty and non-collection inputs too; a valid empty container passes. An array exposing an invalid length, for example through a proxy, returns `false`.

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

### `isArrayLikeOf(value, type?)`

Checks whether an array-like value contains only values matching a type specification.

Validates the entire matcher before checking the container, then checks each indexed value until a mismatch is found. An empty container passes a valid matcher. Invalid configuration throws even when the input is empty or is not the expected container type.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | — | The value to check. |
| `type?` | [`TypeMatcher`](#type-specifications) | `undefined` | The matcher for the value or collection items. An omitted matcher matches `undefined`. |

**Returns:** `boolean` — `true` if the value is array-like and every indexed value matches the specification, including an empty input; otherwise `false`.

**Errors**

- Invalid matcher configuration throws `TypeError`.
- Callback, property-access and native instance-matching errors propagate; see [Type specifications](#type-specifications).

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

The length is read once; indexed values are read as matching proceeds. Missing positions read as `undefined` unless an inherited numeric property supplies a value. Appends beyond the original length are ignored.

Matcher validation happens before any container check. Invalid configuration throws for empty and non-collection inputs too; a valid empty container passes.

---

### `isPair(value)`

Checks whether a value is an array of length two.

Checks the array’s length rather than whether both positions contain values. Sparse arrays of length two pass; array-like objects do not.

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

### `isMapOf(value, keyType?, valueType?)`

Checks whether every Map key and value matches its respective specification.

Validates both matchers before inspecting the input, then checks each key before its associated value. An empty Map passes valid matchers. Native Map iteration is live, so predicates must not mutate the Map.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | — | The value to check. |
| `keyType?` | [`TypeMatcher`](#type-specifications) | `undefined` | The matcher for Map keys. An omitted matcher matches `undefined`. |
| `valueType?` | [`TypeMatcher`](#type-specifications) | `undefined` | The matcher for Map values. An omitted matcher matches `undefined`. |

**Returns:** `boolean` — `true` if the value is a `Map` whose keys and values match their respective specifications, including an empty `Map`; otherwise `false`.

**Errors**

- Invalid matcher configuration throws `TypeError`.
- Callback, property-access and native instance-matching errors propagate; see [Type specifications](#type-specifications).

**Examples**

```javascript
isMapOf(new Map([["x",1]]), "string", "number");   // => true
isMapOf(new Map(), "string", "number");            // => true
isMapOf(new Map([[1,1]]), "string", "number");     // => false
```

**Notes**

Uses captured native Map entry iteration, ignoring an overridden iterator method and supporting Maps from another realm. Evaluation stops at the first failed key or value. Iteration is live: predicates must not mutate the Map.

Both matchers are validated even for an empty or non-Map input. An empty Map passes valid matchers. Unavailable native collection types do not prevent loading or checks of other supported values. If a detected collection lacks the required native size or iteration operation, the check throws `TypeError`.

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

### `isSetOf(value, type?)`

Checks whether a Set contains only values matching a type specification.

Validates the entire matcher before checking the container, then checks each item until a mismatch is found. An empty container passes a valid matcher. Invalid configuration throws even when the input is empty or is not the expected container type.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | — | The value to check. |
| `type?` | [`TypeMatcher`](#type-specifications) | `undefined` | The matcher for the value or collection items. An omitted matcher matches `undefined`. |

**Returns:** `boolean` — `true` if the value is a `Set` whose items all match the specification, including an empty `Set`; otherwise `false`.

**Errors**

- Invalid matcher configuration throws `TypeError`.
- Callback, property-access and native instance-matching errors propagate; see [Type specifications](#type-specifications).

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

Uses captured native Set iteration, ignoring an overridden iterator method. Iteration is live: predicates must not mutate the Set because mutation can change the result or prevent termination.

The matcher is validated even for an empty or non-Set input. An empty Set passes a valid matcher. Unavailable native collection types do not prevent loading or checks of other supported values. If a detected collection lacks the required native size or iteration operation, the check throws `TypeError`.

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

### `isFragment(value)`

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
isFragment(document.createDocumentFragment());   // => true
isFragment({nodeType:1});                        // => false
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

These functions explicitly convert values. Native coercion rules, exceptions, and observable side effects are part of their documented contracts.

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

Converts a synchronous iterable, plain record or supported array-like input to a new shallow array.

Consumes synchronous iterables first, copies plain-record values second, and reads supported non-plain array-like inputs third. Record values include own enumerable string and symbol properties, including a property named length. Nullish input and unsupported values throw instead of producing an empty array.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | The value to convert. |

**Returns:** `ArrayElement<T>[]` — A new shallow array containing iterable items, own enumerable record values or indexed array-like values.

**Errors**

- TypeError for nullish or unsupported input, malformed iterators or invalid array-like lengths.
- Oversized array results can throw RangeError.
- Getter, proxy and iterator errors propagate.
- Missing native Array.from throws before conversion; record copying requires symbol-enumeration support.

**Examples**

```javascript
toArray(new Set([1, 2]));                                                    // => [1,2]
toArray('A😀B');                                                             // => ["A","😀","B"]
toArray({0: 'x', length: 1});                                                // => ["x",1]
toArray({a: 1, b: 2});                                                       // => [1,2]
(() => { const key = Symbol('key'); return toArray({a: 1, [key]: 2}); })();  // => [1,2]
```

**Notes**

Functions, boxed primitives, Dates and RegExps are rejected before inspecting iterator or length properties. Other non-string primitives are unsupported. On eligible inputs a synchronous iterator takes precedence over record properties and indexed values. The iterator method is read once and called with the original input as receiver; null or undefined permits fallback, while other non-callable methods throw.

Plain records include null-prototype and foreign-realm records. Own string and symbol keys are snapshotted in property order; each current enumerable descriptor is checked and each included value is read once. Inherited and non-enumerable properties are excluded, newly added keys are not copied, and deleted or newly hidden keys are skipped. A length property is ordinary record data.

Only non-plain array-like inputs use indexed fallback. Their length must be a primitive number that is an integer between zero and Number.MAX_SAFE_INTEGER, matching isArrayLike; strings, fractions and coercible objects are rejected. Length is read once and indexed values are read live. Missing slots become explicit undefined and inherited numeric values are included. Strings iterate by Unicode code point. Nested values retain identity.

Ordinary promises and native async-only containers without a supported synchronous source are rejected. No input is awaited. A plain async-only record is copied as data, including an enumerable async-iterator symbol and its value. Finite one-shot iterators are consumed; infinite iterables do not finish and very large inputs can exhaust memory. Requires native Array.from. Record copying requires Reflect.ownKeys or Object.getOwnPropertySymbols; if both are missing it throws instead of silently discarding possible symbol keys.

If a copied record has an enumerable nullish Symbol.iterator value, the value captured during source dispatch is reused; its getter is not read a second time. Other selected property values are read live after checking their current descriptor.

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

Converts a plain record or synchronous iterable of strict key/value pairs to a new shallow Map.

Copies own enumerable string and symbol properties of plain records, or consumes synchronous iterables of exact two-element array pairs. Synchronous iteration takes precedence on eligible inputs. Keys may have any type and are never coerced. Omitted, null or undefined input creates an empty Map.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `T` | `undefined` | The value to convert. |

**Returns:** `ConvertedMap<T>` — A new Map containing own enumerable string and symbol record entries or strict iterable pairs, or an empty Map for omitted or nullish input.

**Errors**

- TypeError for unsupported input, malformed iterators or entry pairs that are not exact two-element arrays with both own indices.
- Getter, proxy and iterator errors propagate.
- Entry validation errors close the outer iterator.
- Missing native Map throws before conversion; record copying requires symbol-enumeration support.

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

Functions, boxed primitives, Dates and RegExps are rejected before iterator inspection. Plain records include null-prototype and foreign-realm records. Own string and symbol keys are captured once in property order; each current descriptor is checked before its enumerable value is read once. Inherited and non-enumerable properties are excluded, deleted or newly hidden keys are skipped, newly added keys are excluded, and nested values retain identity. Numeric property names become string keys; symbol keys stay symbols. An own constructor or length field is ordinary data.

A synchronous iterator takes precedence over record properties on eligible inputs. Its method is read once and called with the original input as receiver. A null or undefined iterator permits record conversion; other non-callable methods throw. Async iterators are never invoked or awaited. A plain async-only object is copied as a record, including enumerable symbol properties. Ordinary promises and native async-only containers without a supported synchronous source are rejected.

Each iterable entry must be an actual array of length exactly two, with own properties at both indices 0 and 1. Explicit undefined keys and values are valid. Holes, inherited-only indices, extra elements, strings and array-like entry objects are rejected. Any key type is allowed, without string coercion. Non-empty strings yield primitive entries and throw; an empty string yields no entries. There is no array-like source fallback.

Native SameValueZero key equality merges repeated NaN keys and treats negative and positive zero as the same key. The last value for a repeated key wins without moving its insertion position. Entry validation and property-access errors inside the loop close the outer iterator; the original error wins over a cleanup error. Native for-of failures while reading next, done or value propagate without an additional close attempt.

Finite one-shot iterators are consumed once; infinite inputs do not finish and no work limit is imposed. Requires native Map. Record copying requires Reflect.ownKeys or Object.getOwnPropertySymbols; missing both throws instead of dropping possible symbol keys.

If a copied record has an enumerable nullish Symbol.iterator value, the value captured during source dispatch is reused; its getter is not read a second time. Other selected property values are read live after checking their current descriptor.

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

Converts JSON object text, a plain object, or entry pairs into a fresh plain object.

Parses primitive JSON object strings, shallow-copies plain records, or consumes synchronous entries. Every result has the local Object.prototype. Nullish input and unsupported values throw instead of being boxed.

**Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | The value to convert. |

**Returns:** `ConvertedPlainObject<T>` — A fresh ordinary object containing the parsed properties, copied enumerable properties, or supplied entries.

**Errors**

- Malformed JSON throws SyntaxError.
- Unsupported inputs, non-object JSON, malformed entry pairs and unsupported keys throw TypeError.
- Getter, proxy and iterator errors propagate without replacement.

**Examples**

```javascript
toPlainObject('{"a":1}');                                                        // => ({ a: 1 })
toPlainObject([['a', 1]]);                                                       // => ({ a: 1 })

const object = { x: 1 };
toPlainObject(object) === object;                                                // => false
```

**Additional examples**

```javascript
toPlainObject('{"a":1}');                                                        // => {"a":1}
toPlainObject([['a', 1], ['a', 2]]);                                             // => {"a":2}
(() => { const object = {x: 1}; return toPlainObject(object) === object; })();   // => false
```

**Notes**

Primitive JSON text must contain a non-null, non-array object; nested arrays are allowed. Boxed strings are not parsed. Other primitives, functions, Dates, RegExps and non-iterable class instances are unsupported. No primitive boxing, repairs or schema validation is performed.

A synchronous iterator takes precedence over copying record properties. Each entry must be an actual two-element array with both own slots present; an explicit undefined value is allowed. Extra or missing elements, strings and array-like entry objects are rejected. Duplicate keys use the last value. Keys are primitive strings or symbols and are never coerced. Special names such as __proto__, constructor, prototype and toString become ordinary own data properties.

Record copying snapshots own keys, checks each current enumerable descriptor and reads each included value once. Inherited and non-enumerable properties are omitted. Getters may mutate the source or throw. Results have writable, enumerable, configurable data properties and preserve nested references. TypeScript makes inferred properties optional because enumerability and presence cannot be proved structurally; JSON results contain unknown values. Prototype-name properties and broad string-key records also have unknown values because an omitted own key can expose an inherited property.

Consumes a synchronous iterable once; infinite inputs do not finish. Entry validation or property access in the loop closes the outer iterator, running return/finally cleanup. The original conversion error takes precedence over a cleanup error. Native for-of protocol failures in next, done or value propagate without an additional close attempt. Async iteration is never consumed or awaited. Async generators are unsupported; a plain async-only object is copied as a record, including enumerable symbol properties. Symbol enumeration requires Reflect.ownKeys or Object.getOwnPropertySymbols when copying records; missing both throws rather than silently discarding symbol keys. JSON and array-entry conversion remain available.

If a copied record has an enumerable nullish Symbol.iterator value, the value captured during source dispatch is reused; its getter is not read a second time. Other selected property values are read live after checking their current descriptor.

---

### `toSet(value?)`

Converts a synchronous iterable, plain record or supported array-like input to a new shallow Set.

Uses the same source order as toArray: synchronous iterable values, then own enumerable string and symbol values from plain records, then supported non-plain array-like indices. Native Set equality removes duplicates while preserving first-insertion order. Omitted, null or undefined input creates an empty Set.

**Parameters**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value?` | `T` | `undefined` | The value to convert. |

**Returns:** `ConvertedSet<T>` — A new Set of iterable items, own enumerable record values or indexed array-like values, or an empty Set for omitted or nullish input.

**Errors**

- TypeError for unsupported input, malformed iterators or invalid array-like lengths.
- Getter, proxy and iterator errors propagate.
- Missing native Set throws before conversion; record copying requires symbol-enumeration support.

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

Functions, boxed primitives, Dates and RegExps are rejected before inspecting iterator or length properties; non-string primitives other than nullish input are also unsupported. A synchronous iterator takes precedence over record and indexed data. Its method is read once and called with the original input as receiver; null or undefined permits fallback, while other non-callable methods throw.

Plain records include null-prototype and foreign-realm records. Own string and symbol keys are snapshotted in property order, current enumerability is checked, and each included value is read once. Inherited and non-enumerable properties are excluded. A length property is copied as ordinary data. Record copying requires Reflect.ownKeys or Object.getOwnPropertySymbols; missing both throws instead of omitting possible symbol keys.

Only non-plain array-like inputs use indexed fallback. Length must be a primitive number that is an integer between zero and Number.MAX_SAFE_INTEGER, matching isArrayLike. Length is read once and values are read live; missing slots yield undefined and inherited indices can supply values. Strings yield Unicode code points and Maps yield entry arrays. Values retain their identities.

Native SameValueZero equality merges repeated NaN values and treats negative and positive zero as the same value. Distinct objects remain distinct; repeated references collapse. The result is a fresh local Set.

Ordinary promises and native async-only containers without a supported synchronous source are rejected. Plain async-only records are copied as data, including enumerable symbol values, without invoking their async iterator. No input is awaited. Iterators are consumed once; infinite iterables do not finish and no work limit is imposed. Requires native Set but does not require Array.from.

If a copied record has an enumerable nullish Symbol.iterator value, the value captured during source dispatch is reused; its getter is not read a second time. Other selected property values are read live after checking their current descriptor.

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

Converts supported iterable, record or array-like input to a new shallow array when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toArray` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toArray`. Consumes iterable input, copies own enumerable string and symbol record values, or reads supported array-like indices. Array-like lengths must already be numeric safe integers at least zero. Nullish and unsupported inputs throw. Requires native `Array.from`; missing support throws `TypeError` before inspecting the input.

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

Converts a plain record or synchronous iterable of strict entry pairs to a new Map when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toMap` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toMap`. Plain records supply own enumerable string and symbol entries. Iterable pairs must be exact two-element arrays with both own indices present. Duplicate keys keep their first position and take the last value. Nullish input creates an empty Map. Requires native `Map`; missing support throws before inspecting the input.

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

Converts a supported value to a fresh plain object when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toPlainObject` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toPlainObject`. Returns a fresh ordinary object. Copies own enumerable string and symbol properties, preserving nested references. Entry pairs must be two-element arrays with string or symbol keys. Nullish input throws.

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
toPlainObjectIf('{"a":1}', true);  // => {"a":1}
toPlainObjectIf(null, false);      // => null
```

**Notes**

A predicate receives the original value once, without an explicit `this` receiver. It must return a primitive boolean; other results, including Promises, throw `TypeError`. Promise results are not awaited and no rejection handler is attached.

Predicate errors propagate. A predicate can mutate its input; a requested conversion then sees that mutation. No clone or rollback is introduced. A skipped conversion does not inspect the input. When requested, conversion follows the full `toPlainObject` contract.

---

### `toSetIf(value, condition?)`

Converts supported iterable, record or array-like input to a new shallow Set when the condition evaluates to `true`. Otherwise, returns the original value unchanged.

Uses the same conversion as `toSet` when requested. A primitive boolean is used directly; a predicate receives the original input once and must return a primitive boolean. A `false`, omitted or `undefined` condition returns the input unchanged without inspecting or converting it.

Requested conversion uses `toSet`. Copies iterable values, own enumerable string and symbol record values, or supported array-like indices. Lengths must be numeric safe integers at least zero. Nullish input creates an empty Set; unsupported inputs throw. Requires native `Set`, independently of `Array.from`; missing support throws before inspecting the input.

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

`toArray` and `toSet` consume synchronous iterable values first, copy own enumerable string and symbol record values second, and read supported non-plain array-like indices third. Array-like lengths must already be numeric safe integers at least zero; a record length is ordinary data. `toMap` copies record entries including symbols or consumes exact two-element array pairs with both own indices. `toPlainObject` creates a fresh object from JSON object text, records or the same strict pairs with primitive string/symbol keys. Unsupported inputs throw instead of being boxed or silently converted to empty collections.

`box` preserves nullish input and existing objects; `unbox` extracts genuine native wrapper payloads without custom coercion. `toRegExp` uses native patterns and flags without literal escaping. `toPromise` adopts values and thenables through native `Promise.resolve`; its resolution failures reject, while some native errors can throw synchronously.

Conditional converters evaluate a boolean condition or synchronous predicate once. A `false`, omitted or `undefined` condition returns the original input without inspecting or converting it. See the [conversion guide](conversions.md) for identity, coercion and precision details.

### Errors and side effects

An ordinary failed check returns `false`. Invalid matcher configuration and unsupported inputs documented by an individual API can throw. Application callbacks, property getters, proxy traps, conversion hooks and iterator operations may also throw; their errors propagate.

Checks are not schema validation or a security boundary. Native identity, local-instance and capability checks have different guarantees. For example, a callable `then` property does not prove correct Promise behaviour. See the [runtime guide](runtime.md) and each function's notes for those boundaries.

Protocol method checks test callability without invoking the method. This includes the browser's callable `document.all` value even though its `typeof` result is `"undefined"`. The separate `isFunction()` predicate deliberately retains its literal `typeof === "function"` contract. A callable class or revoked callable proxy can still throw when invoked; a capability check is not an execution guarantee.

### Empty and blank values

`isEmpty` and `isBlank` inspect sized inputs without consuming unsized iterators. They handle strings, native Maps and Sets, and valid array-like lengths before protocol checks. Unsized iterator or iterable capabilities throw `TypeError`; remaining plain dictionaries use own enumerable string keys.

Use `isEmptyIterable` or `isBlankIterable` when consuming a synchronous iterable is intended. These operations can close an iterator early. Do not reuse a one-shot iterator after inspection; a nullish-only infinite iterable never finishes a blankness check. Native early closing requests cleanup once. It does not drain a generator that yields from `finally`, await asynchronous cleanup, or guarantee resource release when the iterator itself does not complete cleanup.

Blankness is shallow. `[null, undefined]` is blank, but `['']` and `[{}]` are not. Map blankness checks values, whereas iterating a Map yields entry arrays.

### Type specifications

The `type`, `keyType`, and `valueType` parameters accept the following matcher forms:

- A case-sensitive `typeof` name: `'undefined'`, `'boolean'`, `'number'`, `'bigint'`, `'string'`, `'symbol'`, `'function'`, or `'object'`. A boxed string containing a valid name is also accepted. As with native `typeof`, `'object'` matches `null`.
- A function target, or `{ instanceOf: Target }`, for a native `instanceof` check. Constructor bodies are never called; custom instance hooks run only during matching.
- `{ predicate: fn }`, where `fn` is a synchronous function returning a primitive boolean.
- `null` or `undefined`, for strict identity. An omitted type means `undefined`.
- An array of alternative matchers, including nested arrays. An empty union matches no value.

<!-- prettier-ignore -->
```javascript
class Account {}

isTypeOf(42, 'number');                      // => true
isTypeOf(new Account(), Account);            // => true
isTypeOf('hello', { predicate: isString });  // => true
isTypeOf(null, ['string', null]);            // => true
isTypeOf('42', Number);                      // => false
```

The complete specification is validated before matching, including alternatives that evaluation would otherwise skip. Invalid names, cyclic unions, ambiguous descriptors, and non-boolean predicate results throw `TypeError`. Use `{ predicate: fn }` for predicates, not bare functions.

Each matching operation snapshots each distinct union array once and reuses that structure within the operation. Application predicates still run in order on each check; their results are never cached. Later changes to constructors and callback state still affect matching.

Instance checks use native realm and prototype rules. For example, a Date from another realm may fail a local `instanceof Date` check. Use `{ predicate: isDate }` to recognise dates across realms.

Prototype errors for callable instance targets are deferred to native `instanceof` evaluation. This supports bound functions and custom instance hooks without invoking them during compilation.

See [Matcher specification contract](#matcher-specification-contract) for descriptor validation details.

## TypeScript

TypeScript declarations are included; no separate `@types` package is required. They support root and per-function imports. Default imports compiled to CommonJS require `esModuleInterop`; Node16 and NodeNext consumers use the package's conditional export map.

<!-- prettier-ignore -->
```typescript
import { isTypeOf } from 'go-types';

const value: unknown = 'hello';

if (isTypeOf(value, 'string')) {
  value.toUpperCase();         // => 'HELLO'
}
```

TypeScript narrows values for fixed exact primitive names and strict `null`/`undefined` matchers. The generic `isNonNullish` helper also narrows filtered values. Native identity checks, dynamic specifications, unions, predicate descriptors, and collection-content validators return `boolean`. A failed check cannot safely exclude a structural TypeScript type: an object can have a Date-shaped interface without being a native Date.

`unbox` retains the original object type plus possible primitive payloads because structural properties cannot prove a native wrapper brand. `box` uses `Boxed<T>`; `toPromise` uses `Promise<Awaited<T>>`.

`toDate()` returns `Date`; it does not promise to preserve extra input properties during conversion. See the [runtime guide](runtime.md#typescript-boundaries) for declaration boundaries.

`toArray()`, `toSet()` and `toMap()` infer definite iterable contents before record or indexed contents. Known record symbols contribute to inferred values and Map keys. A visibly optional or nullable iterator that may be callable keeps inferred contents conservative because it can override the fallback source; an iterator declared only as `null`/`undefined` permits fallback inference. Structural types cannot prove a plain prototype, enumerability or complete pair indices. Skipped conversions preserve the original input type.

Root and focused CommonJS declarations support strict consumers targeting ES2017 with ES2017 libraries and `skipLibCheck: false`. Runtime support for optional native features remains separate: selecting a newer compiler library does not add BigInt to Node 8. See the [runtime guide](runtime.md#typescript-boundaries) for declaration details.

## Shared contracts

These checks classify values; they do not validate an application schema or provide a security boundary. A successful identity check does not guarantee that replaceable methods or properties are intact. A capability check establishes method presence, not that calling it will succeed.

Application callback, getter, proxy and iterator errors propagate. Native identity checks deliberately catch incompatible-receiver errors when probing a value with a built-in operation; this turns a normal type mismatch into `false`. See [Errors and side effects](#errors-and-side-effects).

TypeScript interfaces describe structure, which does not always prove native identity. Similarly, a failed refinement such as `isInteger` does not rule out every number, and a failed collection check can still leave a typed sparse array. Declarations therefore return `boolean` where narrowing either branch would be unsafe. See [TypeScript](#typescript) and the [runtime guide](runtime.md#typescript-boundaries).

## Matcher specification contract

The following forms define the rules used by `isTypeOf` and the collection-content checks. Validation happens before matching, even when a branch would otherwise be skipped.

| Specification                          | Meaning                                                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A valid `typeof` name                  | Exact, case-sensitive comparison. `"object"` includes `null`; `"undefined"` includes browser `document.all`.     |
| A boxed valid type-name string         | The same comparison, using native unboxing without calling overridden conversion methods.                        |
| `null` or `undefined`                  | Strict identity. Omitting the matcher means `undefined`.                                                         |
| A function or `{ instanceOf: Target }` | Native `instanceof`; the constructor body is never invoked.                                                      |
| `{ predicate: fn }`                    | A synchronous check returning a primitive boolean. The descriptor is not used as the callback’s `this` receiver. |
| Nested arrays                          | Ordered alternatives, evaluated until one matches after the entire configuration has been validated.             |
| An empty array `[]`                    | Matches no value. Empty collections still pass valid element constraints.                                        |

Predicate callbacks receive one argument, the value being checked, without a supplied `this` receiver. Bind receiver-dependent functions before placing them in a descriptor, or use an arrow adapter. This applies equally to direct and collection-content checks. The declarations reject explicit receiver requirements incompatible with `undefined`; they cannot recover a receiver requirement erased from a function type.

Descriptor selectors must be own data properties. Inherited selectors, accessors, ambiguous descriptors, unsupported leaves, unknown type names, cyclic unions and non-callable instance hooks throw `TypeError`. Unrelated descriptor fields are ignored. Descriptor containers need not be plain objects. After the bare-function and boxed-type-name forms are handled, other objects (including `document.all`) may supply valid own selectors; an object without a selector is still invalid.

Union element accessors are rejected without being called. A missing array position means `undefined`; inherited numeric configuration is ignored. Repeated acyclic subarrays are compiled once per array identity. Built-in alternatives without application callbacks can be compacted without executing user code.

Configuration inspection can trigger proxy and prototype traps. Custom `Symbol.hasInstance` methods run only during matching; their exceptions propagate. Callable targets are not tested for constructibility or prototype validity during compilation. Native `instanceof` decides at evaluation time, including for bound functions: a primitive input can produce `false` where an object input throws `TypeError`.

Only the descriptor and union structure is snapshotted. Constructors, instance hooks and callback closures keep their live state. Predicates must be synchronous and must not mutate Map/Set inputs. There is no built-in work budget for very large configurations or callback work.

Instance checks retain native realm and prototype rules. Use `{ predicate: isDate }` to recognise Dates across realms when a local `Date` instance matcher is too restrictive.

Composite matchers and collection validators return `boolean` in TypeScript. Only fixed `"number"`, `"string"`, `"boolean"`, `"bigint"` and `"symbol"` matchers, and strict `null`/`undefined` matchers, have narrowing overloads. Dynamic names, all unions, predicate descriptors and instance matchers do not narrow. Neither do the native `typeof` names `"object"`, `"function"` and `"undefined"`. Refine a dynamic result with ordinary control-flow checks when necessary.
