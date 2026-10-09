/** Use the consumer's native wrapper type when declared, without requiring ES2020 globals. */
type BoxedBigInt = typeof globalThis extends { BigInt: { prototype: infer Boxed } }
  ? Boxed
  : {
      valueOf(): bigint;
      toString(radix?: number): string;
      toLocaleString(): string;
      readonly [Symbol.toStringTag]: 'BigInt';
    };

/** Runtime contracts and migration details: docs/API.md and docs/migration.md. */
declare namespace Types {
  type TypeName = 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function';
  type PrimitiveTypeName = 'undefined' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol';
  interface PrimitiveTypeMap {
    undefined: undefined;
    boolean: boolean;
    number: number;
    bigint: bigint;
    string: string;
    symbol: symbol;
  }
  type TypeGuard<T> = (value: unknown) => value is T;
  type PredicateMatcher = {
    readonly predicate: (this: undefined, value: unknown) => boolean;
    readonly instanceOf?: never;
  };
  type InstanceMatcher = { readonly instanceOf: Function; readonly predicate?: never };
  type TypeMatcher =
    | TypeName
    | (String & object)
    | Function
    | null
    | undefined
    | PredicateMatcher
    | InstanceMatcher
    | readonly TypeMatcher[];
  type NarrowingMatcher =
    | PrimitiveTypeName
    | null
    | undefined
    | {
        readonly predicate: (this: undefined, value: unknown) => value is unknown;
        readonly instanceOf?: never;
      }
    | readonly NarrowingMatcher[];
  type Matched<S> = S extends PrimitiveTypeName
    ? PrimitiveTypeMap[S]
    : S extends null | undefined
      ? S
      : S extends { readonly predicate: TypeGuard<infer T> }
        ? T
        : S extends readonly (infer Item)[]
          ? Matched<Item>
          : never;
  /** Common structural surface; includes number and bigint typed arrays, not DataView.
   * Specific element-type guards are intentionally outside this API. */
  interface TypedArray extends ArrayBufferView {
    readonly length: number;
    readonly BYTES_PER_ELEMENT: number;
    [index: number]: number | bigint;
  }
  /**
   * Determines whether a value is exactly `undefined`.
   *
   * @param value The value to check.
   * @returns `true` if the value is `undefined`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isundefinedvalue
   */
  function isUndefined(value: unknown): value is undefined;
  /**
   * Determines whether a value is exactly `null`.
   *
   * @param value The value to check.
   * @returns `true` if the value is `null`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnullvalue
   */
  function isNull(value: unknown): value is null;
  /**
   * Determines whether a value is a primitive boolean or a genuine boxed `Boolean`.
   *
   * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
   * wrappers. Does not invoke overridden conversion methods.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive boolean or genuine boxed `Boolean`; otherwise
   * `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isbooleanvalue
   */
  function isBoolean(value: unknown): boolean;
  /**
   * Determines whether a value is a primitive number or a genuine boxed `Number`.
   *
   * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
   * wrappers. Does not invoke overridden conversion methods. Includes `NaN` and infinities.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive number or genuine boxed `Number`, including `NaN`
   * and infinities; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnumbervalue
   */
  function isNumber(value: unknown): boolean;
  /**
   * Determines whether a value is a primitive string or a genuine boxed `String`.
   *
   * Accepts wrappers from another realm, but rejects prototype imitations and proxies around
   * wrappers. Does not invoke overridden conversion methods.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive string or genuine boxed `String`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isstringvalue
   */
  function isString(value: unknown): boolean;
  /**
   * Determines whether a value is a primitive symbol.
   *
   * Boxed symbols return `false`.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive symbol; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issymbolvalue
   */
  function isSymbol(value: unknown): value is symbol;
  /**
   * Determines whether a value is a primitive bigint.
   *
   * Boxed bigints return `false`; numeric strings are not converted.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive bigint; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isbigintvalue
   */
  function isBigInt(value: unknown): value is bigint;
  /**
   * Determines whether a value is a primitive rather than an object or function.
   *
   * Includes `null` and `undefined`; rejects wrappers and functions.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive, including `null` or `undefined`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isprimitivevalue
   */
  function isPrimitive(value: unknown): value is undefined | null | boolean | number | string | symbol | bigint;
  /**
   * Determines whether a value is `null` or `undefined`.
   *
   * @param value The value to check.
   * @returns `true` if the value is `null` or `undefined`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnullishvalue
   */
  function isNullish(value: unknown): value is null | undefined;
  /**
   * Determines whether a value is nullish or a supported string or container has no items.
   *
   * Uses lengths, collection sizes or dictionary keys. Unsized iterators and iterables throw
   * `TypeError`; getters and proxy traps may run. Unavailable native collection types do not prevent
   * loading or checks of other supported values. If a detected collection lacks the required native
   * size or iteration operation, the check throws `TypeError`.
   *
   * @param value The value to check.
   * @returns `true` if the value is nullish or a supported string or container with no items;
   * otherwise `false`.
   * @throws `TypeError` for unsized iterators or iterables. Property getters and proxy traps may
   * throw. See Empty and blank values.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isemptyvalue
   */
  function isEmpty(value: unknown): boolean;
  /**
   * Determines whether a value is nullish, an empty or whitespace-only string, or a supported
   * container containing only nullish values.
   *
   * Shallow and non-consuming. Map checks inspect values. Unsized iterators and iterables throw
   * `TypeError`; getters and proxy traps may run. Unavailable native collection types do not prevent
   * loading or checks of other supported values. If a detected collection lacks the required native
   * size or iteration operation, the check throws `TypeError`.
   *
   * @param value The value to check.
   * @returns `true` if the value is nullish, a whitespace-only string, or a supported container
   * containing only nullish values; otherwise `false`.
   * @throws `TypeError` for unsized iterators or iterables. Property getters and proxy traps may
   * throw. See Empty and blank values.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isblankvalue
   */
  function isBlank(value: unknown): boolean;
  /**
   * Determines whether JavaScript treats a value as `true` in a condition.
   *
   * @param value The value to check.
   * @returns `true` if the value is truthy under JavaScript boolean coercion; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istruthyvalue
   */
  function isTruthy(value: unknown): boolean;
  /**
   * Determines whether JavaScript treats a value as `false` in a condition.
   *
   * @param value The value to check.
   * @returns `true` if the value is falsy under JavaScript boolean coercion; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfalsyvalue
   */
  function isFalsy(value: unknown): boolean;
  /**
   * Determines whether a primitive or boxed number is an integer.
   *
   * Accepts genuine `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive or boxed finite integral number; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isintegervalue
   */
  function isInteger(value: unknown): boolean;
  /**
   * Determines whether a primitive or boxed number is an integer in JavaScript’s safe-integer range.
   *
   * Accepts genuine `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive or boxed integer within the safe-integer range;
   * otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issafeintegervalue
   */
  function isSafeInteger(value: unknown): boolean;
  /**
   * Determines whether a primitive or boxed number is a finite number with a fractional part.
   *
   * Accepts genuine `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive or boxed finite non-integer number; otherwise
   * `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfloatvalue
   */
  function isFloat(value: unknown): boolean;
  /**
   * Determines whether a primitive or boxed number is a finite number.
   *
   * Accepts genuine `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is a primitive or boxed finite number; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfinitevalue
   */
  function isFinite(value: unknown): boolean;
  /**
   * Determines whether a primitive or boxed number is positive or negative infinity.
   *
   * Accepts genuine `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is primitive or boxed positive or negative infinity; otherwise
   * `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isinfinitevalue
   */
  function isInfinite(value: unknown): boolean;
  /**
   * Determines whether a primitive or boxed number is `NaN`.
   *
   * Accepts genuine `Number` wrappers without invoking conversion hooks; rejects numeric strings.
   *
   * @param value The value to check.
   * @returns `true` if the value is primitive or boxed `NaN`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnanvalue
   */
  function isNaN(value: unknown): boolean;
  /**
   * Determines whether a value is a finite number, a bigint, or non-blank numeric text.
   *
   * Accepts numeric text as well as finite numbers and primitive bigints. Rejects booleans, blank
   * text, `NaN`, infinities and boxed bigints.
   *
   * @param value The value to check.
   * @returns `true` if the value is a finite primitive or boxed number, a primitive bigint, or
   * non-blank string text converting to a finite number; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnumericvalue
   */
  function isNumeric(value: unknown): boolean;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown, type: 'boolean'): value is boolean;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown, type: 'number'): value is number;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown, type: 'bigint'): value is bigint;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown, type: 'string'): value is string;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown, type: 'symbol'): value is symbol;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown, type: null): value is null;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown, type: undefined): value is undefined;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown): value is undefined;
  /**
   * Determines whether a value matches a type name, instance target, predicate or union of matchers.
   *
   * Validates the entire specification before matching. An omitted type matches `undefined`.
   * Predicates must return a synchronous primitive boolean.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value matches the type specification (omission matches `undefined`);
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypeofvalue-type
   */
  function isTypeOf(value: unknown, type: TypeMatcher): boolean;
  /**
   * Determines whether a value is a non-null object or function.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-null object or function; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isobjectvalue
   */
  function isObject(value: unknown): boolean;
  /**
   * Determines whether a value has a null or ordinary `Object` prototype.
   *
   * Checks the current prototype, not allocation history or a schema. Proxy traps may run; an own
   * `constructor` field is not read.
   *
   * @param value The value to check.
   * @returns `true` if the value has a null or ordinary `Object` prototype; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isplainobjectvalue
   */
  function isPlainObject(value: unknown): boolean;
  /**
   * Determines whether following enumerable string-keyed properties leads back to an ancestor.
   *
   * Includes inherited enumerable string keys, but ignores symbols, non-enumerable properties and
   * Map/Set entries. Getters and proxy traps may run. Internal reference tracking falls back to
   * local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param value The value to check.
   * @returns `true` if enumerable string-keyed property traversal reaches an active ancestor;
   * otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#iscyclicvalue
   */
  function isCyclic(value: unknown): boolean;
  /**
   * Determines whether a value exposes a synchronous iterator method.
   *
   * Reads `Symbol.iterator` without calling it. Getters and proxy traps may run; method presence
   * does not guarantee a valid iterator.
   *
   * @param value The value to check.
   * @returns `true` if the value has a callable `Symbol.iterator` method; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isiterablevalue
   */
  function isIterable(value: unknown): boolean;
  /**
   * Determines whether a value is an array, including from another realm.
   *
   * Preserves native `Array.isArray` behaviour, including `TypeError` for a revoked proxy.
   *
   * @param value The value to check.
   * @returns `true` if the value passes native `Array.isArray`; otherwise `false`.
   * @throws `TypeError` for a revoked proxy, following native `Array.isArray` behaviour.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarrayvalue
   */
  function isArray(value: unknown): boolean;
  /**
   * Determines whether an array contains only values matching a type specification.
   *
   * Validates the matcher before inspecting the input. Empty containers pass; evaluation stops at
   * the first mismatch. Missing array positions read as `undefined` unless inherited numeric
   * properties supply values.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value is an array and every element matches the specification, including
   * an empty array; otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarrayofvalue-type
   */
  function isArrayOf(value: unknown, type?: TypeMatcher): boolean;
  /**
   * Determines whether a non-function value has a valid numeric length.
   *
   * Reads `length` once. Missing indices are allowed; boxed, negative, fractional or non-finite
   * lengths are rejected.
   *
   * @param value The value to check.
   * @returns `true` if the value is not a function and has a numeric integer length from `0` through
   * `Number.MAX_SAFE_INTEGER`; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarraylikevalue
   */
  function isArrayLike(value: unknown): boolean;
  /**
   * Determines whether an array-like value contains only values matching a type specification.
   *
   * Validates the matcher before inspecting the input. Empty containers pass; evaluation stops at
   * the first mismatch. Missing array positions read as `undefined` unless inherited numeric
   * properties supply values.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value is array-like and every indexed value matches the specification,
   * including an empty input; otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarraylikeofvalue-type
   */
  function isArrayLikeOf(value: unknown, type?: TypeMatcher): boolean;
  /**
   * Determines whether a value is an array of length two.
   *
   * @param value The value to check.
   * @returns `true` if the value is an array of length `2`; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate. Native
   * `Array.isArray` also throws `TypeError` for a revoked proxy.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ispairvalue
   */
  function isPair(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine `Map`.
   *
   * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
   * imitations. Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `Map`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ismapvalue
   */
  function isMap(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine `Set`.
   *
   * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
   * imitations. Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `Set`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issetvalue
   */
  function isSet(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine `WeakMap`.
   *
   * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
   * imitations. Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `WeakMap`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isweakmapvalue
   */
  function isWeakMap(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine `WeakSet`.
   *
   * Supports foreign instances without enumerating contents; rejects proxies and prototype or tag
   * imitations. Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `WeakSet`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isweaksetvalue
   */
  function isWeakSet(value: unknown): boolean;
  /**
   * Determines whether JavaScript reports a value as a function.
   *
   * Includes classes and callable proxies; does not guarantee a successful call.
   *
   * @param value The value to check.
   * @returns `true` if `typeof value` is `"function"`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfunctionvalue
   */
  function isFunction(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine `Date`, valid or invalid.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `Date`, valid or invalid; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isdatevalue
   */
  function isDate(value: unknown): boolean;
  /**
   * Determines whether a genuine `Date` contains a finite timestamp.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `Date` with a finite timestamp; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isvaliddatevalue
   */
  function isValidDate(value: unknown): boolean;
  /**
   * Determines whether a genuine `Date` contains a `NaN` timestamp.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `Date` with a `NaN` timestamp; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isinvaliddatevalue
   */
  function isInvalidDate(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine regular-expression object.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `RegExp` instance; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isregexpvalue
   */
  function isRegExp(value: unknown): boolean;
  /**
   * Determines whether a value passes the local native `Promise` instance check.
   *
   * Uses local `instanceof` semantics; it is not proof of native Promise identity. Does not call
   * `then`.
   *
   * @param value The value to check.
   * @returns `true` if the value passes the local native `Promise` instance check; otherwise
   * `false`.
   * @throws Native `instanceof` errors propagate, including errors from proxy prototype access or a
   * custom `Symbol.hasInstance` method.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ispromisevalue
   */
  function isPromise(value: unknown): boolean;
  /**
   * Determines whether a value is an object or function with callable `then` and `catch` methods.
   *
   * Requires both `then` and `catch`, unlike TypeScript `PromiseLike`. Does not invoke them; getters
   * or proxy traps may run.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-null object or function with callable `then` and `catch`
   * methods; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ispromiselikevalue
   */
  function isPromiseLike(value: unknown): boolean;
  /**
   * Determines whether a value is an object or function with a callable `then` method.
   *
   * Does not invoke `then` or prove Promise behaviour. Getters and proxy traps may run.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-null object or function with a callable `then` method;
   * otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isthenablevalue
   */
  function isThenable(value: unknown): boolean;
  /**
   * Determines whether a value is recognised as an error by the available native check or fallback.
   *
   * The fallback rejects custom tags without reading their getters. Without native branding or a
   * usable tag key, returns `false`. Proxy traps may run; this is not a security check.
   *
   * @param value The value to check.
   * @returns `true` if the captured native error check, or its conservative fallback, recognises the
   * value as an error; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#iserrorvalue
   */
  function isError(value: unknown): boolean;
  /**
   * Determines whether a value is an instance of the local DOM `Node` constructor.
   *
   * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
   * DOM objects.
   *
   * @param value The value to check.
   * @returns `true` if a local `Node` constructor is available and the value passes its instance
   * check; otherwise `false`.
   * @throws Native `instanceof` errors propagate, including errors from proxy prototype access or a
   * custom `Symbol.hasInstance` method.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnodevalue
   */
  function isNode(value: unknown): boolean;
  /**
   * Determines whether a value is an instance of the local DOM `Element` constructor.
   *
   * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
   * DOM objects.
   *
   * @param value The value to check.
   * @returns `true` if a local `Element` constructor is available and the value passes its instance
   * check; otherwise `false`.
   * @throws Native `instanceof` errors propagate, including errors from proxy prototype access or a
   * custom `Symbol.hasInstance` method.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#iselementvalue
   */
  function isElement(value: unknown): boolean;
  /**
   * Determines whether a value is an instance of the local DOM `DocumentFragment` constructor.
   *
   * Returns `false` when the local constructor is unavailable. Does not recognise all foreign-realm
   * DOM objects.
   *
   * @param value The value to check.
   * @returns `true` if a local `DocumentFragment` constructor is available and the value passes its
   * instance check; otherwise `false`.
   * @throws Native `instanceof` errors propagate, including errors from proxy prototype access or a
   * custom `Symbol.hasInstance` method.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isfragmentvalue
   */
  function isFragment(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine `ArrayBuffer`.
   *
   * Checks identity rather than memory usability; supports foreign instances and rejects proxies.
   * Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `ArrayBuffer`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarraybuffervalue
   */
  function isArrayBuffer(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine `SharedArrayBuffer`.
   *
   * Supports foreign instances and rejects proxies or prototype imitations. Returns `false` when
   * native shared buffers are unavailable. Returns `false` when the local native detection
   * capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if native shared buffers are available and the value is a genuine
   * `SharedArrayBuffer`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issharedarraybuffervalue
   */
  function isSharedArrayBuffer(value: unknown): boolean;
  /**
   * Determines whether a value is a native typed array or `DataView`.
   *
   * Detached views retain their identity; passing does not guarantee usable memory. Falls back to
   * native DataView and typed-array identity checks when `ArrayBuffer.isView` is unavailable;
   * returns `false` if none of those checks is available.
   *
   * @param value The value to check.
   * @returns `true` if the value is a native typed array or `DataView`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isarraybufferviewvalue
   */
  function isArrayBufferView(value: unknown): boolean;
  /**
   * Determines whether a value is a native typed array, including a Node.js `Buffer`.
   *
   * Excludes `DataView` and ordinary arrays; detached views still pass. Does not identify a
   * particular element type. Uses captured native tag or length getters; returns `false` if no
   * usable native detection getter is available. Missing `Symbol`, `Reflect` or `ArrayBuffer.isView`
   * does not prevent loading.
   *
   * @param value The value to check.
   * @returns `true` if the value is a native typed array, including a Node.js `Buffer`; otherwise
   * `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#istypedarrayvalue
   */
  function isTypedArray(value: unknown): boolean;
  /**
   * Determines whether a value is a genuine `DataView`.
   *
   * Checks identity rather than memory usability; supports foreign instances and rejects proxies.
   * Returns `false` when the local native detection capability is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the value is a genuine `DataView`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isdataviewvalue
   */
  function isDataView(value: unknown): boolean;
  /**
   * Determines whether a value exposes an asynchronous iterator method.
   *
   * Does not invoke the method. Returns `false` without inspecting the value when
   * `Symbol.asyncIterator` is unavailable. Returns `false` without inspecting the input when
   * `Symbol` itself or `Symbol.asyncIterator` is unavailable.
   *
   * @param value The value to check.
   * @returns `true` if the async-iterator symbol is available and the value has a callable
   * `Symbol.asyncIterator` method; otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isasynciterablevalue
   */
  function isAsyncIterable(value: unknown): boolean;
  /**
   * Determines whether a value is an object or function with a callable `next` method.
   *
   * Does not invoke `next` or validate iterator results. Property getters and proxy traps may run.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-null object or function with a callable `next` method;
   * otherwise `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isiteratorlikevalue
   */
  function isIteratorLike(value: unknown): boolean;
  /**
   * Determines whether a value is neither `null` nor `undefined`.
   *
   * @param value The value to check.
   * @returns `true` if the value is neither `null` nor `undefined`; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnonnullishvalue
   */
  function isNonNullish<T>(value: T): value is NonNullable<T>;
  /**
   * Determines whether a value is a non-null object, excluding functions.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-null object other than a function; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isobjectlikevalue
   */
  function isObjectLike(value: unknown): boolean;
  /**
   * Determines whether a value is an array with a valid length greater than zero.
   *
   * Sparse arrays count as non-empty when their length is positive. Does not validate elements.
   *
   * @param value The value to check.
   * @returns `true` if the value is an array with a valid length greater than zero; otherwise
   * `false`.
   * @throws Property getters or proxy traps may throw; their errors propagate. Native
   * `Array.isArray` also throws `TypeError` for a revoked proxy.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isnonemptyarrayvalue
   */
  function isNonEmptyArray(value: unknown): boolean;
  /**
   * Determines whether primitive or boxed string text is valid JSON.
   *
   * Accepts JSON scalar text as well as objects and arrays. Does not validate a schema or
   * arbitrary-object serialisability.
   *
   * @param value The value to check.
   * @returns `true` if the value is primitive or boxed string text that parses as JSON; otherwise
   * `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isjsonvalue
   */
  function isJson(value: unknown): boolean;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(type: 'boolean'): TypeGuard<boolean>;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(type: 'number'): TypeGuard<number>;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(type: 'bigint'): TypeGuard<bigint>;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(type: 'string'): TypeGuard<string>;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(type: 'symbol'): TypeGuard<symbol>;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(type: null): TypeGuard<null>;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(type: undefined): TypeGuard<undefined>;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(): TypeGuard<undefined>;
  /**
   * Creates a reusable function that checks values against a type specification.
   *
   * Snapshots matcher arrays now; application predicates and instance hooks run during later checks
   * and retain live state. An omitted type matches `undefined`. Internal reference tracking falls
   * back to local arrays when weak collections are unavailable; no platform globals are changed.
   *
   * @param type The matcher for values passed to the returned checker. An omitted matcher matches
   * `undefined`.
   * @returns A reusable checker that returns `true` if its input matches the compiled specification;
   * otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError` during creation; configuration access
   * can also trigger proxy traps. The returned checker can throw for invalid predicate results or
   * native instance checks. Callback and property-access errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#createtypecheckertype
   */
  function createTypeChecker(type: TypeMatcher): (value: unknown) => boolean;
  /**
   * Determines whether a Set contains only values matching a type specification.
   *
   * Validates the matcher before inspecting the input. Empty containers pass; evaluation stops at
   * the first mismatch. Predicates must not mutate the Set. Unavailable native collection types do
   * not prevent loading or checks of other supported values. If a detected collection lacks the
   * required native size or iteration operation, the check throws `TypeError`.
   *
   * @param value The value to check.
   * @param type The matcher for the value or collection items. An omitted matcher matches
   * `undefined`.
   * @returns `true` if the value is a `Set` whose items all match the specification, including an
   * empty `Set`; otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#issetofvalue-type
   */
  function isSetOf(value: unknown, type?: TypeMatcher): boolean;
  /**
   * Determines whether every Map key and value matches its respective specification.
   *
   * Validates both matchers first; empty Maps pass. Checks each key before its value. Predicates
   * must not mutate the Map. Unavailable native collection types do not prevent loading or checks of
   * other supported values. If a detected collection lacks the required native size or iteration
   * operation, the check throws `TypeError`.
   *
   * @param value The value to check.
   * @param keyType The matcher for Map keys. An omitted matcher matches `undefined`.
   * @param valueType The matcher for Map values. An omitted matcher matches `undefined`.
   * @returns `true` if the value is a `Map` whose keys and values match their respective
   * specifications, including an empty `Map`; otherwise `false`.
   * @throws Invalid matcher configuration throws `TypeError`. Callback, property-access and native
   * instance-matching errors propagate; see Type specifications.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#ismapofvalue-keytype-valuetype
   */
  function isMapOf(value: unknown, keyType?: TypeMatcher, valueType?: TypeMatcher): boolean;
  /**
   * Determines whether a synchronous iterable is empty by advancing its iterator.
   *
   * Consumes input and may close it early, running iterator cleanup. Requires a synchronous
   * iterable; do not reuse one-shot input.
   *
   * @param value The value to check.
   * @returns `true` if the synchronous iterable yields no items; otherwise `false`.
   * @throws `TypeError` for non-iterable input. Iterator and iterator-closing errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isemptyiterablevalue
   */
  function isEmptyIterable(value: unknown): boolean;
  /**
   * Determines whether every item yielded by a synchronous iterable is nullish by advancing its
   * iterator.
   *
   * Consumes input and may close it early. A nullish-only infinite iterable never completes. Map
   * entries are arrays, so a non-empty Map is not blank.
   *
   * @param value The value to check.
   * @returns `true` if the synchronous iterable yields no items or only nullish items; otherwise
   * `false`.
   * @throws `TypeError` for non-iterable input. Iterator and iterator-closing errors propagate.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isblankiterablevalue
   */
  function isBlankIterable(value: unknown): boolean;
  /** Conditions are booleans or synchronous predicates invoked without a receiver. */
  type ConversionCondition<T> = boolean | ((this: undefined, value: T) => boolean);
  /** Prefer definite iteration; a visible optional/nullable iterator can override indexed values. */
  type ArrayElement<T> =
    T extends Iterable<infer Item>
      ? Item
      : T extends ArrayLike<infer Item>
        ? typeof Symbol.iterator extends keyof T
          ? T[typeof Symbol.iterator] extends null | undefined
            ? Item
            : unknown
          : Item
        : unknown;
  /** Preserve inferred key/value types for iterable entry tuples; other inputs remain unknown. */
  type ConvertedMap<T> =
    T extends Iterable<readonly [infer Key, infer Value]> ? Map<Key, Value> : Map<unknown, unknown>;
  /** Preserve inferred iterable element types; non-iterable inputs remain unknown. */
  type ConvertedSet<T> = Set<T extends Iterable<infer Item> ? Item : unknown>;
  /** Native Object conversion preserves objects and boxes non-nullish primitives. */
  // Primitive intersections can satisfy `object` structurally; box them before
  // preserving genuine object/function input types.
  type ConvertedObject<T> = T extends null | undefined
    ? object
    : T extends string
      ? String
      : T extends number
        ? Number
        : T extends boolean
          ? Boolean
          : T extends bigint
            ? BoxedBigInt
            : T extends symbol
              ? Symbol
              : T extends object
                ? T
                : object;

  /**
   * Converts iterable or array-like input to a new shallow array.
   *
   * Consumes iterable input and may invoke getters or iterator methods. Infinite iterables do not
   * finish; nullish input throws. Requires native `Array.from`; missing support does not prevent
   * loading. Requested conversion throws `TypeError` before inspecting the input when it is
   * unavailable.
   *
   * @param value The value to convert.
   * @returns A new shallow array containing the input items.
   * @throws `TypeError` for `null`, `undefined`, malformed iterators or incompatible length
   * conversion. Oversized lengths can throw `RangeError`. Property-access and iteration errors
   * propagate. Unavailable native `Array.from` support throws `TypeError` before conversion.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toarrayvalue
   */
  function toArray<T>(value: T): ArrayElement<T>[];
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
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobigintvalue
   */
  function toBigInt(value?: unknown): bigint;
  /**
   * Converts a value to a boolean using JavaScript truthiness.
   *
   * Uses truthiness rather than parsing boolean text. Does not invoke object conversion hooks.
   *
   * @param value The value to convert.
   * @returns `true` if the input is truthy under JavaScript boolean coercion; otherwise `false`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobooleanvalue
   */
  function toBoolean(value?: unknown): boolean;
  /**
   * Converts a value to a `Date`, returning genuine `Date` objects unchanged. The result can be
   * invalid.
   *
   * Preserves genuine Date identity. May return an invalid Date; omitted input does not mean the
   * current time. Symbols, bigints and conversion hooks can throw.
   *
   * @param value The value to convert.
   * @returns The original genuine `Date`, or a new `Date` constructed from the input; it may be
   * invalid.
   * @throws Symbols, bigints and failed object coercion can throw. Invalid date text can instead
   * produce an invalid `Date`; check with `isValidDate`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#todatevalue
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
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tointegervalue
   */
  function toInteger(value?: unknown): number;
  /**
   * Converts a value to a primitive number using JavaScript’s `Number` conversion.
   *
   * May return `NaN` or infinity, lose bigint precision, or invoke object conversion hooks. Symbols
   * throw.
   *
   * @param value The value to convert.
   * @returns The converted primitive number; it may be `NaN` or infinite.
   * @throws Symbols throw `TypeError`. Object-coercion errors propagate; invalid numeric text
   * returns `NaN`.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tonumbervalue
   */
  function toNumber(value?: unknown): number;
  /**
   * Converts a value to an object, preserving existing objects and functions.
   *
   * Preserves existing object/function identity. Nullish input creates a fresh empty object;
   * conversion hooks are not invoked.
   *
   * @param value The value to convert.
   * @returns The original object or function, a boxed primitive, or a fresh empty object for nullish
   * input.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toobjectvalue
   */
  function toObject<T>(value: T): ConvertedObject<T>;
  /**
   * Converts a value to an object, preserving existing objects and functions.
   *
   * Preserves existing object/function identity. Nullish input creates a fresh empty object;
   * conversion hooks are not invoked.
   *
   * @param value The value to convert.
   * @returns The original object or function, a boxed primitive, or a fresh empty object for nullish
   * input.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toobjectvalue
   */
  function toObject(): object;
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
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tostringvalue
   */
  function toString(value?: unknown): string;
  /**
   * Converts a value to a primitive symbol, preserving primitive symbols and unboxing genuine Symbol
   * wrappers.
   *
   * Preserves primitive symbol identity and unboxes genuine wrappers. Other inputs create a new
   * symbol and may invoke description-conversion hooks. Requires native `Symbol`; missing support
   * does not prevent loading. Requested conversion throws `TypeError` before inspecting the input
   * when it is unavailable.
   *
   * @param value The value to convert.
   * @returns The original or unboxed symbol, or a new symbol created from the description.
   * @throws Native description-conversion errors propagate. Unavailable native `Symbol` support
   * throws `TypeError` before conversion.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosymbolvalue
   */
  function toSymbol(value?: unknown): symbol;
  /**
   * Converts iterable or array-like input to a new shallow array when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toArray`. Consumes iterable input and may invoke getters or iterator
   * methods. Infinite iterables do not finish; nullish input throws. Requires native `Array.from`;
   * missing support does not prevent loading. Requested conversion throws `TypeError` before
   * inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new shallow array when conversion is requested; otherwise the original input,
   * unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toArray` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toarrayifvalue-condition
   */
  function toArrayIf<T>(value: T, condition: true): ArrayElement<T>[];
  /**
   * Converts iterable or array-like input to a new shallow array when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toArray`. Consumes iterable input and may invoke getters or iterator
   * methods. Infinite iterables do not finish; nullish input throws. Requires native `Array.from`;
   * missing support does not prevent loading. Requested conversion throws `TypeError` before
   * inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new shallow array when conversion is requested; otherwise the original input,
   * unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toArray` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toarrayifvalue-condition
   */
  function toArrayIf<T>(value: T, condition?: false): T;
  /**
   * Converts iterable or array-like input to a new shallow array when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toArray`. Consumes iterable input and may invoke getters or iterator
   * methods. Infinite iterables do not finish; nullish input throws. Requires native `Array.from`;
   * missing support does not prevent loading. Requested conversion throws `TypeError` before
   * inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new shallow array when conversion is requested; otherwise the original input,
   * unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toArray` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toarrayifvalue-condition
   */
  function toArrayIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | ArrayElement<T>[];
  /**
   * Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`. Only a requested conversion
   * requires native BigInt.
   *
   * Requested conversion uses `toBigInt`. Requires native BigInt. Fractional numbers and invalid
   * integer text throw; input conversion hooks may run.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive bigint when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toBigInt` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobigintifvalue-condition
   */
  function toBigIntIf<T>(value: T, condition: true): bigint;
  /**
   * Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`. Only a requested conversion
   * requires native BigInt.
   *
   * Requested conversion uses `toBigInt`. Requires native BigInt. Fractional numbers and invalid
   * integer text throw; input conversion hooks may run.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive bigint when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toBigInt` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobigintifvalue-condition
   */
  function toBigIntIf<T>(value: T, condition?: false): T;
  /**
   * Converts a value to a primitive bigint when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`. Only a requested conversion
   * requires native BigInt.
   *
   * Requested conversion uses `toBigInt`. Requires native BigInt. Fractional numbers and invalid
   * integer text throw; input conversion hooks may run.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive bigint when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toBigInt` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobigintifvalue-condition
   */
  function toBigIntIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | bigint;
  /**
   * Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`.
   * Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toBoolean`. Uses truthiness rather than parsing boolean text. Does
   * not invoke object conversion hooks.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The input’s boolean truthiness when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toBoolean` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobooleanifvalue-condition
   */
  function toBooleanIf<T>(value: T, condition: true): boolean;
  /**
   * Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`.
   * Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toBoolean`. Uses truthiness rather than parsing boolean text. Does
   * not invoke object conversion hooks.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The input’s boolean truthiness when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toBoolean` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobooleanifvalue-condition
   */
  function toBooleanIf<T>(value: T, condition?: false): T;
  /**
   * Converts a value to its JavaScript boolean truthiness when the condition evaluates to `true`.
   * Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toBoolean`. Uses truthiness rather than parsing boolean text. Does
   * not invoke object conversion hooks.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The input’s boolean truthiness when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toBoolean` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tobooleanifvalue-condition
   */
  function toBooleanIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | boolean;
  /**
   * Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the
   * original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toDate`. Preserves genuine Date identity. May return an invalid Date;
   * omitted input does not mean the current time. Symbols, bigints and conversion hooks can throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original genuine `Date` or a new `Date`, possibly invalid, when conversion is
   * requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toDate` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#todateifvalue-condition
   */
  function toDateIf<T>(value: T, condition: true): Date;
  /**
   * Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the
   * original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toDate`. Preserves genuine Date identity. May return an invalid Date;
   * omitted input does not mean the current time. Symbols, bigints and conversion hooks can throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original genuine `Date` or a new `Date`, possibly invalid, when conversion is
   * requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toDate` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#todateifvalue-condition
   */
  function toDateIf<T>(value: T, condition?: false): T;
  /**
   * Converts a value to a `Date` when the condition evaluates to `true`. Otherwise, returns the
   * original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toDate`. Preserves genuine Date identity. May return an invalid Date;
   * omitted input does not mean the current time. Symbols, bigints and conversion hooks can throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original genuine `Date` or a new `Date`, possibly invalid, when conversion is
   * requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toDate` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#todateifvalue-condition
   */
  function toDateIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | Date;
  /**
   * Converts a value to a number and truncates it towards zero when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toInteger`. Does not guarantee a finite or safe integer. Symbols and
   * failing conversion hooks can throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The numeric conversion truncated towards zero, possibly `NaN` or infinite, when
   * conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toInteger` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tointegerifvalue-condition
   */
  function toIntegerIf<T>(value: T, condition: true): number;
  /**
   * Converts a value to a number and truncates it towards zero when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toInteger`. Does not guarantee a finite or safe integer. Symbols and
   * failing conversion hooks can throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The numeric conversion truncated towards zero, possibly `NaN` or infinite, when
   * conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toInteger` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tointegerifvalue-condition
   */
  function toIntegerIf<T>(value: T, condition?: false): T;
  /**
   * Converts a value to a number and truncates it towards zero when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toInteger`. Does not guarantee a finite or safe integer. Symbols and
   * failing conversion hooks can throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The numeric conversion truncated towards zero, possibly `NaN` or infinite, when
   * conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toInteger` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tointegerifvalue-condition
   */
  function toIntegerIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | number;
  /**
   * Converts a value to a primitive number when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toNumber`. May return `NaN` or infinity, lose bigint precision, or
   * invoke object conversion hooks. Symbols throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive number, possibly `NaN` or infinite, when conversion is
   * requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toNumber` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tonumberifvalue-condition
   */
  function toNumberIf<T>(value: T, condition: true): number;
  /**
   * Converts a value to a primitive number when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toNumber`. May return `NaN` or infinity, lose bigint precision, or
   * invoke object conversion hooks. Symbols throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive number, possibly `NaN` or infinite, when conversion is
   * requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toNumber` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tonumberifvalue-condition
   */
  function toNumberIf<T>(value: T, condition?: false): T;
  /**
   * Converts a value to a primitive number when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toNumber`. May return `NaN` or infinity, lose bigint precision, or
   * invoke object conversion hooks. Symbols throw.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive number, possibly `NaN` or infinite, when conversion is
   * requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toNumber` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tonumberifvalue-condition
   */
  function toNumberIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | number;
  /**
   * Converts a value to an object when the condition evaluates to `true`. Otherwise, returns the
   * original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toObject`. Preserves existing object/function identity. Nullish input
   * creates a fresh empty object; conversion hooks are not invoked.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original object or function, a boxed primitive, or a new object for nullish input
   * when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toObject` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toobjectifvalue-condition
   */
  function toObjectIf<T>(value: T, condition: true): ConvertedObject<T>;
  /**
   * Converts a value to an object when the condition evaluates to `true`. Otherwise, returns the
   * original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toObject`. Preserves existing object/function identity. Nullish input
   * creates a fresh empty object; conversion hooks are not invoked.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original object or function, a boxed primitive, or a new object for nullish input
   * when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toObject` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toobjectifvalue-condition
   */
  function toObjectIf<T>(value: T, condition?: false): T;
  /**
   * Converts a value to an object when the condition evaluates to `true`. Otherwise, returns the
   * original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toObject`. Preserves existing object/function identity. Nullish input
   * creates a fresh empty object; conversion hooks are not invoked.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original object or function, a boxed primitive, or a new object for nullish input
   * when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toObject` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#toobjectifvalue-condition
   */
  function toObjectIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | ConvertedObject<T>;
  /**
   * Converts a value to a primitive string when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toString`. May invoke conversion hooks and throw, including for boxed
   * symbols. Does not perform JSON serialisation.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive string when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toString` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tostringifvalue-condition
   */
  function toStringIf<T>(value: T, condition: true): string;
  /**
   * Converts a value to a primitive string when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toString`. May invoke conversion hooks and throw, including for boxed
   * symbols. Does not perform JSON serialisation.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive string when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toString` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tostringifvalue-condition
   */
  function toStringIf<T>(value: T, condition?: false): T;
  /**
   * Converts a value to a primitive string when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toString`. May invoke conversion hooks and throw, including for boxed
   * symbols. Does not perform JSON serialisation.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The converted primitive string when conversion is requested; otherwise the original
   * input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toString` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tostringifvalue-condition
   */
  function toStringIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | string;
  /**
   * Converts a value to a primitive symbol when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toSymbol`. Preserves primitive symbol identity and unboxes genuine
   * wrappers. Other inputs create a new symbol and may invoke description-conversion hooks. Requires
   * native `Symbol`; missing support does not prevent loading. Requested conversion throws
   * `TypeError` before inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original or unboxed symbol, or a new symbol from the description, when conversion
   * is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toSymbol` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosymbolifvalue-condition
   */
  function toSymbolIf<T>(value: T, condition: true): symbol;
  /**
   * Converts a value to a primitive symbol when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toSymbol`. Preserves primitive symbol identity and unboxes genuine
   * wrappers. Other inputs create a new symbol and may invoke description-conversion hooks. Requires
   * native `Symbol`; missing support does not prevent loading. Requested conversion throws
   * `TypeError` before inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original or unboxed symbol, or a new symbol from the description, when conversion
   * is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toSymbol` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosymbolifvalue-condition
   */
  function toSymbolIf<T>(value: T, condition?: false): T;
  /**
   * Converts a value to a primitive symbol when the condition evaluates to `true`. Otherwise,
   * returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toSymbol`. Preserves primitive symbol identity and unboxes genuine
   * wrappers. Other inputs create a new symbol and may invoke description-conversion hooks. Requires
   * native `Symbol`; missing support does not prevent loading. Requested conversion throws
   * `TypeError` before inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns The original or unboxed symbol, or a new symbol from the description, when conversion
   * is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toSymbol` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosymbolifvalue-condition
   */
  function toSymbolIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | symbol;
  /**
   * Converts an iterable of key/value entries to a new shallow Map.
   *
   * Consumes synchronous entries; duplicate keys keep their first position and take the last value.
   * Nullish input creates an empty Map. Non-iterable objects are not converted into entries.
   * Requires native `Map`; missing support does not prevent loading. Requested conversion throws
   * `TypeError` before inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @returns A new Map containing the input entries, or an empty Map for omitted or nullish input.
   * @throws TypeError for non-nullish non-iterable input, malformed iterators or primitive entries.
   * Iterator and entry-property errors propagate according to native Map construction, including
   * iterator closing when an entry cannot be processed. Unavailable native `Map` support throws
   * `TypeError` before conversion.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tomapvalue
   */
  function toMap<T = unknown>(value?: T): ConvertedMap<T>;
  /**
   * Converts an iterable of values to a new shallow Set.
   *
   * Consumes synchronous values and removes duplicates without coercion. Strings yield Unicode code
   * points. Nullish input creates an empty Set; non-iterable scalars and array-like objects throw.
   * Requires native `Set`; missing support does not prevent loading. Requested conversion throws
   * `TypeError` before inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @returns A new Set of the input values in first-insertion order, or an empty Set for omitted or
   * nullish input.
   * @throws TypeError for non-nullish non-iterable input or malformed iterators. Property-access and
   * iterator errors propagate according to native Set construction. Unavailable native `Set` support
   * throws `TypeError` before conversion.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosetvalue
   */
  function toSet<T = unknown>(value?: T): ConvertedSet<T>;
  /**
   * Converts an iterable of key/value entries to a new shallow Map when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toMap`. Consumes synchronous entries; duplicate keys keep their first
   * position and take the last value. Nullish input creates an empty Map. Non-iterable objects are
   * not converted into entries. Requires native `Map`; missing support does not prevent loading.
   * Requested conversion throws `TypeError` before inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new Map when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toMap` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tomapifvalue-condition
   */
  function toMapIf<T>(value: T, condition: true): ConvertedMap<T>;
  /**
   * Converts an iterable of key/value entries to a new shallow Map when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toMap`. Consumes synchronous entries; duplicate keys keep their first
   * position and take the last value. Nullish input creates an empty Map. Non-iterable objects are
   * not converted into entries. Requires native `Map`; missing support does not prevent loading.
   * Requested conversion throws `TypeError` before inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new Map when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toMap` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tomapifvalue-condition
   */
  function toMapIf<T>(value: T, condition?: false): T;
  /**
   * Converts an iterable of key/value entries to a new shallow Map when the condition evaluates to
   * `true`. Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toMap`. Consumes synchronous entries; duplicate keys keep their first
   * position and take the last value. Nullish input creates an empty Map. Non-iterable objects are
   * not converted into entries. Requires native `Map`; missing support does not prevent loading.
   * Requested conversion throws `TypeError` before inspecting the input when it is unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new Map when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toMap` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tomapifvalue-condition
   */
  function toMapIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | ConvertedMap<T>;
  /**
   * Converts an iterable of values to a new shallow Set when the condition evaluates to `true`.
   * Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toSet`. Consumes synchronous values and removes duplicates without
   * coercion. Strings yield Unicode code points. Nullish input creates an empty Set; non-iterable
   * scalars and array-like objects throw. Requires native `Set`; missing support does not prevent
   * loading. Requested conversion throws `TypeError` before inspecting the input when it is
   * unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new Set when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toSet` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosetifvalue-condition
   */
  function toSetIf<T>(value: T, condition: true): ConvertedSet<T>;
  /**
   * Converts an iterable of values to a new shallow Set when the condition evaluates to `true`.
   * Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toSet`. Consumes synchronous values and removes duplicates without
   * coercion. Strings yield Unicode code points. Nullish input creates an empty Set; non-iterable
   * scalars and array-like objects throw. Requires native `Set`; missing support does not prevent
   * loading. Requested conversion throws `TypeError` before inspecting the input when it is
   * unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new Set when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toSet` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosetifvalue-condition
   */
  function toSetIf<T>(value: T, condition?: false): T;
  /**
   * Converts an iterable of values to a new shallow Set when the condition evaluates to `true`.
   * Otherwise, returns the original value unchanged.
   *
   * Calls a predicate once. A skipped conversion preserves the input without inspection. Invalid
   * conditions or non-boolean predicate results throw `TypeError`.
   *
   * Requested conversion uses `toSet`. Consumes synchronous values and removes duplicates without
   * coercion. Strings yield Unicode code points. Nullish input creates an empty Set; non-iterable
   * scalars and array-like objects throw. Requires native `Set`; missing support does not prevent
   * loading. Requested conversion throws `TypeError` before inspecting the input when it is
   * unavailable.
   *
   * @param value The value to convert.
   * @param condition A boolean or synchronous predicate called once with the original value. Omitted
   * or `undefined` skips conversion; a predicate must return a primitive boolean.
   * @returns A new Set when conversion is requested; otherwise the original input, unchanged.
   * @throws Invalid conditions or non-boolean predicate results throw `TypeError`. Predicate errors
   * propagate. A requested conversion also follows `toSet` error behaviour; a skipped conversion
   * does not inspect or coerce the value.
   * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#tosetifvalue-condition
   */
  function toSetIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | ConvertedSet<T>;
}
export = Types;
