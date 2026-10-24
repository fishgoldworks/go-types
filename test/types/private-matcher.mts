import Types from 'go-types';
// @ts-expect-error The matcher compiler is not a named root export.
import { createTypeChecker } from 'go-types';
// @ts-expect-error The matcher compiler is not a default namespace member.
void Types.createTypeChecker;
// @ts-expect-error The retired focused entry is not part of the package.
import checker from 'go-types/createTypeChecker';
// @ts-expect-error The retired source compatibility entry is not part of the package.
import sourceChecker from 'go-types/src/createTypeChecker.js';
// @ts-expect-error Private implementation modules are not public ESM entries.
import internal from 'go-types/src/util/compileTypeMatcher';
