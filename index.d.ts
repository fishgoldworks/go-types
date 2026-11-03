/** Preserve declared Set restrictions; only arrays supply iterable members. */
type EnsuredSet<T> =
  T extends Set<infer Member>
    ? Set<Member>
    : T extends ReadonlyMap<unknown, unknown>
      ? Set<T>
      : T extends ReadonlySet<infer Member>
        ? ReadonlySet<Member>
        : T extends readonly unknown[]
          ? Set<Types.ArrayElement<T>>
          : object extends T
            ? ReadonlySet<unknown>
            : Set<T>;

/** Infer declared array contents without promising custom subtype properties. */
type EnsuredArray<T> = T extends readonly unknown[]
  ? T extends unknown[]
    ? [...T]
    : readonly [...T]
  : object extends T
    ? readonly unknown[]
    : T[];

/** Native JSON replacers receive arbitrary values and holder objects. */
type JsonReplacer = ((this: unknown, key: string, value: unknown) => unknown) | readonly (string | number)[] | null;

/** Native reviver output and holder are arbitrary; source context depends on the host. */
type JsonReviver = (this: unknown, key: string, value: unknown, context?: { source?: string }) => unknown;

/** Use the consumer's native wrapper type when declared, without requiring ES2020 globals. */
type BoxedBigInt = typeof globalThis extends { BigInt: { prototype: infer Boxed } }
  ? Boxed
  : {
      valueOf(): bigint;
      toString(radix?: number): string;
      toLocaleString(): string;
      readonly [Symbol.toStringTag]: 'BigInt';
    };

/** An omitted own key can reveal one of the ordinary object's inherited properties. */
type PlainObjectPrototypeKey =
  keyof Object | '__proto__' | '__defineGetter__' | '__defineSetter__' | '__lookupGetter__' | '__lookupSetter__';
/** Explicit prototype members keep unknown values uncallable on older compilers. */
interface UnknownPlainObject
  extends Record<keyof Object, unknown>, Partial<Record<Exclude<PlainObjectPrototypeKey, keyof Object>, unknown>> {
  [key: string]: unknown;
  [key: symbol]: unknown;
}
type PlainObjectProperties<T> = string extends keyof T
  ? UnknownPlainObject
  : { -readonly [Key in keyof T]?: Key extends PlainObjectPrototypeKey ? unknown : T[Key] };

/** Structural input checks cannot prove plainness or property enumerability. */
type PlainObjectInput<T> = T extends string
  ? never
  : T extends ((...args: never[]) => unknown) | Date | RegExp | Number | Boolean | String | Symbol | BoxedBigInt
    ? never
    : T extends Iterable<unknown>
      ? T extends Iterable<readonly [string | symbol, unknown]>
        ? T
        : never
      : T extends object
        ? T
        : never;

/** Structural checks reject known unsupported inputs; runtime validates source protocols and plainness. */
type CollectionSourceInput<T> = unknown extends T
  ? T
  : T extends string
    ? T
    : T extends ((...args: never[]) => unknown) | Date | RegExp | Number | Boolean | String | Symbol | BoxedBigInt
      ? never
      : T extends object
        ? T
        : never;
type SetInput<T> = T extends null | undefined ? T : CollectionSourceInput<T>;
/** Fixed tuples must have two items. Runtime validates dynamic arrays, unknown entries, and own indices. */
type MapEntryInput<T> = unknown extends T
  ? T
  : T extends readonly unknown[]
    ? number extends T['length']
      ? T
      : T extends readonly [unknown, unknown]
        ? T
        : never
    : never;
type MapInput<T> = unknown extends T
  ? T
  : T extends null | undefined | string
    ? T
    : T extends CollectionSourceInput<T>
      ? T extends Iterable<infer Entry>
        ? [Entry] extends [MapEntryInput<Entry>]
          ? T
          : never
        : T
      : never;
type RecordValues<T> = keyof T extends never ? unknown : T[keyof T];
/** A numeric length may describe a non-plain array-like with missing indexed properties. */
type CollectionRecordValues<T> =
  | RecordValues<T>
  | (T extends { readonly length: infer Length } ? (Extract<Length, number> extends never ? never : undefined) : never);

