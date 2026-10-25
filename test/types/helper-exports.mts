import Types from 'go-types';
import type {
  TypeName,
  TypeGuard,
  TypeMatcher,
  TypedArray,
  ConversionCondition,
  ArrayElement,
  ConvertedMap,
  ConvertedSet,
  ConvertedPlainObject,
  Boxed,
  Unboxed
} from 'go-types';

type Equal<A, B> = (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2 ? true : false;
type Expect<V extends true> = V;
type PublicHelpers = [
  TypeName,
  TypeGuard<number>,
  TypeMatcher,
  TypedArray,
  ConversionCondition<string>,
  ArrayElement<readonly number[]>,
  ConvertedMap<ReadonlyMap<string, number>>,
  ConvertedSet<readonly number[]>,
  ConvertedPlainObject<number>,
  Boxed<number>,
  Unboxed<Number>
];
type NamespaceHelpers = [
  Types.TypeName,
  Types.TypeGuard<number>,
  Types.TypeMatcher,
  Types.TypedArray,
  Types.ConversionCondition<string>,
  Types.ArrayElement<readonly number[]>,
  Types.ConvertedMap<ReadonlyMap<string, number>>,
  Types.ConvertedSet<readonly number[]>,
  Types.ConvertedPlainObject<number>,
  Types.Boxed<number>,
  Types.Unboxed<Number>
];
// Every public namespace helper must also be available as a named type import.
type HelperParity = Expect<Equal<PublicHelpers, NamespaceHelpers>>;
const nativeName: TypeMatcher = 'number';
const predicate: TypeMatcher = (value) => typeof value === 'number';
// @ts-expect-error TypeMatcher accepts only known native names and predicates.
const invalidMatcher: TypeMatcher = 'Number';
