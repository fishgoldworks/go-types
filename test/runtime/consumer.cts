import Types from 'go-types';
import toNumber from 'go-types/toNumber';
import { isArrayOf } from 'go-types';
const value: unknown = '42';
const converted: number = Types.toNumber(value);
if (converted !== 42 || toNumber !== Types.toNumber) throw new Error('Compiled default/focused imports differ');
if (!isArrayOf([1, 'x', null], (value) => typeof value === 'number' || typeof value === 'string' || value === null))
  throw new Error('Compiled collection predicate failed');
const original = {
  valueOf() {
    throw new Error('Skipped conversion must not coerce');
  }
};
if (Types.toBigIntIf(original, false) !== original) throw new Error('Compiled conditional conversion changed identity');

const emptyItems = Types.ensureArray<number>();
if (emptyItems.length !== 0 || Types.ensureArray(undefined).length !== 1 || Types.ensureArray(null).length !== 1)
  throw new Error('Compiled normalisation confused omission and nullish values');
emptyItems.push(1);

const userInputs: ({ id: number } | { id: number }[])[] = [{ id: 1 }, [{ id: 1 }]];
for (const input of userInputs) {
  const normalisedUsers: { id: number }[] = Types.ensureArray(input);
  if (normalisedUsers[0].id !== 1) throw new Error('Compiled item-or-array normalisation failed');
}
const selected = new Set([1, 2]);
const selectedItems: Set<number>[] = Types.ensureArray(selected);
if (selectedItems[0] !== selected) throw new Error('Compiled normalisation expanded a Set');
const mappedItems: number[][] = [1, 2].map((value) => Types.ensureArray(value));
if (mappedItems[1][0] !== 2) throw new Error('Compiled callback normalisation failed');

const permissionInputs: string | readonly string[] | ReadonlySet<string> = new Set(['read']);
const permissions: ReadonlySet<string> = Types.ensureSet(permissionInputs);
if (permissions !== permissionInputs || !permissions.has('read'))
  throw new Error('Compiled Set normalisation lost identity');
const permissionArray: Set<string> = Types.ensureSet(['read', 'read']);
if (permissionArray.size !== 1) throw new Error('Compiled Set normalisation did not deduplicate');
const permissionMap = new Map<string, number>();
const heldMaps: Set<Map<string, number>> = Types.ensureSet(permissionMap);
if (!heldMaps.has(permissionMap)) throw new Error('Compiled Set normalisation expanded a Map');
