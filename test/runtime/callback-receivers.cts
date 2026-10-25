import Types from 'go-types';
function receiverGuard(this: { enabled: boolean }, value: unknown): value is number {
  return this.enabled && typeof value === 'number';
}
// @ts-expect-error Matcher callbacks cannot require an object receiver.
const invalidMatcher: Types.TypeMatcher = receiverGuard;
function ordinary(value: unknown): value is number {
  return typeof value === 'number';
}
function receiverFree(this: void, value: unknown): value is number {
  return typeof value === 'number';
}
function undefinedReceiver(this: undefined, value: unknown): value is number {
  return this === undefined && typeof value === 'number';
}
for (const predicate of [ordinary, receiverFree, undefinedReceiver]) {
  const matcher: Types.TypeMatcher = predicate;
  if (!Types.isArrayOf([1], matcher) || Types.isArrayOf(['1'], matcher))
    throw new Error('Receiver-free matcher failed');
}
const guard: Types.TypeGuard<number> = (value: unknown): value is number => typeof value === 'number';
const holder = { check: guard };
const bound = receiverGuard.bind({ enabled: true });
if (!guard(1) || guard('text') || !holder.check(1) || !Types.isArrayOf([1], bound)) {
  throw new Error('Valid matcher invocation changed');
}
void invalidMatcher;
