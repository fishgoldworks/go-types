import Types from 'go-types';
import Bundled, { isArray, toSet } from 'go-types/dist/go-types.mjs';

type IsAny<T> = 0 extends 1 & T ? true : false;
type NotAny<T extends false> = T;
type BundleIsTyped = NotAny<IsAny<typeof Bundled>>;
type NamedExportIsTyped = NotAny<IsAny<typeof toSet>>;

const bundle: typeof Types = Bundled;
if (Object.keys(bundle).sort().join(',') !== Object.keys(Types).sort().join(',')) {
  throw new Error('ESM bundle API inventory differs from the root import');
}
const values: Set<number> = toSet([1, 1, 2]);
if (isArray !== bundle.isArray || toSet !== bundle.toSet || !isArray([]) || isArray({}) || values.size !== 2) {
  throw new Error('ESM bundle behaviour differs from its declarations');
}
if (false) {
  // @ts-expect-error Unknown exports must not silently become any.
  bundle.missingExport();
  // @ts-expect-error Collection conversion preserves the element type.
  const strings: Set<string> = toSet([1]);
}