/** Runtime contracts and migration details: docs/API.md and docs/migration.md. */
declare namespace Types {
  type TypeName = 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function';
  type TypeGuard<T> = (value: unknown) => value is T;
  type TypeMatcher = TypeName | ((this: undefined, value: unknown) => unknown);
  /** Common structural surface; includes number and bigint typed arrays, not DataView.
   * Specific element-type guards are intentionally outside this API. */
  interface TypedArray extends ArrayBufferView {
    readonly length: number;
    readonly BYTES_PER_ELEMENT: number;
    [index: number]: number | bigint;
  }
  /**
   * Checks whether a value is exactly `undefined`.
   *
   * @param value The value to check.
   * @returns `true` if the value is `undefined`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isundefinedvalue
   */
  function isUndefined(value: unknown): value is undefined;
  /**
   * Checks whether a value is exactly `null`.
   *
   * @param value The value to check.
   * @returns `true` if the value is `null`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnullvalue
   */
  function isNull(value: unknown): value is null;
  /**
   * Checks whether a value is a primitive boolean or a boxed `Boolean`.
   *
   * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
   * wrappers. Does not invoke overridden conversion methods.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive boolean or boxed `Boolean`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isbooleanvalue
   */
  function isBoolean(value: unknown): boolean;
  /**
   * Checks whether a value is a primitive number or a boxed `Number`.
   *
   * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
   * wrappers. Does not invoke overridden conversion methods. Includes `NaN` and infinities.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive number or boxed `Number`, including `NaN` and
   * infinities; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnumbervalue
   */
  function isNumber(value: unknown): boolean;
  /**
   * Checks whether a value is a primitive string or a boxed `String`.
   *
   * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
   * wrappers. Does not invoke overridden conversion methods.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive string or boxed `String`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isstringvalue
   */
  function isString(value: unknown): boolean;
  /**
   * Checks whether a value is a primitive symbol.
   *
   * Boxed symbols return `false`.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive symbol; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#issymbolvalue
   */
  function isSymbol(value: unknown): value is symbol;
  /**
   * Checks whether a value is a primitive bigint.
   *
   * Boxed bigints return `false`; numeric strings are not converted.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive bigint; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isbigintvalue
   */
  function isBigInt(value: unknown): value is bigint;
  /**
   * Checks whether a value is a primitive rather than an object or function.
   *
   * Includes `null` and `undefined`; rejects wrappers and functions.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive, including `null` or `undefined`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isprimitivevalue
   */
  function isPrimitive(value: unknown): value is undefined | null | boolean | number | string | symbol | bigint;
  /**
   * Checks whether a value is `null` or `undefined`.
   *
   * @param value The value to check.
   * @returns `true` if the value is `null` or `undefined`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnullishvalue
   */
  function isNullish(value: unknown): value is null | undefined;
  /**
   * Checks whether a value is nullish, an empty string, or an empty supported collection.
   *
   * Check the expected type before using negation to require contents. Uses lengths, collection
   * sizes or dictionary keys. Unsized iterators and iterables throw `TypeError`; getters and proxy
   * traps may run. Unavailable native collection types do not prevent loading or checks of other
   * supported values. If a detected collection lacks the required native size or iteration
   * operation, the check throws `TypeError`.
   *
   * @param value The value to check.
   * @returns `true` if the value is nullish, an empty string, or an empty supported collection;
   * otherwise `false`.
   * @throws `TypeError` for unsized iterators or iterables. Property getters and proxy traps may
   * throw. See Empty and blank values.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isemptyvalue
   */
  function isEmpty(value: unknown): boolean;
  /**
   * Checks whether a value is nullish, an empty or whitespace-only string, or a supported collection
   * containing only nullish values.
   *
   * Check for a string before using negation to require text. Shallow and non-consuming. Map checks
   * inspect values. Unsized iterators and iterables throw `TypeError`; getters and proxy traps may
   * run. Unavailable native collection types do not prevent loading or checks of other supported
   * values. If a detected collection lacks the required native size or iteration operation, the
   * check throws `TypeError`.
   *
   * @param value The value to check.
   * @returns `true` if the value is nullish, an empty or whitespace-only string, or a supported
   * collection containing only nullish values; otherwise `false`.
   * @throws `TypeError` for unsized iterators or iterables. Property getters and proxy traps may
   * throw. See Empty and blank values.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isblankvalue
   */
  function isBlank(value: unknown): boolean;
  /**
   * Checks whether JavaScript treats a value as `true` in a condition.
   *
   * @param value The value to check.
   * @returns `true` if the value is truthy under JavaScript boolean coercion; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#istruthyvalue
   */
  function isTruthy(value: unknown): boolean;
  /**
   * Checks whether JavaScript treats a value as `false` in a condition.
   *
   * @param value The value to check.
   * @returns `true` if the value is falsy under JavaScript boolean coercion; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isfalsyvalue
   */
  function isFalsy(value: unknown): boolean;
  /**
   * Checks whether a primitive or boxed number is an integer.
   *
   * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive or boxed finite integral number; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isintegervalue
   */
  function isInteger(value: unknown): boolean;
  /**
   * Checks whether a primitive or boxed number is an integer in JavaScript’s safe-integer range.
   *
   * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive or boxed integer within the safe-integer range;
   * otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#issafeintegervalue
   */
  function isSafeInteger(value: unknown): boolean;
  /**
   * Checks whether a primitive or boxed number is a finite number with a fractional part.
   *
   * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive or boxed finite non-integer number; otherwise
   * `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isfloatvalue
   */
  function isFloat(value: unknown): boolean;
  /**
   * Checks whether a primitive or boxed number is a finite number.
   *
   * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive or boxed finite number; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isfinitevalue
   */
  function isFinite(value: unknown): boolean;
  /**
   * Checks whether a primitive or boxed number is positive or negative infinity.
   *
   * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is primitive or boxed positive or negative infinity; otherwise
   * `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isinfinitevalue
   */
  function isInfinite(value: unknown): boolean;
  /**
   * Checks whether a primitive or boxed number is `NaN`.
   *
   * Accepts `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is primitive or boxed `NaN`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnanvalue
   */
  function isNaN(value: unknown): boolean;
  /**
   * Checks whether a value is a finite number, a bigint, or non-blank numeric text.
   *
   * Accepts numeric text as well as finite numbers and primitive bigints. Rejects booleans, blank
   * text, `NaN`, infinities and boxed bigints.
   *
   * @param value The value to check.
   * @returns `true` if the value is a finite primitive or boxed number, a primitive bigint, or
   * non-blank string text converting to a finite number; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnumericvalue
   */
  function isNumeric(value: unknown): boolean;
  /**
   * Checks whether a value is a non-null object or function.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-null object or function; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isobjectvalue
   */
  function isObject(value: unknown): boolean;
  /**
   * Checks whether a value has a null or ordinary `Object` prototype.
   *
   * Checks the current prototype, not allocation history or a schema. Proxy traps may run; an own
   * `constructor` field is not read.
   *
   * @param value The value to check.
   * @returns `true` if the value has a null or ordinary `Object` prototype; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isplainobjectvalue
   */
  function isPlainObject(value: unknown): boolean;
  /**
   * Checks whether a value contains a circular reference through enumerable string-keyed properties,
   * Map keys and values, or Set members.
   *
   * Includes inherited enumerable string properties and Map and Set contents. Symbols,
   * non-enumerable properties and WeakMap/WeakSet entries are excluded. Getters and proxy traps may
   * run and throw; keep the graph stable. Missing native detection limits inspection to ordinary
   * properties; a recognised collection without native traversal support throws `TypeError`.
   *
   * @param value The value to check.
   * @returns `true` if following the supported references leads back to an object already on the
   * current path; otherwise `false`.
   * @throws Property getters and proxy traps may throw; their errors propagate. Requested Map/Set
   * content inspection throws `TypeError` when native traversal support is unavailable.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#iscircularvalue
   */
  function isCircular(value: unknown): boolean;
  /**
   * Checks whether a value exposes a synchronous iterator method.
   *
   * Reads `Symbol.iterator` without calling it. Getters and proxy traps may run; method presence
   * does not guarantee a valid iterator.
   *
   * @param value The value to check.
   * @returns `true` if the value has a callable `Symbol.iterator` method; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isiterablevalue
   */
  function isIterable(value: unknown): boolean;
  /**
   * Checks whether a value is an array, including from another realm.
   *
   * Preserves native `Array.isArray` behaviour, including `TypeError` for a revoked proxy.
   *
   * @param value The value to check.
   * @returns `true` if the value passes native `Array.isArray`; otherwise `false`.
   * @throws `TypeError` for a revoked proxy, following native `Array.isArray` behaviour.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isarrayvalue
   */
  function isArray(value: unknown): boolean;
  /**
   * Checks whether a value is an array whose items match a type-name string or predicate.
   *
   * Matchers are required and validated before inspecting the collection. Predicates receive one
   * value with no supplied receiver and have their results evaluated using JavaScript truthiness.
   * Empty collections pass without calling predicates. Returned promises are truthy and are not
   * awaited. The check itself returns a primitive boolean.
   *
   * @param value The value to check.
   * @param matcher A required native `typeof` name or synchronous predicate for collection items.
   * @returns `true` if the value is an array and every element matches the matcher, including an
   * empty array; otherwise `false`.
   * @throws `TypeError` for invalid or missing matchers. Callback, property-access and native
   * iteration errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isarrayofvalue-matcher
   */
  function isArrayOf(value: unknown, matcher: TypeMatcher): boolean;
  /**
   * Checks whether a non-function value has a valid numeric length.
   *
   * Reads `length` once. Missing indices are allowed; boxed, negative, fractional or non-finite
   * lengths are rejected.
   *
   * @param value The value to check.
   * @returns `true` if the value is not a function and has a numeric integer length from `0` through
   * `Number.MAX_SAFE_INTEGER`; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isarraylikevalue
   */
  function isArrayLike(value: unknown): boolean;
  /**
   * Checks whether an array-like value contains only items matching a type-name string or predicate.
   *
   * Matchers are required and validated before inspecting the collection. Predicates receive one
   * value with no supplied receiver and have their results evaluated using JavaScript truthiness.
   * Empty collections pass without calling predicates. Returned promises are truthy and are not
   * awaited. The check itself returns a primitive boolean.
   *
   * @param value The value to check.
   * @param matcher A required native `typeof` name or synchronous predicate for collection items.
   * @returns `true` if the value is array-like and every indexed value matches the matcher,
   * including an empty input; otherwise `false`.
   * @throws `TypeError` for invalid or missing matchers. Callback, property-access and native
   * iteration errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isarraylikeofvalue-matcher
   */
  function isArrayLikeOf(value: unknown, matcher: TypeMatcher): boolean;
  /**
   * Checks whether a value is an array of length two.
   *
   * @param value The value to check.
   * @returns `true` if the value is an array of length `2`; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate. Native
   * `Array.isArray` also throws `TypeError` for a revoked proxy.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ispairvalue
   */
  function isPair(value: unknown): boolean;
  /**
   * Checks whether a value is a `Map`.
   *
   * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
   * imitations. Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `Map`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ismapvalue
   */
  function isMap(value: unknown): boolean;
  /**
   * Checks whether a value is a `Set`.
   *
   * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
   * imitations. Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `Set`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#issetvalue
   */
  function isSet(value: unknown): boolean;
  /**
   * Checks whether a value is a `WeakMap`.
   *
   * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
   * imitations. Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `WeakMap`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isweakmapvalue
   */
  function isWeakMap(value: unknown): boolean;
  /**
   * Checks whether a value is a `WeakSet`.
   *
   * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
   * imitations. Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `WeakSet`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isweaksetvalue
   */
  function isWeakSet(value: unknown): boolean;
  /**
   * Checks whether JavaScript reports a value as a function.
   *
   * Includes classes and callable proxies; does not guarantee a successful call.
   *
   * @param value The value to check.
   * @returns `true` if `typeof value` is `"function"`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isfunctionvalue
   */
  function isFunction(value: unknown): boolean;
  /**
   * Checks whether a value is a `Date`, valid or invalid.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `Date`, valid or invalid; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isdatevalue
   */
  function isDate(value: unknown): boolean;
  /**
   * Checks whether a value is a `Date` with a finite timestamp.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `Date` with a finite timestamp; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isvaliddatevalue
   */
  function isValidDate(value: unknown): boolean;
  /**
   * Checks whether a value is a `Date` with a `NaN` timestamp.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `Date` with a `NaN` timestamp; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isinvaliddatevalue
   */
  function isInvalidDate(value: unknown): boolean;
  /**
   * Checks whether a value is a `RegExp` object.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `RegExp` object; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isregexpvalue
   */
  function isRegExp(value: unknown): boolean;
  /**
   * Checks whether a value passes the local native `Promise` instance check.
   *
   * Uses local `instanceof` semantics; it is not proof of native Promise identity. Does not call
   * `then`.
   *
   * @param value The value to check.
   * @returns `true` if the value passes the local native `Promise` instance check; otherwise
   * `false`.
   * @throws Native `instanceof` errors propagate, including errors from proxy prototype access or a
   * custom `Symbol.hasInstance` method.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ispromisevalue
   */
  function isPromise(value: unknown): boolean;
  /**
   * Checks whether a value is an object or function with a callable `then` method.
   *
   * Reads `then` without invoking it or checking `catch` or `finally`. Does not verify promise
   * behaviour; getters and proxy traps may run.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-null object or function with a callable `then` method;
   * otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ispromiselikevalue
   */
  function isPromiseLike(value: unknown): boolean;
  /**
   * Checks whether a value is recognised as an error by the available native check or fallback.
   *
   * The fallback rejects custom tags without reading their getters. Without native branding or a
   * usable tag key, returns `false`. Proxy traps may run; this is not a security check.
   *
   * @param value The value to check.
   * @returns `true` if the captured native error check, or its conservative fallback, recognises the
   * value as an error; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#iserrorvalue
   */
  function isError(value: unknown): boolean;
  /**
   * Checks whether a value is an instance of the local DOM `Node` constructor.
   *
   * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
   * DOM objects.
   *
   * @param value The value to check.
   * @returns `true` if a local `Node` constructor is available and the value passes its instance
   * check; otherwise `false`.
   * @throws Native `instanceof` errors propagate, including errors from proxy prototype access or a
   * custom `Symbol.hasInstance` method.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnodevalue
   */
  function isNode(value: unknown): boolean;
  /**
   * Checks whether a value is an instance of the local DOM `Element` constructor.
   *
   * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
   * DOM objects.
   *
   * @param value The value to check.
   * @returns `true` if a local `Element` constructor is available and the value passes its instance
   * check; otherwise `false`.
   * @throws Native `instanceof` errors propagate, including errors from proxy prototype access or a
   * custom `Symbol.hasInstance` method.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#iselementvalue
   */
  function isElement(value: unknown): boolean;
  /**
   * Checks whether a value is an instance of the local DOM `DocumentFragment` constructor.
   *
   * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
   * DOM objects.
   *
   * @param value The value to check.
   * @returns `true` if a local `DocumentFragment` constructor is available and the value passes its
   * instance check; otherwise `false`.
   * @throws Native `instanceof` errors propagate, including errors from proxy prototype access or a
   * custom `Symbol.hasInstance` method.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isdocumentfragmentvalue
   */
  function isDocumentFragment(value: unknown): boolean;
  /**
   * Checks whether a value is a `ArrayBuffer`.
   *
   * Checks identity rather than memory usability; supports foreign instances and rejects proxies.
   * Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `ArrayBuffer`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isarraybuffervalue
   */
  function isArrayBuffer(value: unknown): boolean;
  /**
   * Checks whether a value is a `SharedArrayBuffer`.
   *
   * Supports foreign instances and rejects proxies or prototype imitations. Returns `false` when
   * native shared buffers are unavailable. Returns `false` when the local native detection
   * capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if native shared buffers are available and the value is a `SharedArrayBuffer`;
   * otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#issharedarraybuffervalue
   */
  function isSharedArrayBuffer(value: unknown): boolean;
  /**
   * Checks whether a value is a native typed array or `DataView`.
   *
   * Detached views retain their identity; passing does not guarantee usable memory. Falls back to
   * native DataView and typed-array identity checks when `ArrayBuffer.isView` is unavailable;
   * returns `false` if none of those checks is available.
   *
   * @param value The value to check.
   * @returns `true` if the value is a native typed array or `DataView`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isarraybufferviewvalue
   */
  function isArrayBufferView(value: unknown): boolean;
  /**
   * Checks whether a value is a native typed array, including a Node.js `Buffer`.
   *
   * Excludes `DataView` and ordinary arrays; detached views still pass. Does not identify a
   * particular element type. Uses captured native tag or length getters; returns `false` if no
   * usable native detection getter is available. Missing `Symbol`, `Reflect` or `ArrayBuffer.isView`
   * does not prevent loading.
   *
   * @param value The value to check.
   * @returns `true` if the value is a native typed array, including a Node.js `Buffer`; otherwise
   * `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#istypedarrayvalue
   */
  function isTypedArray(value: unknown): boolean;
  /**
   * Checks whether a value is a `DataView`.
   *
   * Checks identity rather than memory usability; supports foreign instances and rejects proxies.
   * Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `DataView`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isdataviewvalue
   */
  function isDataView(value: unknown): boolean;
  /**
   * Checks whether a value exposes an asynchronous iterator method.
   *
   * Does not invoke the method. Returns `false` without inspecting the value when
   * `Symbol.asyncIterator` is unavailable. Returns `false` without inspecting the input when
   * `Symbol` itself or `Symbol.asyncIterator` is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the async-iterator symbol is available and the value has a callable
   * `Symbol.asyncIterator` method; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isasynciterablevalue
   */
  function isAsyncIterable(value: unknown): boolean;
  /**
   * Checks whether a value is an object or function with a callable `next` method.
   *
   * Does not invoke `next` or validate iterator results. Property getters and proxy traps may run.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-null object or function with a callable `next` method;
   * otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isiteratorlikevalue
   */
  function isIteratorLike(value: unknown): boolean;
  /**
   * Checks whether a value is neither `null` nor `undefined`.
   *
   * @param value The value to check.
   * @returns `true` if the value is neither `null` nor `undefined`; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isnotnullishvalue
   */
  function isNotNullish<T>(value: T): value is NonNullable<T>;
  /**
   * Checks whether primitive or boxed string text is valid JSON.
   *
   * Accepts text representing JSON objects, arrays or scalar values. Does not validate a schema or
   * arbitrary-object serialisability.
   *
   * @param value The value to check.
   * @returns `true` if the value is primitive or boxed string text that parses as JSON; otherwise
   * `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#isjsonvalue
   */
  function isJson(value: unknown): boolean;
  /**
   * Checks whether a value is a native Set whose items match a type-name string or predicate.
   *
   * Matchers are required and validated before inspecting the collection. Predicates receive one
   * value with no supplied receiver and have their results evaluated using JavaScript truthiness.
   * Empty collections pass without calling predicates. Unavailable native constructors return
   * `false`; a detected collection without the required native iteration operation throws
   * `TypeError`. Returned promises are truthy and are not awaited. The check itself returns a
   * primitive boolean.
   *
   * @param value The value to check.
   * @param matcher A required native `typeof` name or synchronous predicate for collection items.
   * @returns `true` if the value is a `Set` whose items all match the matcher, including an empty
   * `Set`; otherwise `false`.
   * @throws `TypeError` for invalid or missing matchers. Callback, property-access and native
   * iteration errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#issetofvalue-matcher
   */
  function isSetOf(value: unknown, matcher: TypeMatcher): boolean;
  /**
   * Checks whether a value is a native Map whose keys and values match their type-name strings or
   * predicates.
   *
   * Matchers are required and validated before inspecting the collection. Predicates receive one
   * value with no supplied receiver and have their results evaluated using JavaScript truthiness.
   * Empty collections pass without calling predicates. Unavailable native constructors return
   * `false`; a detected collection without the required native iteration operation throws
   * `TypeError`. Returned promises are truthy and are not awaited. The check itself returns a
   * primitive boolean.
   *
   * @param value The value to check.
   * @param keyMatcher A required native `typeof` name or synchronous predicate for Map keys.
   * @param valueMatcher A required native `typeof` name or synchronous predicate for Map values.
   * @returns `true` if the value is a `Map` whose keys and values match their respective matchers,
   * including an empty `Map`; otherwise `false`.
   * @throws `TypeError` for invalid or missing matchers. Callback, property-access and native
   * iteration errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ismapofvalue-keymatcher-valuematcher
   */
  function isMapOf(value: unknown, keyMatcher: TypeMatcher, valueMatcher: TypeMatcher): boolean;
  /** Iteration takes precedence. Otherwise include all declared record values, including symbols and length.
   * Numeric-length shapes can also be non-plain array-likes with holes. Optional iterators remain unknown.
   */
  type ArrayElement<T> =
    T extends Iterable<infer Item>
      ? Item
      : T extends object
        ? typeof Symbol.iterator extends keyof T
          ? T[typeof Symbol.iterator] extends null | undefined
            ? CollectionRecordValues<T>
            : unknown
          : CollectionRecordValues<T>
        : unknown;
  /** Iterables supply entries; records preserve symbol keys and stringify numeric keys.
   * Types cannot prove plainness, property enumerability, or the absence of a possible iterator.
   */
  type ConvertedMap<T> =
    T extends Iterable<readonly [infer Key, infer Value]>
      ? Map<Key, Value>
      : T extends Iterable<unknown>
        ? Map<unknown, unknown>
        : T extends object
          ? (
              typeof Symbol.iterator extends keyof T
                ? T[typeof Symbol.iterator] extends null | undefined
                  ? true
                  : false
                : true
            ) extends true
            ? Map<string | Extract<keyof T, symbol>, RecordValues<T>>
            : Map<unknown, unknown>
          : Map<unknown, unknown>;
  /** Sets use the same source-value inference as arrays. Nullish sources produce empty sets. */
  type ConvertedSet<T> = Set<ArrayElement<T>>;
  /** Fresh plain-object results: inferred properties are optional because copying can omit them. */
  type ConvertedPlainObject<T> = T extends string
    ? never
    : T extends Iterable<readonly [infer Key, infer Value]>
      ? PlainObjectProperties<Record<Extract<Key, string | symbol>, Value>>
      : T extends object
        ? typeof Symbol.iterator extends keyof T
          ? T[typeof Symbol.iterator] extends null | undefined
            ? PlainObjectProperties<T>
            : UnknownPlainObject
          : PlainObjectProperties<T>
        : never;

