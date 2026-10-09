'use strict';

// Workloads are shared independently of timing and reporting.
module.exports = function createCases(T) {
  const objects = [{}, [], null, Object.create(null), new Date(), new Number(1)];
  const numbers = [0, 1.5, NaN, Infinity, -0, new Number(3), {}, '3'];
  const specification = ['number', null, { predicate: (value) => typeof value === 'string' }];
  const compiled = T.createTypeChecker(specification);
  return [
    ['Array.isArray / mixed objects', (index) => Array.isArray(objects[index % objects.length])],
    ['isArray / same mixed objects', (index) => T.isArray(objects[index % objects.length])],
    ['isNumber / primitives, boxed values and negatives', (index) => T.isNumber(numbers[index % numbers.length])],
    ['isMap / ordinary-object negatives', (index) => T.isMap(objects[index % objects.length])],
    ['isTypeOf / validated union each call', (index) => T.isTypeOf(numbers[index % numbers.length], specification)],
    ['createTypeChecker / reused union checker', (index) => compiled(numbers[index % numbers.length])],
    ['isArrayOf / valid numeric collection', () => T.isArrayOf([1, 2, 3, 4], 'number')],
    ['isNonNullish / primitive mix', (index) => T.isNonNullish(numbers[index % numbers.length])]
  ];
};
