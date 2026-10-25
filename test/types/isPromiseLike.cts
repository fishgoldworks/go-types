import Types = require('go-types');
import isPromiseLike = require('go-types/isPromiseLike');
const result: boolean = isPromiseLike({ then() {} });

export function inspect(value: unknown): boolean {
  if (Types.isPromiseLike(value)) {
    // @ts-expect-error Method presence does not establish the full PromiseLike contract.
    const promise: PromiseLike<unknown> = value;
    void promise;
  }
  return isPromiseLike(value);
}

// @ts-expect-error The duplicate root function has been removed.
void Types.isThenable;
// @ts-expect-error The duplicate focused entry has been removed.
import removed = require('go-types/isThenable');
// @ts-expect-error The duplicate source compatibility entry has been removed.
import removedSource from 'go-types/src/isThenable.js';