  /**
   * Converts a synchronous iterable, plain object or supported array-like input to a new shallow
   * array.
   *
   * Consumes iterable input, copies values from own enumerable string and symbol properties, or
   * reads supported array-like indices. Array-like lengths must already be numeric safe integers at
   * least zero. Nullish and unsupported inputs throw. Requires native `Array.from`; missing support
   * throws `TypeError` before inspecting the input.
   *
   * @param value The value to convert.
   * @returns A new shallow array containing iterable items, plain object property values or indexed
   * array-like values.
   * @throws TypeError for nullish or unsupported input, malformed iterators or invalid array-like
   * lengths. Oversized array results can throw RangeError. Getter, proxy and iterator errors
   * propagate. Missing native Array.from throws before conversion; object copying requires
   * symbol-enumeration support.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#toarrayvalue
   */
  function toArray<T>(value: T & CollectionSourceInput<T>): ArrayElement<T>[];
  /**
   * Converts a value to a primitive bigint using native conversion.
   *
   * Requires native BigInt. Fractional numbers and invalid integer text throw; input conversion
   * hooks may run.
   *
   * @param value The value to convert.
   * @returns The converted primitive bigint.
   * @throws `RangeError` for fractional or non-finite numbers; `SyntaxError` for invalid integer
   * text; `TypeError` for nullish values, symbols, or unavailable native BigInt support.
   * Object-coercion errors propagate.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tobigintvalue
   */
  function toBigInt(value?: unknown): bigint;
  /**
   * Converts a value to a boolean using JavaScript truthiness.
   *
   * Uses truthiness rather than parsing boolean text. Does not invoke object conversion hooks.
   *
   * @param value The value to convert.
   * @returns `true` if the input is truthy under JavaScript boolean coercion; otherwise `false`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tobooleanvalue
   */
  function toBoolean(value?: unknown): boolean;
  /**
   * Converts a value to a `Date`, returning existing `Date` objects unchanged. The result can be
   * invalid.
   *
   * Preserves existing Date objects. May return an invalid Date; omitted input does not mean the
   * current time. Symbols, bigints and conversion hooks can throw.
   *
   * @param value The value to convert.
   * @returns The original `Date`, or a new `Date` constructed from the input; it may be invalid.
   * @throws Symbols, bigints and failed object coercion can throw. Invalid date text can instead
   * produce an invalid `Date`; check with `isValidDate`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#todatevalue
   */
  function toDate(value?: unknown): Date;
  /**
   * Converts a value to a number and truncates it towards zero.
   *
   * Does not guarantee a finite or safe integer. Symbols and failing conversion hooks can throw.
   *
   * @param value The value to convert.
   * @returns The numeric conversion truncated towards zero; it may be `NaN` or infinite.
   * @throws Symbols and failed object conversions can throw. `NaN` and infinity are returned rather
   * than rejected.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tointegervalue
   */
  function toInteger(value?: unknown): number;
  /**
   * Serialises a value to JSON text using native `JSON.stringify` behaviour.
   *
   * May return `undefined`. Does not transform Maps, Sets or bigints automatically. Cycles and
   * unhandled bigints throw; getters, `toJSON` methods and replacer callbacks can run.
   *
   * @param value The value to convert.
   * @param replacer A native JSON replacer callback or property-name list. Callbacks receive the
   * containing object as `this`; omitted or `null` uses ordinary serialisation.
   * @param space Native JSON indentation, capped at ten spaces or ten string code units.
   * @returns JSON text, or `undefined` when native serialisation produces no text, including omitted
   * input without a replacer.
   * @throws Cycles and unhandled bigints throw `TypeError`. Getter, proxy, `toJSON` and replacer
   * exceptions propagate unchanged.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tojsonvalue-replacer-space
   */
  function toJson(value?: unknown, replacer?: JsonReplacer, space?: string | number): string | undefined;
  /**
   * Converts a value to a primitive number using JavaScript’s `Number` conversion.
   *
   * May return `NaN` or infinity, lose bigint precision, round numeric text, underflow to zero, or
   * invoke object conversion hooks. Symbols throw.
   *
   * @param value The value to convert.
   * @returns The converted primitive number; it may be `NaN` or infinite.
   * @throws Symbols throw `TypeError`. Object-coercion errors propagate; invalid numeric text
   * returns `NaN`.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tonumbervalue
   */
  function toNumber(value?: unknown): number;
  /**
   * Creates a plain object from key/value pairs, or makes a shallow copy of an existing plain
   * object.
   *
   * Returns a fresh ordinary object. Copies own enumerable string and symbol properties, preserving
   * nested references. Entry pairs must be two-element arrays with string or symbol keys. Strings
   * and nullish input throw.
   *
   * @param value The value to convert.
   * @returns A fresh ordinary object containing the copied enumerable properties or supplied
   * entries.
   * @throws Unsupported inputs, malformed entry pairs and unsupported keys throw TypeError. Getter,
   * proxy and iterator errors propagate without replacement.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#toplainobjectvalue
   */
  function toPlainObject<Key extends string | symbol, Value>(
    value: Iterable<readonly [Key, Value]>
  ): PlainObjectProperties<Record<Key, Value>>;
  /**
   * Creates a plain object from key/value pairs, or makes a shallow copy of an existing plain
   * object.
   *
   * Returns a fresh ordinary object. Copies own enumerable string and symbol properties, preserving
   * nested references. Entry pairs must be two-element arrays with string or symbol keys. Strings
   * and nullish input throw.
   *
   * @param value The value to convert.
   * @returns A fresh ordinary object containing the copied enumerable properties or supplied
   * entries.
   * @throws Unsupported inputs, malformed entry pairs and unsupported keys throw TypeError. Getter,
   * proxy and iterator errors propagate without replacement.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#toplainobjectvalue
   */
  function toPlainObject<T>(value: T & PlainObjectInput<T>): ConvertedPlainObject<T>;

