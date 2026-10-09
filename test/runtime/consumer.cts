import Types from 'go-types';
import toNumber from 'go-types/toNumber';
import { isArrayOf } from 'go-types';
const value: unknown = '42';
const converted: number = Types.toNumber(value);
if (converted !== 42 || toNumber !== Types.toNumber) throw new Error('Compiled default/focused imports differ');
if (!isArrayOf([1, 'x', null], [['number', 'string'], null])) throw new Error('Compiled nested matcher failed');
const original = {
  valueOf() {
    throw new Error('Skipped conversion must not coerce');
  }
};
if (Types.toBigIntIf(original, false) !== original) throw new Error('Compiled conditional conversion changed identity');
