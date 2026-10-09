import { toObject, toObjectIf, toDate } from 'go-types';
import focusedObject from 'go-types/toObject';
import focusedObjectIf from 'go-types/conversion/toObjectIf';

const text: string & { readonly length: number } = 'abc';
// @ts-expect-error the ESM root must not claim boxing returns a primitive.
const primitiveRoot: string = toObject(text);
// @ts-expect-error the focused ESM signature must use the corrected root helper type.
const primitiveFocused: string = focusedObject(text);
// @ts-expect-error conversion-directory aliases must not retain the primitive type.
const primitiveConditional: string = focusedObjectIf(text, true);
const converted: String = toObject(text);
const conditional: string | String = toObjectIf(text, () => true);
const skipped: typeof text = focusedObjectIf(text, false);
const date: Date = toDate(0);
