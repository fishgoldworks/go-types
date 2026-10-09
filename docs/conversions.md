# Conversion utilities

Go Types provides **22 public conversion functions**: eleven conversions and their eleven conditional counterparts. All are part of the supported public API.

```js
import { toNumber, toArrayIf } from 'go-types';
import toString from 'go-types/toString';

// Equivalent CommonJS and conversion-directory paths:
const toInteger = require('go-types/conversion/toInteger');
const toDate = require('go-types/src/conversion/toDate.js');
```

## Conversion versus validation

Checks classify values; conversions apply the coercion rules described here. A successful conversion can still produce a value unsuitable for your application: a number can be `NaN`, an integer-conversion result can be infinite, and a Date can be invalid. Validate the result when your application needs a narrower range of values.

<!-- prettier-ignore -->
```js
import { isNumber, toNumber, isFinite, toDate, isValidDate } from 'go-types';

isNumber('42');                // => false
const number = toNumber('42');
isFinite(number);              // => true

const date = toDate('not a date');
isValidDate(date);             // => false
```

Conversions propagate application errors. Object conversion methods, getters and proxy traps may run and throw. Symbol-wrapper detection catches incompatible-receiver errors from its native probe; errors from the subsequent native conversion still propagate.

## API summary

| Conversion                           | Conditional counterpart                            | Result                                             |
| ------------------------------------ | -------------------------------------------------- | -------------------------------------------------- |
| [`toArray`](API.md#toarrayvalue)     | [`toArrayIf`](API.md#toarrayifvalue-condition)     | A new shallow ordinary array.                      |
| [`toBigInt`](API.md#tobigintvalue)   | [`toBigIntIf`](API.md#tobigintifvalue-condition)   | A primitive bigint.                                |
| [`toBoolean`](API.md#tobooleanvalue) | [`toBooleanIf`](API.md#tobooleanifvalue-condition) | A primitive boolean, using truthiness.             |
| [`toDate`](API.md#todatevalue)       | [`toDateIf`](API.md#todateifvalue-condition)       | A `Date`, which may be invalid.                    |
| [`toInteger`](API.md#tointegervalue) | [`toIntegerIf`](API.md#tointegerifvalue-condition) | Number conversion truncated towards zero.          |
| [`toMap`](API.md#tomapvalue)         | [`toMapIf`](API.md#tomapifvalue-condition)         | A new shallow Map from iterable entries.           |
| [`toNumber`](API.md#tonumbervalue)   | [`toNumberIf`](API.md#tonumberifvalue-condition)   | A primitive number, potentially `NaN` or infinite. |
| [`toObject`](API.md#toobjectvalue)   | [`toObjectIf`](API.md#toobjectifvalue-condition)   | An object/function or primitive wrapper.           |
| [`toSet`](API.md#tosetvalue)         | [`toSetIf`](API.md#tosetifvalue-condition)         | A new shallow Set of iterable values.              |
| [`toString`](API.md#tostringvalue)   | [`toStringIf`](API.md#tostringifvalue-condition)   | A primitive string.                                |
| [`toSymbol`](API.md#tosymbolvalue)   | [`toSymbolIf`](API.md#tosymbolifvalue-condition)   | A primitive symbol.                                |

See the **[full API documentation](API.md)** for parameters, return values, errors and examples for each function. The additional examples below illustrate the shared rules and important distinctions.

## Array conversion

`toArray(value)` delegates to the captured `Array.from` operation, without a mapping callback or a caller-supplied constructor.

<!-- prettier-ignore -->
```js
toArray(new Set([1, 2]));      // => [1, 2]
toArray(new Map([['x', 1]]));  // => [['x', 1]]
toArray('A😀B');               // => ['A', '😀', 'B']
toArray({0: 'x', length: 2});  // => ['x', undefined]
toArray(Array(2));             // => [undefined, undefined]
toArray(42);                   // => []
toArray({x: 1});               // => []
```

Iterable input takes precedence over array-like shape. Otherwise, native length conversion applies: fractional lengths truncate, negative lengths become zero, and a missing length is zero. This differs deliberately from `isArrayLike`, which validates an already-numeric safe-integer length. A null/undefined input, malformed iterator, or incompatible length conversion throws. Oversized array lengths can throw `RangeError`.

The result is a new ordinary array in the local realm; nested elements retain their identities. Native indexed reads fill sparse slots, including inherited index values. This does not extract object values or entries.

A finite one-shot iterator is consumed. Infinite iterables never finish, and very large inputs can exhaust memory. There is no work limit, hidden buffering or deep cloning.

## Number and integer conversion

`toNumber(value)` follows `Number(value)`, including native coercion and errors. `toInteger(value)` applies `Math.trunc` to that result.

<!-- prettier-ignore -->
```js
toNumber('12.5');                // => 12.5
toNumber('0x10');                // => 16
toNumber(' ');                   // => 0
toNumber(null);                  // => 0
toNumber(undefined);             // => NaN
toInteger('12.9');               // => 12
toInteger('-12.9');              // => -12
toInteger('1e3');                // => 1000
toInteger('12px');               // => NaN
Object.is(toInteger(-0.5), -0);  // => true
```

Integer conversion processes the whole value, unlike `parseInt`, and truncates toward zero, unlike `Math.floor`. `NaN`, infinities and signed zero retain native truncation behaviour. No clamping, locale parsing or safe-integer guarantee is implied. Use `isInteger` or `isSafeInteger` when those constraints matter.

Converting a bigint to a number can lose precision; sufficiently large bigints can become infinite. Coercion hooks on objects can run. Primitive/boxed symbols cannot be converted to numbers and throw `TypeError`. Omitting the argument is equivalent to explicitly passing `undefined`, not to calling `Number()` with zero arguments.

## BigInt conversion

`toBigInt(value)` requires native BigInt support (Node.js 10.4 or later). Without it, requested conversion throws `TypeError` before coercing input; `toBigIntIf(value, false)` still returns the input unchanged. The following examples require BigInt support.

On capable hosts, `toBigInt(value)` follows `BigInt(value)`. Integral numbers, booleans and valid integer strings are accepted. Integer strings can contain hexadecimal, binary or octal prefixes. Whitespace-only and empty strings convert to `0n`.

<!-- prettier-ignore -->
```js
toBigInt('9007199254740993');  // => 9007199254740993n
toBigInt(true);                // => 1n
toBigInt('0xff');              // => 255n
toBigInt(1.5);                 // => throws RangeError
toBigInt('1.5');               // => throws SyntaxError
toBigInt(null);                // => throws TypeError
```

Fractional or non-finite numbers throw `RangeError`. Invalid text, including decimal fractions and exponent notation, throws `SyntaxError`. `null`, `undefined` and symbols throw `TypeError`. Passing an already-rounded Number cannot restore its original precision; use integer text or bigint inputs for exact large values.

## Boolean and string conversion

`toBoolean(value)` applies JavaScript truthiness; it does not parse text. Objects remain truthy without calling their primitive-conversion hooks, including boxed false values. The browser's special `document.all` value retains native falsy behaviour.

`toString(value)` follows `String(value)`. Nullish inputs become their literal descriptive text. This is not JSON serialisation.

<!-- prettier-ignore -->
```js
toBoolean('false');              // => true
toBoolean('0');                  // => true
toBoolean(new Boolean(false));   // => true
toBoolean(0);                    // => false
toString(null);                  // => 'null'
toString(undefined);             // => 'undefined'
toString(Symbol('key'));         // => 'Symbol(key)'
toString([1, 2]);                // => '1,2'
```

String conversion can call object hooks. Primitive symbols have a special descriptive-string path; boxed symbols do not use that path and throw under native String conversion. Objects that cannot produce a primitive also throw.

## Object conversion

`toObject(value)` follows `Object(value)`.

<!-- prettier-ignore -->
```js
const original = {x: 1};
toObject(original) === original;   // => true
toObject(42).valueOf();            // => 42
toObject(null);                    // => {}
toObject(undefined);               // => {}
toObject('{"x":1}').valueOf();     // => '{"x":1}'
```

Existing objects/functions, including arrays, foreign objects and revoked proxies, retain identity. Non-nullish primitives become wrappers. Each nullish conversion creates a new ordinary object. Input conversion hooks are not called. There is no cloning, sanitisation or JSON parsing.

## Date conversion

`toDate(value)` preserves a genuine Date object, including one from another realm, a subclass or an invalid Date. Their overridden conversion methods are not used. Other inputs are passed to `new Date(value)`.

<!-- prettier-ignore -->
```js
const original = new Date(0);
toDate(original) === original;         // => true
toDate(0).toISOString();               // => '1970-01-01T00:00:00.000Z'
isInvalidDate(toDate('not a date'));   // => true
isInvalidDate(toDate(undefined));      // => true
```

Numeric values are millisecond timestamps. Prefer ISO date-time strings with an explicit timezone for portable string input; non-ISO parsing is runtime-dependent. Symbols, bigints and failed coercions can throw. Invalid text and out-of-range timestamps produce invalid Dates. The operation neither supplies the current time for missing input nor guarantees a valid date.

TypeScript returns `Date` conservatively. A structurally Date-compatible input, such as a typed Proxy, may be converted to a new Date without additional input properties. Genuine Date/subclass identity is still preserved at runtime. A skipped `toDateIf(value, false)` preserves the exact input type.

## Symbol conversion

`toSymbol(value)` preserves primitive symbols and intrinsically unboxes genuine Symbol wrappers, including foreign wrappers. Other inputs are descriptions passed to the captured `Symbol` constructor.

<!-- prettier-ignore -->
```js
const key = Symbol('key');
toSymbol(key) === key;                 // => true
toSymbol(Object(key)) === key;         // => true
toSymbol('key').toString();            // => 'Symbol(key)'
toSymbol('key') === toSymbol('key');   // => false
```

Description conversion may run user code and throw. Existing Symbol wrappers bypass overridden conversion hooks. A repeated description creates a fresh symbol; `Symbol.for` is never implicitly used. Existing registry symbols are preserved when passed in. Omitted/undefined input creates a symbol without a description.

## Map and Set conversion

`toMap(value)` and `toSet(value)` use the captured native constructors. Omitted, `null` or `undefined` input creates a fresh empty collection. Existing collections are shallowly copied; object keys and values retain their identity.

<!-- prettier-ignore -->
```js
const entries = [['a', 1], ['b', 2], ['a', 3]];
Array.from(toMap(entries));                  // => [['a', 3], ['b', 2]]
Array.from(toSet([3, 1, 3]));                // => [3, 1]
Array.from(toSet('A😀A'));                   // => ['A', '😀']
toMap().size;                                // => 0
toSet(null).size;                            // => 0

const record = { count: 2 };
toMap(Object.entries(record)).get('count');  // => 2
toMap(record);                               // => throws TypeError
toSet({ 0: 'x', length: 1 });                // => throws TypeError
```

`toMap` consumes synchronous entry objects and reads their `0` and `1` properties. Repeated keys keep their first position and take the last value. Native entry objects need not be two-element arrays: missing indexed properties produce `undefined`, and extra properties are ignored. Primitive entries throw; an empty string produces no entries and therefore an empty Map.

`toSet` consumes synchronous values, preserving first-insertion order and removing duplicates. Both constructors use native SameValueZero equality: repeated `NaN` values or keys collapse, and `-0` and `0` compare equal. Distinct objects remain distinct. Strings yield Unicode code points; a Map passed to `toSet` yields entry arrays.

Unlike `toArray`, neither constructor falls back to an array-like `length`. Neither awaits async iterables or extracts plain-object properties automatically. Iterator calls and property reads may run application code or throw. Iteration consumes one-shot inputs; infinite iterables do not finish. Native iterator-closing behaviour is retained.

<!-- prettier-ignore -->
```js
const input = [['key', 1]];
toMapIf(input, false) === input;             // => true
toMapIf(input, true).get('key');             // => 1
toSetIf('aba', false);                       // => 'aba'
Array.from(toSetIf('aba', true));            // => ['a', 'b']
```

## Conditional conversions

All eleven `If` functions share the same contract:

| Condition                                 | Behaviour                                           |
| ----------------------------------------- | --------------------------------------------------- |
| `true`                                    | Convert using the corresponding base function.      |
| `false`, omitted or `undefined`           | Return the exact original value without inspection. |
| A synchronous predicate returning `true`  | Convert after evaluating the predicate once.        |
| A synchronous predicate returning `false` | Return the exact original value.                    |
| Any other condition or predicate result   | Throw `TypeError`; no truthiness coercion.          |

Predicates receive exactly one argument, the original value, with no explicit `this` receiver. A non-strict JavaScript function may still substitute the global object for `this`.

`ConversionCondition<T>` declares `this: undefined`, so TypeScript rejects callbacks that explicitly require an object receiver. Bind such a method before passing it (for example, `policy.allow.bind(policy)`), or use an arrow that calls the method on its owner. Ordinary arrows and receiver-independent functions remain accepted.

Predicates must be synchronous and return a primitive boolean. The utility rejects Promise results without awaiting them or attaching rejection handlers. Do not pass asynchronous predicates.

<!-- prettier-ignore -->
```js
toNumberIf('42', true);                                // => 42
toNumberIf('42', false);                               // => '42'
toNumberIf('42');                                      // => '42'
toNumberIf('42', value => typeof value === 'string');  // => 42

toBigIntIf('invalid', false);                          // => 'invalid'
toBigIntIf('invalid', true);                           // => throws SyntaxError
```

Predicates and conversions propagate their original exceptions. A predicate may itself mutate its input; a subsequent conversion sees that mutation. No clone or rollback is introduced. If a predicate throws or returns a non-boolean result, conversion is not attempted.

## TypeScript

Return types preserve iterable element types, Map key/value types from entry tuples, and existing object types where possible. `ConvertedMap<T>` and `ConvertedSet<T>` describe the collection results; unknown inputs keep unknown element types. Literal `true` conditions select the converted type; literal `false` conditions select the original type. General boolean conditions and predicates return a union of both possibilities.

<!-- prettier-ignore -->
```ts
const numbers = toArray(new Set([1, 2]));            // number[]
const converted = toNumberIf('42', true);            // number
const original = toNumberIf('42' as const, false);   // '42'
const maybe = toNumberIf('42', Math.random() > 0.5); // string | number
```

`ConvertedObject<T>` checks primitive branches before preserving object types. For example, an input typed as `string & { readonly length: number }` is still boxed to `String`, not returned as a primitive string. Object/function input types remain preserved; skipped `toObjectIf` calls retain the original type. A dynamic condition includes the wrapper in its result type.

A return type describes successful completion, not an absence of exceptions or a guarantee of finite, valid or application-safe content. Conversion conditions are typed as `ConversionCondition<T>`; promises and non-boolean returns are rejected at compile time as well as at runtime.

## Platform references

The chosen native conversion behaviour is defined by the ECMAScript specification:

- [Map](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-iterable) and [Set](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-set-iterable) constructors
- [Array.from](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.from)
- [Number, BigInt, Math.trunc and Date](https://tc39.es/ecma262/multipage/numbers-and-dates.html)
- [Object, Boolean and Symbol](https://tc39.es/ecma262/multipage/fundamental-objects.html)
- [String](https://tc39.es/ecma262/multipage/text-processing.html#sec-string-constructor)

These references describe platform semantics. Tests exercise the specific library contracts, including its Date/Symbol identity preservation and conditional-conversion policy.
