import T, { isBoolean, isArrayBufferView, toDate } from 'go-types';
import booleanCheck from 'go-types/isBoolean';
import viewCheck from 'go-types/src/isArrayBufferView.js';
import convertDate from 'go-types/conversion/toDate';
import sourceDate from 'go-types/src/conversion/toDate.js';
function expectType<V>(_value: V): void {}
export function checks(value: Boolean | string, view: ArrayBufferView | string) {
  if (!isBoolean(value)) {
    // @ts-expect-error the structural Boolean is still possible.
    value.toUpperCase();
  }
  if (!booleanCheck(value)) {
    // @ts-expect-error focused imports preserve the conservative return contract.
    value.toUpperCase();
  }
  if (!isArrayBufferView(view)) {
    // @ts-expect-error the structural view is still possible.
    view.toUpperCase();
  }
  if (!viewCheck(view)) {
    // @ts-expect-error source aliases preserve the conservative return contract.
    view.toUpperCase();
  }
}
const wrapped = new Proxy(Object.assign(new Date(0), { label: 'x' }), {});
expectType<Date>(toDate(wrapped));
// @ts-expect-error root named exports do not retain structural subtypes.
void toDate(wrapped).label;
// @ts-expect-error default namespace does not retain structural subtypes.
void T.toDate(wrapped).label;
// @ts-expect-error focused conversion exports do not retain structural subtypes.
void convertDate(wrapped).label;
// @ts-expect-error source aliases do not retain structural subtypes.
void sourceDate(wrapped).label;
