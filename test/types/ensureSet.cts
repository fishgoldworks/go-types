import Types = require('go-types');
import ensureSet = require('go-types/ensureSet');

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
const scalar: Set<string> = ensureSet('read');
const numbers = ensureSet([1, 2]);
type Numbers = Expect<Equal<typeof numbers, Set<number>>>;
const readonlyArray: readonly number[] = [1, 2];
const arrayResult: Set<number> = ensureSet(readonlyArray);
arrayResult.add(3);
const tuple = [1, 'x'] as const;
const tupleResult = ensureSet(tuple);
type TupleMembers = Expect<Equal<typeof tupleResult, Set<1 | 'x'>>>;
const existing = new Set<number>();
const preserved: Set<number> = ensureSet(existing);
declare const readonlySet: ReadonlySet<number>;
const readonlyResult = ensureSet(readonlySet);
type ReadonlyMembers = Expect<Equal<typeof readonlyResult, ReadonlySet<number>>>;
// @ts-expect-error Preserving a readonly Set does not provide a mutable copy.
readonlyResult.add(3);
const mapResult: Set<Map<string, number>> = ensureSet(new Map<string, number>());
const pending: Set<Promise<number>> = ensureSet(Promise.resolve(1));
const record: Set<{ id: number }> = ensureSet({ id: 1 });
const nullMember: Set<null> = ensureSet(null);
const undefinedMember: Set<undefined> = ensureSet(undefined);
const empty: Set<unknown> = ensureSet();
const typedEmpty: Set<number> = ensureSet<number>();
typedEmpty.add(1);
// @ts-expect-error The typed empty Set keeps its member type.
typedEmpty.add('x');
// @ts-expect-error Explicit undefined is not a selected number member.
ensureSet<number>(undefined);
// @ts-expect-error This is not a variadic member constructor.
ensureSet(1, 2);
declare const mixed: number | readonly number[] | ReadonlySet<number>;
const mixedResult = ensureSet(mixed);
type Mixed = Expect<Equal<typeof mixedResult, Set<number> | ReadonlySet<number>>>;
declare const opaque: object;
const opaqueResult: ReadonlySet<unknown> = ensureSet(opaque);
// @ts-expect-error An object-typed input can preserve readonly Sets.
opaqueResult.add(1);
declare const unknownInput: unknown;
const unknownResult: ReadonlySet<unknown> = ensureSet(unknownInput);
class NamedSet extends Set<number> {
  label = 'members';
}
const subclassResult = ensureSet(new NamedSet());
// @ts-expect-error Native identity does not prove structural subtype properties.
const label: string = subclassResult.label;
const mapped: Set<number>[] = [1, 2].map((value) => ensureSet(value));
const directMapped: ReadonlySet<unknown>[] = [1, 2].map(ensureSet);
// @ts-expect-error No conditional counterpart is public.
Types.ensureSetIf(1, true);
// @ts-expect-error No Map normaliser is public.
Types.ensureMap({ a: 1 });
// @ts-expect-error No plain-object normaliser is public.
Types.ensurePlainObject({ a: 1 });

const alternateArray = Object.assign([1, 2], {
  [Symbol.iterator]: function* () {
    yield 'custom';
  }
});
const alternateMembers: Set<string> = ensureSet(alternateArray);

declare const readonlyMap: ReadonlyMap<string, number>;
const readonlyMapMember: Set<ReadonlyMap<string, number>> = ensureSet(readonlyMap);
