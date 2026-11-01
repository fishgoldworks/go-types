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

// Unpublished container-combination helpers are outside the public API.
// @ts-expect-error The non-empty-array helper is not exported.
Types.isNonEmptyArray([]);
// @ts-expect-error Map combinations remain caller-owned.
Types.isNonEmptyMap(new Map());
// @ts-expect-error Set combinations remain caller-owned.
Types.isNonEmptySet(new Set());
// @ts-expect-error Plain-object combinations remain caller-owned.
Types.isNonEmptyPlainObject({});
// @ts-expect-error Removed function subpaths have no default ESM declaration.
import removedArray from 'go-types/isNonEmptyArray';
// @ts-expect-error Removed function subpaths have no named ESM declaration.
import { isNonEmptyArray as removedNamedArray } from 'go-types/isNonEmptyArray';
// @ts-expect-error Removed source aliases have no ESM declarations.
import removedSourceArray from 'go-types/src/isNonEmptyArray.js';

// Consuming iterable checks are outside the public API.
// @ts-expect-error Consuming iterable checks are not root exports.
Types.isEmptyIterable([]);
// @ts-expect-error Removed root functions have no named declaration.
import { isEmptyIterable as removedRootisEmptyIterable } from 'go-types';
// @ts-expect-error Removed function subpaths have no default ESM declaration.
import removedisEmptyIterable from 'go-types/isEmptyIterable';
// @ts-expect-error Removed function subpaths have no named ESM declaration.
import { isEmptyIterable as removedNamedisEmptyIterable } from 'go-types/isEmptyIterable';
// @ts-expect-error Removed source aliases have no declarations.
import removedSourceisEmptyIterable from 'go-types/src/isEmptyIterable.js';
// @ts-expect-error Consuming iterable checks are not root exports.
Types.isBlankIterable([]);
// @ts-expect-error Removed root functions have no named declaration.
import { isBlankIterable as removedRootisBlankIterable } from 'go-types';
// @ts-expect-error Removed function subpaths have no default ESM declaration.
import removedisBlankIterable from 'go-types/isBlankIterable';
// @ts-expect-error Removed function subpaths have no named ESM declaration.
import { isBlankIterable as removedNamedisBlankIterable } from 'go-types/isBlankIterable';
// @ts-expect-error Removed source aliases have no declarations.
import removedSourceisBlankIterable from 'go-types/src/isBlankIterable.js';

// DocumentFragment checking uses the explicit native type name.
import { isDocumentFragment as rootDocumentFragment } from 'go-types';
import isDocumentFragment, { isDocumentFragment as namedDocumentFragment } from 'go-types/isDocumentFragment';
const rootFragmentResult: boolean = rootDocumentFragment({});
const namedFragmentResult: boolean = namedDocumentFragment({});
const namespaceFragmentResult: boolean = Types.isDocumentFragment({});
const focusedFragmentResult: boolean = isDocumentFragment({});
// @ts-expect-error isFragment has been renamed.
Types.isFragment({});
// @ts-expect-error The previous name is not a root export.
import { isFragment as oldRootFragment } from 'go-types';
// @ts-expect-error Renamed function subpaths have no default ESM declaration.
import oldFragment from 'go-types/isFragment';
// @ts-expect-error Renamed function subpaths have no named ESM declaration.
import { isFragment as oldNamedFragment } from 'go-types/isFragment';
// @ts-expect-error Renamed source aliases have no declaration.
import oldSourceFragment from 'go-types/src/isFragment.js';

// Circular-reference checking has one public name.
import { isCircular as rootCircular } from 'go-types';
import isCircular, { isCircular as namedCircular } from 'go-types/isCircular';
const rootCircularResult: boolean = rootCircular({});
const namedCircularResult: boolean = namedCircular({});
const namespaceCircularResult: boolean = Types.isCircular({});
const focusedCircularResult: boolean = isCircular({});
// @ts-expect-error isCyclic has been renamed.
Types.isCyclic({});
// @ts-expect-error The previous name is not a root export.
import { isCyclic as oldRootCyclic } from 'go-types';
// @ts-expect-error The previous function subpath has no default declaration.
import oldCyclic from 'go-types/isCyclic';
// @ts-expect-error The previous function subpath has no named declaration.
import { isCyclic as oldNamedCyclic } from 'go-types/isCyclic';
// @ts-expect-error The previous source alias has no declaration.
import oldSourceCyclic from 'go-types/src/isCyclic.js';
