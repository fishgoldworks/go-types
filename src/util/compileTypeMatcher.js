'use strict';

const typeChecks = Object.freeze({
  __proto__: null,
  undefined: (value) => typeof value === 'undefined',
  object: (value) => typeof value === 'object',
  boolean: (value) => typeof value === 'boolean',
  number: (value) => typeof value === 'number',
  bigint: (value) => typeof value === 'bigint',
  string: (value) => typeof value === 'string',
  symbol: (value) => typeof value === 'symbol',
  function: (value) => typeof value === 'function'
});

// Validate configuration before inspecting a collection; never probe callbacks.
function compileTypeMatcher(matcher) {
  if (typeof matcher === 'string') {
    const check = typeChecks[matcher];
    if (check) return check;
  } else if (typeof matcher === 'function') {
    return (value) => !!matcher(value);
  }
  throw new TypeError('Expected a native typeof name or a synchronous predicate.');
}
module.exports = compileTypeMatcher;
