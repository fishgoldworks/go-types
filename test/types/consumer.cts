import Types = require('go-types');
const check = Types.createTypeChecker('number');
const result: number[] = [1,'x',null].filter(check);
const present: (number | string)[] = [1, '', null, undefined].filter(Types.isNonNullish);
const valid: boolean = Types.isMapOf(new Map([['x',1]]),'string','number');
const converted: number = Types.toNumber('1');
const conditional: string | number = Types.toNumberIf('1', () => true);
import convert = require('go-types/src/conversion/toNumber');
const fromSubpath: number = convert('2');

import arrayCheck = require('go-types/isArray');
const isArrayResult: boolean = arrayCheck([]);
