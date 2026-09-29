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
    type PredicateMatcher = { readonly predicate: (value: unknown) => boolean; readonly instanceOf?: never };
    type InstanceMatcher = { readonly instanceOf: Function; readonly predicate?: never };
    type TypeMatcher = TypeName | (String & object) | Function | null | undefined | PredicateMatcher | InstanceMatcher | readonly TypeMatcher[];
    type NarrowingMatcher = PrimitiveTypeName | null | undefined |
        { readonly predicate: TypeGuard<unknown>; readonly instanceOf?: never } | readonly NarrowingMatcher[];
    type Matched<S> = S extends PrimitiveTypeName ? PrimitiveTypeMap[S] :
        S extends null | undefined ? S :
        S extends { readonly predicate: TypeGuard<infer T> } ? T :
        S extends readonly (infer Item)[] ? Matched<Item> : never;
    /** Common structural surface; includes number and bigint typed arrays, not DataView.
     * Specific element-type guards are intentionally outside this API. */
    interface TypedArray extends ArrayBufferView {
        readonly length: number;
        readonly BYTES_PER_ELEMENT: number;
        [index: number]: number | bigint;
    }
    function isUndefined(value: unknown): value is undefined;
    function isNull(value: unknown): value is null;
    /** Native identity checks return boolean: structural types do not encode internal slots. */
    function isBoolean(value: unknown): boolean;
    function isNumber(value: unknown): boolean;
    function isString(value: unknown): boolean;
    function isSymbol(value: unknown): value is symbol;
    function isBigInt(value: unknown): value is bigint;
    function isPrimitive(value: unknown): value is undefined | null | boolean | number | string | symbol | bigint;
    function isNullish(value: unknown): value is null | undefined;
    function isEmpty(value: unknown): boolean;
    function isBlank(value: unknown): boolean;
    function isTruthy(value: unknown): boolean;
    function isFalsy(value: unknown): boolean;
    function isInteger(value: unknown): boolean;
    function isSafeInteger(value: unknown): boolean;
    function isFloat(value: unknown): boolean;
    function isFinite(value: unknown): boolean;
    function isInfinite(value: unknown): boolean;
    function isNaN(value: unknown): boolean;
    function isNumeric(value: unknown): boolean;
    /** Only fixed exact primitive matchers narrow. Dynamic specifications and collections return boolean. */
    function isTypeOf(value: unknown, type: 'boolean'): value is boolean;
    function isTypeOf(value: unknown, type: 'number'): value is number;
    function isTypeOf(value: unknown, type: 'bigint'): value is bigint;
    function isTypeOf(value: unknown, type: 'string'): value is string;
    function isTypeOf(value: unknown, type: 'symbol'): value is symbol;
    function isTypeOf(value: unknown, type: null): value is null;
    function isTypeOf(value: unknown, type: undefined): value is undefined;
    function isTypeOf(value: unknown): value is undefined;
    function isTypeOf(value: unknown, type: TypeMatcher): boolean;
    function isObject(value: unknown): boolean;
    function isPlainObject(value: unknown): boolean;
    function isCyclic(value: unknown): boolean;
    function isIterable(value: unknown): boolean;
    function isArray(value: unknown): boolean;
    function isArrayOf(value: unknown, type?: TypeMatcher): boolean;
    function isArrayLike(value: unknown): boolean;
    function isArrayLikeOf(value: unknown, type?: TypeMatcher): boolean;
    function isPair(value: unknown): boolean;
    function isMap(value: unknown): boolean;
    function isSet(value: unknown): boolean;
    function isWeakMap(value: unknown): boolean;
    function isWeakSet(value: unknown): boolean;
    function isFunction(value: unknown): boolean;
    function isDate(value: unknown): boolean;
    function isValidDate(value: unknown): boolean;
    function isInvalidDate(value: unknown): boolean;
    function isRegExp(value: unknown): boolean;
    function isPromise(value: unknown): boolean;
    function isPromiseLike(value: unknown): boolean;
    function isThenable(value: unknown): boolean;
    function isError(value: unknown): boolean;
    function isNode(value: unknown): boolean;
    function isElement(value: unknown): boolean;
    function isFragment(value: unknown): boolean;
    function isArrayBuffer(value: unknown): boolean;
    function isSharedArrayBuffer(value: unknown): boolean;
    function isArrayBufferView(value: unknown): boolean;
    function isTypedArray(value: unknown): boolean;
    function isDataView(value: unknown): boolean;
    function isAsyncIterable(value: unknown): boolean;
    function isIteratorLike(value: unknown): boolean;
    function isNonNullish<T>(value: T): value is NonNullable<T>;
    function isObjectLike(value: unknown): boolean;
    function isNonEmptyArray(value: unknown): boolean;
    function isJson(value: unknown): boolean;
    function createTypeChecker(type: 'boolean'): TypeGuard<boolean>;
    function createTypeChecker(type: 'number'): TypeGuard<number>;
    function createTypeChecker(type: 'bigint'): TypeGuard<bigint>;
    function createTypeChecker(type: 'string'): TypeGuard<string>;
    function createTypeChecker(type: 'symbol'): TypeGuard<symbol>;
    function createTypeChecker(type: null): TypeGuard<null>;
    function createTypeChecker(type: undefined): TypeGuard<undefined>;
    function createTypeChecker(): TypeGuard<undefined>;
    function createTypeChecker(type: TypeMatcher): (value: unknown) => boolean;
    function isSetOf(value: unknown, type?: TypeMatcher): boolean;
    function isMapOf(value: unknown, keyType?: TypeMatcher, valueType?: TypeMatcher): boolean;
    function isEmptyIterable(value: unknown): boolean;
    function isBlankIterable(value: unknown): boolean;
    /** Conditions must be primitive booleans or synchronous boolean predicates. */
    type ConversionCondition<T> = boolean | ((value: T) => boolean);
    /** Prefer the iterable element type, matching Array.from's protocol precedence. */
    type ArrayElement<T> = T extends Iterable<infer Item> ? Item :
        T extends ArrayLike<infer Item> ? Item : unknown;
    /** Native Object conversion preserves objects and boxes non-nullish primitives. */
    type ConvertedObject<T> = T extends null | undefined ? object : T extends object ? T :
        T extends string ? String : T extends number ? Number : T extends boolean ? Boolean :
        T extends bigint ? BigInt : T extends symbol ? Symbol : object;

    function toArray<T>(value: T): ArrayElement<T>[];
    function toBigInt(value?: unknown): bigint;
    function toBoolean(value?: unknown): boolean;
    /** Genuine Dates retain identity at runtime; structural subtypes may create a new Date. */
    function toDate(value?: unknown): Date;
    function toInteger(value?: unknown): number;
    function toNumber(value?: unknown): number;
    function toObject<T>(value: T): ConvertedObject<T>;
    function toObject(): object;
    function toString(value?: unknown): string;
    function toSymbol(value?: unknown): symbol;
    function toArrayIf<T>(value: T, condition: true): ArrayElement<T>[];
    function toArrayIf<T>(value: T, condition?: false): T;
    function toArrayIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | ArrayElement<T>[];
    function toBigIntIf<T>(value: T, condition: true): bigint;
    function toBigIntIf<T>(value: T, condition?: false): T;
    function toBigIntIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | bigint;
    function toBooleanIf<T>(value: T, condition: true): boolean;
    function toBooleanIf<T>(value: T, condition?: false): T;
    function toBooleanIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | boolean;
    function toDateIf<T>(value: T, condition: true): Date;
    function toDateIf<T>(value: T, condition?: false): T;
    function toDateIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | Date;
    function toIntegerIf<T>(value: T, condition: true): number;
    function toIntegerIf<T>(value: T, condition?: false): T;
    function toIntegerIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | number;
    function toNumberIf<T>(value: T, condition: true): number;
    function toNumberIf<T>(value: T, condition?: false): T;
    function toNumberIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | number;
    function toObjectIf<T>(value: T, condition: true): ConvertedObject<T>;
    function toObjectIf<T>(value: T, condition?: false): T;
    function toObjectIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | ConvertedObject<T>;
    function toStringIf<T>(value: T, condition: true): string;
    function toStringIf<T>(value: T, condition?: false): T;
    function toStringIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | string;
    function toSymbolIf<T>(value: T, condition: true): symbol;
    function toSymbolIf<T>(value: T, condition?: false): T;
    function toSymbolIf<T>(value: T, condition: ConversionCondition<T> | undefined): T | symbol;
}
export = Types;
