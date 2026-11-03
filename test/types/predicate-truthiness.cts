import T = require('go-types');
function expectBoolean(_value: boolean): void {}
function expectType<T>(_value: T): void {}
expectBoolean(T.isArrayOf([1], () => 1));
expectBoolean(T.isArrayLikeOf({ length: 1 }, () => 'yes'));
expectBoolean(T.isSetOf(new Set([1]), () => undefined));
expectBoolean(
  T.isMapOf(
    new Map(),
    () => ({}),
    () => null
  )
);
expectBoolean(T.isArrayOf([1], async () => false));
T.isArrayOf([1], function (value) {
  expectType<undefined>(this);
  const input: unknown = value;
  return input;
});
// @ts-expect-error Conditional conversions are not public APIs.
void T.toArrayIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toBigIntIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toBooleanIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toDateIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toIntegerIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toJsonIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toMapIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toNumberIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toPlainObjectIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toSetIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toStringIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toSymbolIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.boxIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.unboxIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toRegExpIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.toPromiseIf;
// @ts-expect-error Conditional conversions are not public APIs.
void T.parseJsonIf;
