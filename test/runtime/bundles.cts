import Types = require('go-types');
import Readable = require('go-types/dist/go-types.js');
import Minified = require('go-types/dist/go-types.min.js');

type IsAny<T> = 0 extends 1 & T ? true : false;
type NotAny<T extends false> = T;
type ReadableIsTyped = NotAny<IsAny<typeof Readable>>;
type MinifiedIsTyped = NotAny<IsAny<typeof Minified>>;

const bundles: (typeof Types)[] = [Readable, Minified];
for (const bundle of bundles) {
  if (Object.keys(bundle).sort().join(',') !== Object.keys(Types).sort().join(',')) {
    throw new Error('CommonJS bundle API inventory differs from the root import');
  }
  const values: Set<number> = bundle.toSet([1, 1, 2]);
  if (!bundle.isArray([]) || bundle.isArray({}) || values.size !== 2) {
    throw new Error('CommonJS bundle behaviour differs from its declarations');
  }
}
if (false) {
  // @ts-expect-error Unknown exports must not silently become any.
  Readable.missingExport();
  // @ts-expect-error Collection conversion preserves the element type.
  const strings: Set<string> = Minified.toSet([1]);
}
