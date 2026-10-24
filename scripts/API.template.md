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
