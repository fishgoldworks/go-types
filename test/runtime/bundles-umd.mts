import Types from 'go-types';
import Readable from 'go-types/dist/go-types.js';
import Minified from 'go-types/dist/go-types.min.js';
// @ts-expect-error The CommonJS bundle has no native ESM named function exports.
import type { isArray as ReadableIsArray } from 'go-types/dist/go-types.js';
// @ts-expect-error The minified CommonJS bundle has no native ESM named function exports.
import type { isArray as MinifiedIsArray } from 'go-types/dist/go-types.min.js';

type IsAny<T> = 0 extends 1 & T ? true : false;
type NotAny<T extends false> = T;
type ReadableIsTyped = NotAny<IsAny<typeof Readable>>;
type MinifiedIsTyped = NotAny<IsAny<typeof Minified>>;

const bundles: (typeof Types)[] = [Readable, Minified];
for (const bundle of bundles) {
  if (Object.keys(bundle).sort().join(',') !== Object.keys(Types).sort().join(',')) {
    throw new Error('Imported UMD bundle API inventory differs from the root import');
  }
  const values: Set<number> = bundle.toSet([1, 1, 2]);
  if (!bundle.isArray([]) || bundle.isArray({}) || values.size !== 2) {
    throw new Error('Imported UMD bundle behaviour differs from its declarations');
  }
}