  /**
   * Converts a value to a primitive string using JavaScript’s `String` conversion.
   *
   * May invoke conversion hooks and throw, including for boxed symbols. Does not perform JSON
   * serialisation.
   *
   * @param value The value to convert.
   * @returns The converted primitive string; nullish inputs become their literal text.
   * @throws Native conversion errors propagate, including boxed symbols and objects that cannot
   * produce a primitive.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tostringvalue
   */
  function toString(value?: unknown): string;
  /**
   * Converts a value to a primitive symbol, preserving existing symbols and unboxing `Symbol`
   * wrappers.
   *
   * Preserves primitive symbol identity and unboxes wrappers. Other inputs create a new symbol and
   * may invoke description-conversion hooks. Requires native `Symbol`; missing support does not
   * prevent loading. Requested conversion throws `TypeError` before inspecting the input when it is
   * unavailable.
   *
   * @param value The value to convert.
   * @returns The original or unboxed symbol, or a new symbol created from the description.
   * @throws Native description-conversion errors propagate. Unavailable native `Symbol` support
   * throws `TypeError` before conversion.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tosymbolvalue
   */
  function toSymbol(value?: unknown): symbol;
  /**
   * Converts a plain object or iterable of key/value pairs to a new Map.
   *
   * Plain object entries come from own enumerable properties with string or symbol keys. Iterable
   * pairs must be exact two-element arrays with both own indices present. Duplicate keys keep their
   * first position and take the last value. Nullish input creates an empty Map. Requires native
   * `Map`; missing support throws before inspecting the input.
   *
   * @param value The value to convert.
   * @returns A new Map containing a plain object's own enumerable properties as entries, or the
   * supplied key/value pairs. Omitted or nullish input produces an empty Map.
   * @throws TypeError for unsupported input, malformed iterators or entry pairs that are not exact
   * two-element arrays with both own indices. Getter, proxy and iterator errors propagate. Entry
   * validation errors close the outer iterator. Missing native Map throws before conversion; object
   * copying requires symbol-enumeration support.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tomapvalue
   */
  function toMap<Key, Value>(value: readonly (readonly [Key, Value])[]): Map<Key, Value>;
  /**
   * Converts a plain object or iterable of key/value pairs to a new Map.
   *
   * Plain object entries come from own enumerable properties with string or symbol keys. Iterable
   * pairs must be exact two-element arrays with both own indices present. Duplicate keys keep their
   * first position and take the last value. Nullish input creates an empty Map. Requires native
   * `Map`; missing support throws before inspecting the input.
   *
   * @param value The value to convert.
   * @returns A new Map containing a plain object's own enumerable properties as entries, or the
   * supplied key/value pairs. Omitted or nullish input produces an empty Map.
   * @throws TypeError for unsupported input, malformed iterators or entry pairs that are not exact
   * two-element arrays with both own indices. Getter, proxy and iterator errors propagate. Entry
   * validation errors close the outer iterator. Missing native Map throws before conversion; object
   * copying requires symbol-enumeration support.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tomapvalue
   */
  function toMap<T = unknown>(value?: T & MapInput<T>): ConvertedMap<T>;
  /**
   * Converts a synchronous iterable, plain object or supported array-like input to a new shallow
   * Set.
   *
   * Copies iterable values, values from own enumerable string and symbol properties, or supported
   * array-like indices. Lengths must be numeric safe integers at least zero. Nullish input creates
   * an empty Set; unsupported inputs throw. Requires native `Set`, independently of `Array.from`;
   * missing support throws before inspecting the input.
   *
   * @param value The value to convert.
   * @returns A new Set of iterable items, plain object property values or indexed array-like values,
   * or an empty Set for omitted or nullish input.
   * @throws TypeError for unsupported input, malformed iterators or invalid array-like lengths.
   * Getter, proxy and iterator errors propagate. Missing native Set throws before conversion; object
   * copying requires symbol-enumeration support.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#tosetvalue
   */
  function toSet<T = unknown>(value?: T & SetInput<T>): ConvertedSet<T>;
  /** Primitive wrapper result; objects and nullish values retain identity. */
  type Boxed<T> = unknown extends T
    ? object | null | undefined
    : T extends null | undefined
      ? T
      : T extends string
        ? String
        : T extends number
          ? Number
          : T extends boolean
            ? Boolean
            : T extends symbol
              ? Symbol
              : T extends bigint
                ? BoxedBigInt
                : T extends object
                  ? T
                  : object;
  /** Structural object types cannot prove wrapper brands or available unboxing intrinsics. */
  type Unboxed<T> = T extends string | number | boolean | symbol | bigint | null | undefined
    ? T
    : T extends object
      ? T | string | number | boolean | symbol | bigint
      : T;

