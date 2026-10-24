# Conversion utilities

Go Types provides **34 public conversion functions**: seventeen conversions and their seventeen conditional counterparts. All are part of the supported public API.

```javascript
import { toNumber, toArrayIf } from 'go-types';
import toString from 'go-types/toString';

// Equivalent CommonJS and conversion-directory paths:
const toInteger = require('go-types/conversion/toInteger');
const toDate = require('go-types/src/conversion/toDate.js');
```

## Conversion versus validation

Checks classify values; conversions apply the coercion rules described here. A successful conversion can still produce a value unsuitable for your application: a number can be `NaN`, an integer-conversion result can be infinite, and a Date can be invalid. Validate the result when your application needs a narrower range of values.

<!-- prettier-ignore -->
```javascript
import { isNumber, toNumber, isFinite, toDate, isValidDate } from 'go-types';

isNumber('42');                // => false
const number = toNumber('42');
isFinite(number);              // => true

const date = toDate('not a date');
isValidDate(date);             // => false
```

Conversions propagate application errors. Object conversion methods, getters and proxy traps may run and throw. Symbol-wrapper detection catches incompatible-receiver errors from its native probe; errors from the subsequent native conversion still propagate.

## API summary

| Conversion                                    | Conditional counterpart                                     | Result                                                       |
| --------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| [`toArray`](API.md#toarrayvalue)              | [`toArrayIf`](API.md#toarrayifvalue-condition)              | A new shallow ordinary array.                                |
| [`toBigInt`](API.md#tobigintvalue)            | [`toBigIntIf`](API.md#tobigintifvalue-condition)            | A primitive bigint.                                          |
| [`toBoolean`](API.md#tobooleanvalue)          | [`toBooleanIf`](API.md#tobooleanifvalue-condition)          | A primitive boolean, using truthiness.                       |
| [`toDate`](API.md#todatevalue)                | [`toDateIf`](API.md#todateifvalue-condition)                | A `Date`, which may be invalid.                              |
| [`toInteger`](API.md#tointegervalue)          | [`toIntegerIf`](API.md#tointegerifvalue-condition)          | Number conversion truncated towards zero.                    |
| [`toJson`](API.md#tojsonvalue-replacer-space) | [`toJsonIf`](API.md#tojsonifvalue-condition-replacer-space) | Native JSON text, or `undefined`.                            |
| [`fromJson`](API.md#fromjsonvalue-reviver)    | [`fromJsonIf`](API.md#fromjsonifvalue-condition-reviver)    | Parsed or revived value, typed as `unknown`.                 |
| [`toMap`](API.md#tomapvalue)                  | [`toMapIf`](API.md#tomapifvalue-condition)                  | A new shallow Map from a plain object or iterable entries.   |
| [`toNumber`](API.md#tonumbervalue)            | [`toNumberIf`](API.md#tonumberifvalue-condition)            | A primitive number, potentially `NaN` or infinite.           |
| [`toPlainObject`](API.md#toplainobjectvalue)  | [`toPlainObjectIf`](API.md#toplainobjectifvalue-condition)  | A fresh ordinary object from JSON, a record or entry pairs.  |
| [`toSet`](API.md#tosetvalue)                  | [`toSetIf`](API.md#tosetifvalue-condition)                  | A new shallow Set of iterable, record or indexed values.     |
| [`toString`](API.md#tostringvalue)            | [`toStringIf`](API.md#tostringifvalue-condition)            | A primitive string.                                          |
| [`toSymbol`](API.md#tosymbolvalue)            | [`toSymbolIf`](API.md#tosymbolifvalue-condition)            | A primitive symbol.                                          |
| [`box`](API.md#boxvalue)                      | [`boxIf`](API.md#boxifvalue-condition)                      | Native primitive wrapper, or unchanged object/nullish input. |
| [`unbox`](API.md#unboxvalue)                  | [`unboxIf`](API.md#unboxifvalue-condition)                  | Genuine wrapper payload, or unchanged input.                 |
| [`toRegExp`](API.md#toregexpvalue-flags)      | [`toRegExpIf`](API.md#toregexpifvalue-condition-flags)      | Genuine native RegExp.                                       |
| [`toPromise`](API.md#topromisevalue)          | [`toPromiseIf`](API.md#topromiseifvalue-condition)          | Native Promise adopting the input.                           |

See the **[full API documentation](API.md)** for parameters, return values, errors and examples for each function. The additional examples below illustrate the shared rules and important distinctions.

## Array and Set value sources

`toArray(value)` and `toSet(value)` select values in this order after rejecting unsupported categories:

1. A synchronous iterable supplies its yielded values.
2. A plain record supplies its own enumerable string and symbol property values.
3. A supported non-plain array-like object supplies its indexed values.

`toArray` returns a fresh ordinary local array. `toSet` returns a fresh local Set and removes duplicate values using native Set equality. Both are shallow: nested values retain their identities.

<!-- prettier-ignore -->
```javascript
toArray(new Set([1, 2]));          // => [1, 2]
toArray(new Map([['x', 1]]));      // => [['x', 1]]
toArray('A😀B');                   // => ['A', '😀', 'B']
toArray({a: 1, b: 2});             // => [1, 2]
toArray({0: 'x', length: 2});      // => ['x', 2]
toArray(Array(2));                 // => [undefined, undefined]
Array.from(toSet({a: 1, b: 1}));   // => [1]
toArray(42);                       // => throws TypeError
toArray(null);                     // => throws TypeError
toSet(null).size;                  // => 0
```

Plain records include null-prototype and foreign-realm records. A property named `length` is ordinary record data, even if its value is not numeric. The own-key list is snapshotted in property order: string keys followed by symbol keys. Each current descriptor is checked for enumerability and each included value is read once. An enumerable nullish `Symbol.iterator` value is reused from source dispatch so its getter is not read again. Deleted or newly hidden keys are skipped, newly added keys are excluded, and inherited or non-enumerable properties are not copied. Getters and proxy traps can run, mutate input or throw.

Only non-plain array-like objects use the indexed fallback. Their `length` must already be a primitive number, an integer from zero through `Number.MAX_SAFE_INTEGER`, matching `isArrayLike`. String, fractional, negative, infinite and boxed lengths are rejected instead of coerced. Length is read once; values are read live. Missing indices become explicit `undefined`, and inherited indices can supply values.

<!-- prettier-ignore -->
```javascript
class Indexed {
  constructor(length) { this[0] = 'x'; this.length = length; }
}
toArray(new Indexed(2));             // => ['x', undefined]
Array.from(toSet(new Indexed(2)));   // => ['x', undefined]
toArray(new Indexed('2'));           // => throws TypeError
toArray(new Indexed(1.5));           // => throws TypeError
```

On eligible inputs, a synchronous iterator takes precedence over record and indexed data. The iterator method is read once and called with the original input as its receiver. A nullish method permits fallback; any other non-callable method throws. Strings iterate by Unicode code point. Functions, boxed primitives, Dates and RegExps are rejected before iterator or length inspection, even if custom properties suggest a source. Other non-string primitives are also rejected, apart from the nullish Set case.

Omitted, `null` or `undefined` input throws for `toArray` and creates an empty Set for `toSet`. Ordinary promises and native async-only containers without a supported synchronous source are rejected. A plain async-only record is copied as data, including an enumerable async-iterator symbol and its value; its async iterator is not invoked. No input is awaited.

A finite one-shot iterator is consumed. Infinite iterables never finish, and very large inputs can exhaust memory; oversized array results can throw `RangeError`. There is no work limit, hidden buffering or deep cloning. `toArray` retains its native `Array.from` capability requirement; `toSet` requires native `Set` independently of `Array.from`.

Record copying requires `Reflect.ownKeys` or `Object.getOwnPropertySymbols`. If both are absent, it throws rather than silently discarding possible symbol properties. See the [runtime guide](runtime.md#optional-capabilities) for iterator-key capability limits.

## Number and integer conversion

`toNumber(value)` follows `Number(value)`, including native coercion and errors. `toInteger(value)` applies `Math.trunc` to that result.

<!-- prettier-ignore -->
```javascript
toNumber('12.5');                // => 12.5
toNumber('0x10');                // => 16
toNumber(' ');                   // => 0
toNumber(null);                  // => 0
toNumber(undefined);             // => NaN
toNumber('9007199254740993');    // => 9007199254740992
toNumber('1e309');               // => Infinity
toNumber('1e-9999');             // => 0
toInteger('12.9');               // => 12
toInteger('-12.9');              // => -12
toInteger('1e3');                // => 1000
toInteger('12px');               // => NaN
Object.is(toInteger(-0.5), -0);  // => true
```

Integer conversion processes the whole value, unlike `parseInt`, and truncates toward zero, unlike `Math.floor`. `NaN`, infinities and signed zero retain native truncation behaviour. No clamping, locale parsing or safe-integer guarantee is implied. Use `isInteger` or `isSafeInteger` when those constraints matter.

Numeric text and bigints can round to the nearest representable number; large magnitudes can become infinite and tiny magnitudes can underflow to zero. These effects happen before integer truncation. Coercion hooks on objects can run. Primitive/boxed symbols cannot be converted to numbers and throw `TypeError`. Omitting the argument is equivalent to explicitly passing `undefined`, not to calling `Number()` with zero arguments.

## BigInt conversion

`toBigInt(value)` requires native BigInt support (Node.js 10.4 or later). Without it, requested conversion throws `TypeError` before coercing input; `toBigIntIf(value, false)` still returns the input unchanged. The following examples require BigInt support.

On capable hosts, `toBigInt(value)` follows `BigInt(value)`. Integral numbers, booleans and valid integer strings are accepted. Integer strings can contain hexadecimal, binary or octal prefixes. Whitespace-only and empty strings convert to `0n`.

<!-- prettier-ignore -->
```javascript
toBigInt('9007199254740993');  // => 9007199254740993n
toBigInt(true);                // => 1n
toBigInt('0xff');              // => 255n
toBigInt(1.5);                 // => throws RangeError
toBigInt('1.5');               // => throws SyntaxError
toBigInt(null);                // => throws TypeError
```

Fractional or non-finite numbers throw `RangeError`. Invalid text, including decimal fractions and exponent notation, throws `SyntaxError`. `null`, `undefined` and symbols throw `TypeError`. Passing an already-rounded Number cannot restore its original precision; use integer text or bigint inputs for exact large values.

## Boolean and string conversion

`toBoolean(value)` applies JavaScript truthiness; it does not parse text. Objects remain truthy without calling their primitive-conversion hooks, including boxed false values. The browser's special `document.all` value retains native falsy behaviour. Use a separate parser such as `parseBool` from `go-booleans` when text parsing is intended; it is not a dependency or feature of this conversion.

`toString(value)` follows `String(value)`. Nullish inputs become their literal descriptive text. This is not JSON serialisation.

<!-- prettier-ignore -->
```javascript
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

## JSON parsing

`fromJson(value, reviver?)` parses any JSON value through captured native `JSON.parse`. Objects, arrays, strings, numbers, booleans and null are supported. `fromJsonIf(value, condition?, reviver?)` uses the same parsing when requested; skipped calls return the original input without inspecting it or the reviver.

<!-- prettier-ignore -->
```javascript
fromJson('{"a":1}');           // => ({ a: 1 })
fromJson('[1,2]');             // => [1, 2]
fromJson('"hello"');           // => 'hello'
fromJson('42');                // => 42
fromJson('false');             // => false
fromJson('null');              // => null
fromJson('invalid');           // => throws SyntaxError
fromJson();                    // => throws SyntaxError
fromJsonIf('invalid', false);  // => 'invalid'
fromJsonIf('42', true);        // => 42
```

Native coercion applies to non-string input: `fromJson(42)` returns `42` and `fromJson(null)` returns `null`. Undefined input cannot be parsed; symbols throw `TypeError`. Parsing is not schema validation or a precision guarantee. Duplicate names use the last value, and numbers follow native Number precision and range. Nested JSON-looking strings remain strings.

A reviver visits children before their parents and finally the root with key `""`. Its `this` value is the containing object. Returning `undefined` deletes an object property, leaves a hole in an array, or replaces the root with `undefined`. Other values, including promises, are retained without awaiting. Non-callable revivers are ignored by the native parser.

<!-- prettier-ignore -->
```javascript
fromJson('{"a":1,"b":2}', (key, value) => key === 'b' ? undefined : value);  // => ({ a: 1 })
fromJson('42', () => 'replacement');                                         // => 'replacement'
fromJson('42', () => undefined);                                             // => undefined
```

Input coercion and reviver exceptions propagate unchanged. Native parsing treats `__proto__` as an own data property; the library adds no unsafe property copying. Newer runtimes can supply source context to a reviver's third argument; Node 8 does not. Declarations therefore make both the context and `context.source` optional. The parsed or revived result is `unknown`, and callers must validate it before accessing application-specific properties. Use `toPlainObject` when the requested result must specifically be a plain object.

## JSON serialisation

`toJson(value, replacer?, space?)` serialises using the captured native `JSON.stringify` operation. `toJsonIf(value, condition?, replacer?, space?)` applies the same operation when its condition requests conversion. A skipped conversion returns the exact input without inspecting it or either option.

<!-- prettier-ignore -->
```javascript
toJson({ a: 1 });                  // => '{"a":1}'
toJson([1, 2]);                    // => '[1,2]'
toJson('hello');                   // => '"hello"'
toJson(null);                      // => 'null'
toJson(undefined);                 // => undefined
toJson({ a: undefined });          // => '{}'
toJson([undefined]);               // => '[null]'
toJson(NaN);                       // => 'null'
toJson(new Map([['a', 1]]));       // => '{}'
toJson(new Set([1, 2]));           // => '{}'
toJson({ a: 1, b: 2 }, ['a']);     // => '{"a":1}'
toJson({ a: 1 }, null, 2);         // => '{\n  "a": 1\n}'
toJsonIf({ a: 1 }, true, ['a']);   // => '{"a":1}'
toJsonIf({ a: 1 }, false);         // => ({ a: 1 })
```

Strings are encoded as strings even if they already contain JSON text. Without a replacer, top-level `undefined`, functions and symbols produce `undefined`; their object properties are omitted and array positions become `null`. Non-finite numbers become `null`. Ordinary Maps and Sets have no automatic entry/value encoding. Native `toJSON` methods apply, so a valid Date normally produces its ISO string and an invalid Date produces `null`.

A replacer callback receives `(key, value)` and the containing object as `this`, including a root call with the empty key. It runs after `toJSON` and can replace the root, omit properties or handle otherwise unsupported values. A property-name list selects string/number keys at each object level. Indentation follows the native ten-space/ten-code-unit cap; non-whitespace indentation can make the output invalid JSON.

<!-- prettier-ignore -->
```javascript
toJson({ visible: 1, secret: 2 }, (key, value) => key === 'secret' ? undefined : value);
// => '{"visible":1}'
toJson(undefined, () => 42);   // => '42'
```

Cycles and unhandled bigints throw `TypeError`; repeated references without cycles are allowed. Getters, proxy traps, `toJSON` methods and replacers may run, mutate input or throw their original errors. Inputs and callback results are never awaited. Unlike a conversion condition, a replacer returns replacement values and has a native holder receiver; it is not a strict boolean predicate.

The return type is `string | undefined`, even for object input, because hooks and replacers can suppress the root. Replacer values and holder objects are typed as `unknown`; narrow them before property access. Exact escaping follows the host JSON implementation, including differences in older runtimes. This utility is neither canonical JSON nor HTML-safe escaping, and adds no collection encodings, cycle markers or global polyfills.

## Plain-object conversion

`toPlainObject(value)` creates a fresh object with the local `Object.prototype`. It accepts primitive JSON object text, plain objects (including null-prototype and foreign records), Maps and synchronous iterables of entry pairs.

<!-- prettier-ignore -->
```javascript
const original = { x: 1 };
toPlainObject(original);                   // => ({ x: 1 })
toPlainObject(original) === original;      // => false
toPlainObject('{"a":1,"nested":[1,2]}');   // => ({ a: 1, nested: [1, 2] })
toPlainObject(new Map([['a', 1]]));        // => ({ a: 1 })
toPlainObject([['a', 1], ['a', 2]]);       // => ({ a: 2 })
toPlainObject([]);                         // => ({})
toPlainObject(null);                       // => throws TypeError
toPlainObject(42);                         // => throws TypeError
toPlainObject('[1,2]');                    // => throws TypeError
toPlainObject('{"a":1,}');                 // => throws SyntaxError
```

JSON must have a non-null, non-array object at the top level. Malformed text is not repaired; empty or whitespace-only strings throw `SyntaxError`. Nested arrays are allowed. Boxed strings are rejected. JSON values are not schema-validated.

Record copying includes own enumerable string and symbol properties, excludes inherited and non-enumerable properties, and retains nested references. The key list is captured first; each current descriptor is checked and each included value is read once. An enumerable nullish `Symbol.iterator` value is reused from source dispatch so its getter is not read again. Getters may run, mutate the input or throw. The output contains writable, enumerable, configurable data properties, including safe own `__proto__`, `constructor`, `prototype` and `toString` keys. It never invokes inherited setters when creating properties.

A synchronous iterator takes precedence over record copying. Pairs must be actual two-element arrays with both own slots present. Explicit `undefined` values are valid; missing or extra elements are not. Keys must be primitive strings or symbols; numbers and boxed keys are rejected without coercion. Duplicate keys use the last value. Ordinary arrays such as `[10, 20]` and `['a', 'b']` are not entries.

Iteration consumes the input once. Validation and property-access errors in the loop close the outer iterator, running its `return`/`finally` cleanup; the original error wins over a cleanup error. Native `for...of` failures while stepping (`next`, `done`, or `value`) propagate without an additional close attempt. Infinite iterables do not complete. Async generators are unsupported and no input is awaited.

Nullish values (including omitted input), non-string primitives, boxed primitives, functions and non-iterable class instances are rejected. Dates and regular expressions are not converted by extracting fields. Use native `Object(value)` explicitly if boxing is wanted; this change does not add a `box` API.

The function does not depend on native `Object.fromEntries`, `Object.entries`, `Map` or `Set`. Record copying requires `Reflect.ownKeys` or `Object.getOwnPropertySymbols`; if neither exists, it throws instead of dropping possible symbol properties. JSON parsing and array-entry conversion remain usable. The runtime guide records optional-capability limitations.

`toPlainObjectIf(value, true)` uses the same complete conversion. A false, omitted or undefined condition returns the exact original input without inspection; predicate conditions retain the common synchronous strict-boolean rules.

## Date conversion

`toDate(value)` preserves a genuine Date object, including one from another realm, a subclass or an invalid Date. Their overridden conversion methods are not used. Other inputs are passed to `new Date(value)`.

<!-- prettier-ignore -->
```javascript
const original = new Date(0);
toDate(original) === original;         // => true
toDate(0).toISOString();               // => '1970-01-01T00:00:00.000Z'
isInvalidDate(toDate('not a date'));   // => true
isInvalidDate(toDate(undefined));      // => true
```

Numeric values are millisecond timestamps. Prefer ISO date-time strings with an explicit timezone for portable string input. Standard date-only strings use UTC; date-time strings without a timezone use local time. Non-ISO parsing is runtime-dependent. Symbols, bigints and failed coercions can throw. Invalid text and out-of-range timestamps produce invalid Dates. The operation neither supplies the current time for missing input nor guarantees a valid date.

TypeScript returns `Date` conservatively. A structurally Date-compatible input, such as a typed Proxy, may be converted to a new Date without additional input properties. Genuine Date/subclass identity is still preserved at runtime. A skipped `toDateIf(value, false)` preserves the exact input type.

## Symbol conversion

`toSymbol(value)` preserves primitive symbols and intrinsically unboxes genuine Symbol wrappers, including foreign wrappers. Other inputs are descriptions passed to the captured `Symbol` constructor.

<!-- prettier-ignore -->
```javascript
const key = Symbol('key');
toSymbol(key) === key;                 // => true
toSymbol(Object(key)) === key;         // => true
toSymbol('key').toString();            // => 'Symbol(key)'
toSymbol('key') === toSymbol('key');   // => false
```

Description conversion may run user code and throw. Existing Symbol wrappers bypass overridden conversion hooks. A repeated description creates a fresh symbol; `Symbol.for` is never implicitly used. Existing registry symbols are preserved when passed in. Omitted/undefined input creates a symbol without a description.

## Map conversion and collection equality

`toMap(value)` accepts plain records or synchronous iterables of strict entry pairs. Omitted, `null` or `undefined` input creates an empty Map. Results are fresh local Maps with shallowly shared keys and values.

<!-- prettier-ignore -->
```javascript
const entries = [['a', 1], ['b', 2], ['a', 3]];
Array.from(toMap(entries));                      // => [['a', 3], ['b', 2]]
Array.from(toMap({a: 1, b: 2}));                 // => [['a', 1], ['b', 2]]
toMap([[undefined, undefined]]).has(undefined);  // => true
toMap([['a']]);                                  // => throws TypeError
toMap([['a', 1, 2]]);                            // => throws TypeError
toMap([{0: 'a', 1: 1, length: 2}]);              // => throws TypeError
toMap().size;                                    // => 0

const key = Symbol('key');
toMap({[key]: 2}).get(key);                      // => 2
```

Plain records include null-prototype and foreign-realm records. All own enumerable string and symbol properties become entries; numeric property names become string keys and symbol keys stay symbols. Inherited and non-enumerable properties are excluded. Keys are captured once, then each current descriptor is checked and each included value is read once. An enumerable nullish `Symbol.iterator` value is reused from source dispatch so its getter is not read again. Deleted or newly hidden keys are skipped, newly added keys are excluded, and getter/proxy errors propagate. A `length` property is ordinary record data. Missing both `Reflect.ownKeys` and `Object.getOwnPropertySymbols` makes record copying throw instead of dropping symbol keys.

A synchronous iterator takes precedence over record properties on eligible inputs. Its method is read once and called with the original input as receiver. A nullish iterator permits record conversion; any other non-callable method throws. Functions, boxed primitives, Dates and RegExps are rejected before iterator inspection. There is no array-like source fallback. Ordinary promises and native async-only containers without a supported synchronous source are rejected; a plain async-only record is copied, including enumerable symbol properties. No async iterator is invoked and no input is awaited.

Every iterable entry must be an actual array of length exactly two, with both indices `0` and `1` present as own properties. Explicit `undefined` keys and values are valid. Holes, inherited-only indices, extra elements, strings and array-like entry objects are rejected. Keys can have any type without coercion, including objects, numbers and symbols. This differs from `toPlainObject`, whose keys must be primitive strings or symbols. An empty iterable, including an empty string, produces an empty Map; a non-empty string yields invalid primitive entries and throws.

Iteration consumes a finite one-shot input once. Entry validation and property-access errors inside the loop close the outer iterator, running its `return`/`finally` cleanup; the original error wins over a cleanup error. Native `for...of` failures while stepping (`next`, `done` or `value`) propagate without an additional close attempt. Infinite inputs do not finish, and no work limit is imposed.

Maps and Sets use native SameValueZero equality: repeated `NaN` keys or values collapse, and `-0` and `0` compare equal. Distinct objects remain distinct. Map duplicates keep the first insertion position and take the last value. Sets keep the first insertion position of each value. A Map passed to `toSet` yields entry arrays rather than only keys or values.

<!-- prettier-ignore -->
```javascript
Array.from(toSet([3, 1, 3]));      // => [3, 1]
Array.from(toSet('A😀A'));         // => ['A', '😀']
const input = { key: 1 };
toMapIf(input, false) === input;   // => true
toMapIf(input, true).get('key');   // => 1
toSetIf(input, false) === input;   // => true
Array.from(toSetIf(input, true));  // => [1]
```

Record inference includes symbol properties as well as string/number properties. A visibly optional iterator keeps inferred collection contents conservative because it may override record or indexed values. TypeScript cannot prove that a structural object type has a plain prototype or that a property is enumerable.

## Conditional conversions

All `If` functions share the same contract:

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
```javascript
toNumberIf('42', true);                                // => 42
toNumberIf('42', false);                               // => '42'
toNumberIf('42');                                      // => '42'
toNumberIf('42', value => typeof value === 'string');  // => 42

toBigIntIf('invalid', false);                          // => 'invalid'
toBigIntIf('invalid', true);                           // => throws SyntaxError
```

Predicates and conversions propagate their original exceptions. A predicate may itself mutate its input; a subsequent conversion sees that mutation. No clone or rollback is introduced. If a predicate throws or returns a non-boolean result, conversion is not attempted.

## TypeScript

Return types preserve known iterable elements, record values, supported indexed elements and Map key/value types from entry tuples where possible. `ConvertedMap<T>` and `ConvertedSet<T>` describe the collection results; unknown inputs keep unknown element types. Literal `true` conditions select the converted type; literal `false` conditions select the original type. General boolean conditions and predicates return a union of both possibilities.

<!-- prettier-ignore -->
```ts
const recordMap = toMap({ a: 1, b: 2 });            // Map<string, number>
const numbers = toArray(new Set([1, 2]));            // number[]
const converted = toNumberIf('42', true);            // number
const original = toNumberIf('42' as const, false);   // '42'
const maybe = toNumberIf('42', Math.random() > 0.5); // string | number
```

`ConvertedPlainObject<T>` describes a fresh object. JSON properties have `unknown` values. Prototype-name properties and broad string-key records also use `unknown`, because omitted own keys can reveal inherited values. Inferred record and entry keys are optional because TypeScript cannot prove enumerability or that a collection contains a key. Copied properties are writable even if the input is readonly. A visible optional iterator makes the result conservative. Types reject obvious unsupported inputs but cannot prove that an arbitrary structural object is plain or that JSON text is valid. Skipped `toPlainObjectIf` calls preserve the original type; dynamic conditions include both possible results.

A return type describes successful completion, not an absence of exceptions or a guarantee of finite, valid or application-safe content. Conversion conditions are typed as `ConversionCondition<T>`; promises and non-boolean returns are rejected at compile time as well as at runtime.

## Platform references

These ECMAScript references describe the native operations used by the converters. The source selection and strict pair-validation rules above are library contracts:

- [Map](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-iterable) and [Set](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-set-iterable) constructors
- [Array.from](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.from)
- [Number, BigInt, Math.trunc and Date](https://tc39.es/ecma262/multipage/numbers-and-dates.html)
- [Object, Boolean and Symbol](https://tc39.es/ecma262/multipage/fundamental-objects.html)
- [String](https://tc39.es/ecma262/multipage/text-processing.html#sec-string-constructor)

These references describe platform semantics. Tests exercise the specific library contracts, including collection source selection, strict pairs, Date/Symbol identity preservation and conditional conversion.

## Boxing and unboxing

`box(value)` wraps primitives with native `Object(value)` behaviour, except that `null`, `undefined` and omitted input stay unchanged. Existing objects and functions retain identity. `unbox(value)` extracts genuine Boolean, Number, String, Symbol and BigInt wrapper payloads, including foreign wrappers and subclasses. It leaves other input unchanged and never calls custom `valueOf`, `toString` or `Symbol.toPrimitive` hooks.

<!-- prettier-ignore -->
```javascript
box(3).valueOf();              // => 3
box(false).valueOf();          // => false
box(null);                     // => null
box();                         // => undefined
unbox(new Number(3));          // => 3
unbox(new Boolean(false));     // => false
unbox('text');                 // => 'text'
boxIf(3, false);               // => 3
unboxIf(new Number(3), true);  // => 3

const object = { valueOf() { return 3; } };
unbox(object) === object;      // => true
box(object) === object;        // => true
```

This is shallow conversion. Dates, prototype imitations and proxies around wrappers remain unchanged. If a native Symbol/BigInt payload operation is unavailable at import time, its wrapper remains unchanged; primitives can still be boxed through `Object`. `Boxed<T>` describes boxing. `Unboxed<T>` preserves primitive input types; object inputs retain their type plus all possible primitive payloads because structural TypeScript types cannot prove native brands or capability availability.

## Regular expressions

`toRegExp(value, flags?)` uses native pattern and flag rules. It does not escape pattern text or interpret slash-delimited strings as regex literals. With ordinary constructors and omitted flags, local RegExps retain identity and `lastIndex`; foreign RegExps, subclasses and inputs with explicit flags produce new RegExps with `lastIndex` zero. Regex-shaped ordinary objects never receive the native identity shortcut. Getters and native coercion hooks can run. Syntax/flag support depends on the host runtime.

<!-- prettier-ignore -->
```javascript
toRegExp('a.b', 'i').test('AxB');      // => true
toRegExp('/a/i').test('a');            // => false
toRegExp().source;                     // => '(?:)'
toRegExp(null).source;                 // => 'null'
toRegExp('[');                         // => throws SyntaxError
toRegExp('a', 'gg');                   // => throws SyntaxError
toRegExpIf('a', true, 'i').test('A');  // => true
toRegExpIf('[', false);                // => '['
```

## Promises

`toPromise(value)` uses captured native `Promise.resolve`: ordinary local promises retain identity, foreign promises and thenables are adopted, and other values fulfil unchanged. Functions are values, not callbacks to invoke. This is not callback promisification. Thenable getter/method failures reject; native Promise constructor lookup may throw synchronously. Argument evaluation happens before the call.

<!-- prettier-ignore -->
```javascript
const promise = toPromise(3);
await promise;                 // => 3

const thenable = {
  then(resolve) {
    resolve(4);
  }
};
await toPromise(thenable);     // => 4
toPromiseIf(3, false);         // => 3
await toPromiseIf(3, true);    // => 3
```

`toPromiseIf` still requires a synchronous boolean condition or predicate. Skipping returns the input immediately, even when it is not a Promise. TypeScript uses `Promise<Awaited<T>>` for requested conversion. Missing `Promise` or its `resolve` operation causes a descriptive `TypeError` before input inspection; skipped calls remain usable. No polyfill or rejection handler is installed.
