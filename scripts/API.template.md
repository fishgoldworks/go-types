# Go Types API

Full API documentation for [{{NAME}} {{VERSION}}](../CHANGELOG.md). [Back to README](../README.md) · [Runtime support](../README.md#runtime-support).

Conversion behaviour is also summarised in the [conversion guide](conversions.md).

## Contents

{{TOC}}

## API summary

All **{{COUNT}} public functions** are documented below. The summaries link to each function's parameters, return value, examples and behavioural notes.

Examples assume the named functions have been imported from `go-types`, unless an import is shown. DOM examples run in a web browser. `// =>` comments show expected results or exceptions.

Parameter tables describe accepted JavaScript values. `unknown` accepts any JavaScript value; `T` preserves the input type. `?` marks an optional argument; **—** means no explicit default is supplied. See [TypeScript](#typescript) for declaration and narrowing behaviour, and [Errors and side effects](#errors-and-side-effects) for shared error rules.

{{API_SUMMARY}}

{{DOCUMENTATION}}

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

`isEmpty` and `isBlank` inspect sized inputs without consuming unsized iterators. They handle strings, native Maps and Sets, and valid array-like lengths before protocol checks. Unsized iterator or iterable capabilities throw `TypeError`; remaining plain dictionaries use own enumerable string keys.

Use `isEmptyIterable` or `isBlankIterable` when consuming a synchronous iterable is intended. These operations can close an iterator early. Do not reuse a one-shot iterator after inspection; a nullish-only infinite iterable never finishes a blankness check. Native early closing requests cleanup once. It does not drain a generator that yields from `finally`, await asynchronous cleanup, or guarantee resource release when the iterator itself does not complete cleanup.

Blankness is shallow. `[null, undefined]` is blank, but `['']` and `[{}]` are not. Map blankness checks values, whereas iterating a Map yields entry arrays.

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

Invalid or missing matchers throw `TypeError` before the collection is inspected, including empty and wrong-container inputs. Boxed strings, matcher arrays and descriptor objects are not accepted. Valid empty collections pass without calling predicates. Non-boolean results, including promises, throw when the predicate runs; callback exceptions propagate unchanged.

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

Use native `typeof` checks for primitive narrowing. `isNonNullish` also narrows filtered values. Collection-content checks return `boolean`, even when passed a type guard: sparse arrays and native identity cannot be proved by structural TypeScript types.

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