  /**
   * Wraps non-nullish primitives in their native wrapper objects, preserving objects and nullish
   * values.
   *
   * Does not call conversion hooks. Existing objects and functions, `null` and `undefined` are
   * returned unchanged.
   *
   * @param value The value to convert.
   * @returns A native wrapper for a non-nullish primitive; otherwise the original object, function
   * or nullish input.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#boxvalue
   */
  function box(): undefined;
  /**
   * Wraps non-nullish primitives in their native wrapper objects, preserving objects and nullish
   * values.
   *
   * Does not call conversion hooks. Existing objects and functions, `null` and `undefined` are
   * returned unchanged.
   *
   * @param value The value to convert.
   * @returns A native wrapper for a non-nullish primitive; otherwise the original object, function
   * or nullish input.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#boxvalue
   */
  function box<T>(value: T): Boxed<T>;
  /**
   * Extracts the primitive value from a wrapper object, leaving other values unchanged.
   *
   * Uses captured native `valueOf` intrinsics without calling custom conversion hooks. Missing
   * `Symbol` or `BigInt` unboxing support leaves those wrappers unchanged.
   *
   * @param value The value to convert.
   * @returns The wrapper’s primitive value when its native unboxing operation is available;
   * otherwise the original input.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#unboxvalue
   */
  function unbox(): undefined;
  /**
   * Extracts the primitive value from a wrapper object, leaving other values unchanged.
   *
   * Uses captured native `valueOf` intrinsics without calling custom conversion hooks. Missing
   * `Symbol` or `BigInt` unboxing support leaves those wrappers unchanged.
   *
   * @param value The value to convert.
   * @returns The wrapper’s primitive value when its native unboxing operation is available;
   * otherwise the original input.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#unboxvalue
   */
  function unbox<T>(value: T): Unboxed<T>;
  /**
   * Converts a pattern and optional flags to a `RegExp`.
   *
   * Uses native `RegExp` syntax and `flags`. May reuse a local `RegExp` object without explicit
   * `flags`; copied expressions start with `lastIndex` zero.
   *
   * @param value The value to convert.
   * @param flags Native RegExp flags. Omitted or `undefined` preserves a RegExp input’s flags;
   * explicit flags replace them.
   * @returns A `RegExp`, which may retain input identity under native rules.
   * @throws Invalid patterns or `flags` throw `SyntaxError`. Native coercion, getters and proxy
   * errors propagate unchanged.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#toregexpvalue-flags
   */
  function toRegExp(value?: unknown, flags?: string): RegExp;
  /**
   * Converts a value to a native `Promise`, adopting thenables and preserving ordinary local
   * promises.
   *
   * Preserves ordinary local `Promise` identity, assimilates thenables and wraps other values.
   * Requires native `Promise.resolve`; functions are values, not callbacks.
   *
   * @param value The value to convert.
   * @returns A native `Promise` that adopts the input; ordinary local promises retain identity.
   * @throws Missing `Promise.resolve` support throws `TypeError` before input inspection. Native
   * synchronous errors propagate; native resolution failures produce rejected promises.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#topromisevalue
   */
  function toPromise(): Promise<undefined>;
  /**
   * Converts a value to a native `Promise`, adopting thenables and preserving ordinary local
   * promises.
   *
   * Preserves ordinary local `Promise` identity, assimilates thenables and wraps other values.
   * Requires native `Promise.resolve`; functions are values, not callbacks.
   *
   * @param value The value to convert.
   * @returns A native `Promise` that adopts the input; ordinary local promises retain identity.
   * @throws Missing `Promise.resolve` support throws `TypeError` before input inspection. Native
   * synchronous errors propagate; native resolution failures produce rejected promises.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#topromisevalue
   */
  function toPromise<T>(value: T): Promise<Awaited<T>>;
  /**
   * Parses JSON text into a JavaScript value using native `JSON.parse` behaviour.
   *
   * Uses captured native `JSON.parse`, including input coercion, reviver order and errors. Parsing
   * does not validate an application schema; reviver results are not awaited.
   *
   * @param value The value to convert.
   * @param reviver A native JSON reviver, called for children before parents and finally for the
   * root. Returning `undefined` deletes a property or replaces the root with `undefined`. Newer
   * hosts may supply optional source context.
   * @returns The parsed value, or any root value returned by the reviver, including `undefined`.
   * TypeScript returns unknown until the caller validates it.
   * @throws Invalid JSON, omitted input and `undefined` throw `SyntaxError`. Symbols throw
   * `TypeError`. Input coercion and reviver errors propagate unchanged.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#parsejsonvalue-reviver
   */
  function parseJson(value: unknown, reviver?: JsonReviver | null): unknown;
  /**
   * Returns an existing array unchanged or wraps a supplied value as one item. Without arguments,
   * returns an empty array.
   *
   * Without arguments, creates a fresh empty array; explicit `null` and `undefined` remain items.
   * Preserves array identity and sparse slots without iteration or coercion. TypeScript retains
   * element and readonly tuple types; broad `object` and `unknown` inputs remain conservative. A
   * preserved array is not a copy.
   *
   * @param value The value to normalise. Omit to create an empty array; explicit undefined or null
   * remains one item.
   * @returns A new empty array when no value is supplied; otherwise the original array or a new
   * array containing the supplied value.
   * @throws Native `Array.isArray` errors propagate, including `TypeError` for revoked proxies.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ensurearrayvalue
   */
  function ensureArray<T = unknown>(): T[];
  /**
   * Returns an existing array unchanged or wraps a supplied value as one item. Without arguments,
   * returns an empty array.
   *
   * Without arguments, creates a fresh empty array; explicit `null` and `undefined` remain items.
   * Preserves array identity and sparse slots without iteration or coercion. TypeScript retains
   * element and readonly tuple types; broad `object` and `unknown` inputs remain conservative. A
   * preserved array is not a copy.
   *
   * @param value The value to normalise. Omit to create an empty array; explicit undefined or null
   * remains one item.
   * @returns A new empty array when no value is supplied; otherwise the original array or a new
   * array containing the supplied value.
   * @throws Native `Array.isArray` errors propagate, including `TypeError` for revoked proxies.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ensurearrayvalue
   */
  function ensureArray<T>(value: T): EnsuredArray<T>;
  /**
   * Returns an existing Set unchanged, creates a Set from array items, or treats another supplied
   * value as one member.
   *
   * Without arguments, creates a fresh empty Set; explicit `null` and `undefined` remain members.
   * Preserves Sets without consuming their members. Array input follows native Set iteration and
   * equality; other values remain single members. A preserved Set is not a copy.
   *
   * @param value The value to normalise. Omit to create an empty Set; explicit undefined or null
   * remains one member.
   * @returns The original Set, or a new Set containing array items or one supplied member. With no
   * arguments, a new empty Set.
   * @throws Missing native Set support throws TypeError before input inspection. Opaque object
   * inputs throw when all captured native identity checks are unavailable. Native construction,
   * revoked-proxy and array-iterator errors propagate; native iteration closes when adding a member
   * fails.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ensuresetvalue
   */
  function ensureSet<T = unknown>(): Set<T>;
  /**
   * Returns an existing Set unchanged, creates a Set from array items, or treats another supplied
   * value as one member.
   *
   * Without arguments, creates a fresh empty Set; explicit `null` and `undefined` remain members.
   * Preserves Sets without consuming their members. Array input follows native Set iteration and
   * equality; other values remain single members. A preserved Set is not a copy.
   *
   * @param value The value to normalise. Omit to create an empty Set; explicit undefined or null
   * remains one member.
   * @returns The original Set, or a new Set containing array items or one supplied member. With no
   * arguments, a new empty Set.
   * @throws Missing native Set support throws TypeError before input inspection. Opaque object
   * inputs throw when all captured native identity checks are unavailable. Native construction,
   * revoked-proxy and array-iterator errors propagate; native iteration closes when adding a member
   * fails.
   * @see https://github.com/fishgoldworks/go-types/blob/master/docs/API.md#ensuresetvalue
   */
  function ensureSet<T>(value: T): EnsuredSet<T>;
}
export = Types;
