import Types = require('go-types');
import type {
  TypeName,
  PrimitiveTypeName,
  PrimitiveTypeMap,
  TypeGuard,
  PredicateMatcher,
  InstanceMatcher,
  TypeMatcher,
  NarrowingMatcher,
  Matched,
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
  PrimitiveTypeName,
  PrimitiveTypeMap,
  TypeGuard<number>,
  PredicateMatcher,
  InstanceMatcher,
  TypeMatcher,
  NarrowingMatcher,
  Matched<readonly ['number', null]>,
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
  Types.PrimitiveTypeName,
  Types.PrimitiveTypeMap,
  Types.TypeGuard<number>,
  Types.PredicateMatcher,
  Types.InstanceMatcher,
  Types.TypeMatcher,
  Types.NarrowingMatcher,
  Types.Matched<readonly ['number', null]>,
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
type NumberMapping = Expect<Equal<PrimitiveTypeMap['number'], number>>;
// @ts-expect-error the exported map must preserve the primitive types, not become any.
const invalidNumber: PrimitiveTypeMap['number'] = 'number';
