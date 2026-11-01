import Types, { ensureArray, isNotNullish } from 'go-types';
import focusedArray, { ensureArray as namedArray } from 'go-types/ensureArray';
const focusedResult: number[] = focusedArray([1]);
const namedResult: string[] = namedArray('x');
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

const mutable: number[] = [1, 2];
const mutableResult = ensureArray(mutable);
type MutableIdentity = Expect<Equal<typeof mutableResult, number[]>>;
const mutableLength: number = mutableResult.length;
const scalar: number = 1;
const scalarResult: number[] = ensureArray(scalar);
scalarResult.push(2);
const tuple = [1, 'x'] as const;
const tupleResult = ensureArray(tuple);
type TupleIdentity = Expect<Equal<typeof tupleResult, typeof tuple>>;
// @ts-expect-error Preserving an array does not remove its readonly restriction.
tupleResult.push(2);
const frozen: readonly number[] = Object.freeze([1, 2]);
const frozenResult = ensureArray(frozen);
type FrozenIdentity = Expect<Equal<typeof frozenResult, readonly number[]>>;
// @ts-expect-error A readonly input is not a mutable copy.
frozenResult[0] = 2;
declare const mixed: string | readonly number[];
const mixedResult = ensureArray(mixed);
type UnionResult = Expect<Equal<typeof mixedResult, string[] | readonly number[]>>;
const nullResult: null[] = ensureArray(null);
const undefinedResult: undefined[] = ensureArray(undefined);
const set = new Set([1, 2]);
const setResult: Set<number>[] = ensureArray(set);
const values = [0, false, '', null, undefined].filter(isNotNullish);
const present: (string | number | boolean)[] = values;
// @ts-expect-error Nullish filtering must exclude null and undefined.
const invalidPresent: null[] = values;
const empty: unknown[] = ensureArray();
empty.push('item');
const typedEmpty: number[] = ensureArray<number>();
typedEmpty.push(1);
// @ts-expect-error A typed empty array retains its selected element type.
typedEmpty.push('item');
// @ts-expect-error This is not a variadic item collector.
ensureArray(1, 2);
// @ts-expect-error The previous nullish name is not public.
Types.isNonNullish(1);
// @ts-expect-error The non-function-object check is internal.
Types.isObjectLike({});
// @ts-expect-error The internal helper is not a replacement public export.
Types.isNonFunctionObject({});

// @ts-expect-error This function subpath is not public.
import retiredisNonNullish from 'go-types/isNonNullish';
// @ts-expect-error This function subpath is not public.
import retiredisObjectLike from 'go-types/isObjectLike';
// @ts-expect-error This function subpath is not public.
import retiredisNonFunctionObject from 'go-types/isNonFunctionObject';
// @ts-expect-error This function subpath is not public.
import retiredensureArrayIf from 'go-types/ensureArrayIf';

declare const objectValue: object;
const objectResult = Types.ensureArray(objectValue);
// @ts-expect-error An object-typed input can be an array of primitive values.
const objectItems: object[] = objectResult;
// @ts-expect-error An object-typed input can be a readonly array.
objectResult.push({});
declare const unknownValue: unknown;
const unknownResult = Types.ensureArray(unknownValue);
// @ts-expect-error An unknown input can preserve a readonly array.
unknownResult.push(1);
declare const nonNullishValue: {};
const nonNullishResult = Types.ensureArray(nonNullishValue);
// @ts-expect-error Non-nullish object shape does not prove array element types.
const nonNullishItems: {}[] = nonNullishResult;
const imitation = Object.assign({}, [1], { label: 'items' });
const imitationResult = Types.ensureArray(imitation);
// @ts-expect-error Structural array shape does not establish native array identity.
imitationResult.label.toUpperCase();

interface User {
  id: number;
}
declare const itemOrItems: User | User[];
const users = ensureArray(itemOrItems);
type Users = Expect<Equal<typeof users, User[]>>;
declare const readonlyItemOrItems: User | readonly User[];
const readonlyUsers = ensureArray(readonlyItemOrItems);
type ReadonlyUsers = Expect<Equal<typeof readonlyUsers, User[] | readonly User[]>>;
const oneUser = ensureArray({ id: 1 });
type OneUser = Expect<Equal<typeof oneUser, { id: number }[]>>;
const usersSet = ensureArray(new Set<User>());
type UsersSet = Expect<Equal<typeof usersSet, Set<User>[]>>;
const userMap = ensureArray(new Map<string, User>());
type UserMap = Expect<Equal<typeof userMap, Map<string, User>[]>>;
const pending = ensureArray(Promise.resolve(1));
type Pending = Expect<Equal<typeof pending, Promise<number>[]>>;
const optionalTuple: [number, string?] = [1];
const optionalResult = ensureArray(optionalTuple);
type OptionalTuple = Expect<Equal<typeof optionalResult, [number, string?]>>;
declare const restTuple: readonly [number, ...string[]];
const restResult = ensureArray(restTuple);
type RestTuple = Expect<Equal<typeof restResult, readonly [number, ...string[]]>>;
const mapped: number[][] = [1, 2].map((value) => ensureArray(value));
const directMapped: (readonly unknown[])[] = [1, 2].map(ensureArray);
// @ts-expect-error Explicitly selecting number does not permit an undefined item.
ensureArray<number>(undefined);
class NamedArray extends Array<number> {
  label = 'items';
}
const subclassResult = ensureArray(new NamedArray());
// @ts-expect-error Array normalisation does not promise custom subtype properties.
const invalidLabel: string = subclassResult.label;

// @ts-expect-error The draft normaliser name is not public.
Types.asArray(1);
// @ts-expect-error The draft normaliser subpath is not public.
import retiredArray from 'go-types/asArray';
