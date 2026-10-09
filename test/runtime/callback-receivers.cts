import Types, { type Matched, type NarrowingMatcher } from 'go-types';

function receiverGuard(this: { enabled: boolean }, value: unknown): value is number {
  return this.enabled && typeof value === 'number';
}
// @ts-expect-error Matcher callbacks cannot require an object receiver.
const invalidMatcher: NarrowingMatcher = { predicate: receiverGuard };
// @ts-expect-error The general matcher has the same callback contract.
const invalidGeneral: Types.TypeMatcher = { predicate: receiverGuard };

function ordinary(value: unknown): value is number {
  return typeof value === 'number';
}
function receiverFree(this: void, value: unknown): value is number {
  return typeof value === 'number';
}
function undefinedReceiver(this: undefined, value: unknown): value is number {
  return this === undefined && typeof value === 'number';
}
const descriptor = { predicate: undefinedReceiver };
type Inferred = Matched<typeof descriptor>;
const inferred: Inferred = 1;
// @ts-expect-error Matched preserves the predicate's number result.
const wrongInferred: Inferred = 'text';

for (const predicate of [ordinary, receiverFree, undefinedReceiver]) {
  const matcher: NarrowingMatcher = { predicate };
  const check = Types.createTypeChecker(matcher);
  if (!check(1) || check('1')) throw new Error('Receiver-free matcher failed');
}
const generated: Types.TypeGuard<number> = Types.createTypeChecker('number');
const holder = { check: generated };
const bound = receiverGuard.bind({ enabled: true });
if (
  !generated(inferred) ||
  generated('text') ||
  !Types.createTypeChecker('number')(1) ||
  !holder.check(1) ||
  !Types.createTypeChecker({ predicate: bound })(1)
) {
  throw new Error('Valid matcher invocation changed');
}
void invalidMatcher;
void invalidGeneral;
void wrongInferred;
