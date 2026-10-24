import Types = require('go-types');
// @ts-expect-error The matcher compiler is internal, not a root export.
void Types.createTypeChecker;
// @ts-expect-error The internal compiler is not exposed under its implementation name.
void Types.compileTypeMatcher;
// @ts-expect-error The retired focused entry is not part of the package.
import checker = require('go-types/createTypeChecker');
// @ts-expect-error The retired source compatibility entry is not part of the package.
import sourceChecker = require('go-types/src/createTypeChecker');
// @ts-expect-error Private implementation modules have no public declarations.
import internal = require('go-types/src/util/compileTypeMatcher');
