var isObjectLike = require('./isObjectLike');
var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var functionToString = Function.prototype.toString;
var objectConstructorSource = functionToString.call(Object);

/**
 * Determines whether a value has a null or ordinary `Object` prototype.
 *
 * Checks the current prototype, not allocation history or a schema. Proxy traps may run; an own
 * `constructor` field is not read.
 *
 * @param {*} value The value to check.
 * @returns {boolean} `true` if the value has a null or ordinary `Object` prototype; otherwise
 * `false`.
 * @throws {*} Property getters or proxy traps may throw; their errors propagate.
 * @see https://github.com/koyote130708/go-types/blob/master/docs/API.md#isplainobjectvalue
 * @example isPlainObject({constructor:null});   // => true
 * @example isPlainObject(Object.create(null));  // => true
 * @example isPlainObject(new (class A {})());   // => false
 */
function isPlainObject(value) {
  // Inspect the actual prototype, not value.constructor (ordinary user data).
  // Null-prototype dictionaries and ordinary object prototypes from other realms are supported.
  if (!isObjectLike(value)) {
    return false;
  }
  var prototype = getPrototypeOf(value);
  if (prototype === null) {
    return true;
  }
  if (getPrototypeOf(prototype) !== null) {
    return false;
  }
  var descriptor = getOwnPropertyDescriptor(prototype, 'constructor');
  return (
    !!descriptor &&
    typeof descriptor.value === 'function' &&
    descriptor.value.prototype === prototype &&
    functionToString.call(descriptor.value) === objectConstructorSource
  );
}

module.exports = isPlainObject;
