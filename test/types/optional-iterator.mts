import T, { toArray, type ArrayElement } from 'go-types';
import focused from 'go-types/toArray';
import legacy from 'go-types/src/conversion/toArray.js';
function expectType<V>(_value: V): void {}
interface OptionalIterator extends ArrayLike<number> {
  [Symbol.iterator]?: () => IterableIterator<string>;
}
const input: OptionalIterator = {
  0: 1,
  length: 1,
  *[Symbol.iterator]() {
    yield 'text';
  }
};
expectType<unknown[]>(T.toArray(input));
expectType<unknown[]>(toArray(input));
expectType<unknown[]>(focused(input));
expectType<unknown[]>(legacy(input));
const inspect = (value: ArrayElement<OptionalIterator>) => {
  // @ts-expect-error exported helper does not assume numeric elements.
  value.toFixed();
};
// @ts-expect-error named ESM root must not infer a numeric array for this input.
expectType<number[]>(toArray(input));
// @ts-expect-error focused ESM entry must not infer a numeric array for this input.
expectType<number[]>(focused(input));
// @ts-expect-error legacy conversion alias uses the same declaration.
expectType<number[]>(legacy(input));
