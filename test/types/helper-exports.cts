import Types = require('go-types');
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

// CommonJS subpaths return the callable directly, without a named property.
// @ts-expect-error Named function subpath imports require native ESM resolution.
import { isArray as unsupportedNamedArray } from 'go-types/isArray';
// @ts-expect-error CommonJS conversion subpaths also return the callable directly.
import { toNumber as unsupportedNamedConversion } from 'go-types/toNumber';

// Unpublished container-combination helpers are outside the public API.
// @ts-expect-error The non-empty-array helper is not exported.
Types.isNonEmptyArray([]);
// @ts-expect-error Map combinations remain caller-owned.
Types.isNonEmptyMap(new Map());
// @ts-expect-error Set combinations remain caller-owned.
Types.isNonEmptySet(new Set());
// @ts-expect-error Plain-object combinations remain caller-owned.
Types.isNonEmptyPlainObject({});
// @ts-expect-error Removed function subpaths have no CommonJS declarations.
import removedArray = require('go-types/isNonEmptyArray');
// @ts-expect-error Removed source aliases have no legacy declarations.
import removedSourceArray = require('go-types/src/isNonEmptyArray.js');

// Consuming iterable checks are outside the public API.
// @ts-expect-error Consuming iterable checks are not root exports.
Types.isEmptyIterable([]);
// @ts-expect-error Removed function subpaths have no CommonJS declarations.
import removedisEmptyIterable = require('go-types/isEmptyIterable');
// @ts-expect-error Removed source aliases have no declarations.
import removedSourceisEmptyIterable = require('go-types/src/isEmptyIterable.js');
// @ts-expect-error Consuming iterable checks are not root exports.
Types.isBlankIterable([]);
// @ts-expect-error Removed function subpaths have no CommonJS declarations.
import removedisBlankIterable = require('go-types/isBlankIterable');
// @ts-expect-error Removed source aliases have no declarations.
import removedSourceisBlankIterable = require('go-types/src/isBlankIterable.js');

// DocumentFragment checking uses the explicit native type name.
import isDocumentFragment = require('go-types/isDocumentFragment');
const namespaceFragmentResult: boolean = Types.isDocumentFragment({});
const focusedFragmentResult: boolean = isDocumentFragment({});
// @ts-expect-error isFragment has been renamed.
Types.isFragment({});
// @ts-expect-error Renamed function subpaths have no CommonJS declaration.
import oldFragment = require('go-types/isFragment');
// @ts-expect-error Renamed source aliases have no declaration.
import oldSourceFragment = require('go-types/src/isFragment.js');

// Circular-reference checking has one public name.
import isCircular = require('go-types/isCircular');
const namespaceCircularResult: boolean = Types.isCircular({});
const focusedCircularResult: boolean = isCircular({});
// @ts-expect-error isCyclic has been renamed.
Types.isCyclic({});
// @ts-expect-error The previous function subpath has no declaration.
import oldCyclic = require('go-types/isCyclic');
// @ts-expect-error The previous source alias has no declaration.
import oldSourceCyclic = require('go-types/src/isCyclic.js');
