'use strict';

// Workloads are shared independently of timing and reporting.
module.exports = function createCases(T) {
  const objects = [{}, [], null, Object.create(null), new Date(), new Number(1)];
  const numbers = [0, 1.5, NaN, Infinity, -0, new Number(3), {}, '3'];
  const predicate = (value) => typeof value === 'number' || value === null || typeof value === 'string';
  return [
    ['Array.isArray / mixed objects', (index) => Array.isArray(objects[index % objects.length])],
    ['isArray / same mixed objects', (index) => T.isArray(objects[index % objects.length])],
    ['isNumber / primitives, boxed values and negatives', (index) => T.isNumber(numbers[index % numbers.length])],
    ['isMap / ordinary-object negatives', (index) => T.isMap(objects[index % objects.length])],
    ['isArrayOf / composed predicate', (index) => T.isArrayOf([numbers[index % numbers.length]], predicate)],
    ['isArrayOf / valid numeric collection', () => T.isArrayOf([1, 2, 3, 4], 'number')],
    ['isNonNullish / primitive mix', (index) => T.isNonNullish(numbers[index % numbers.length])]
  ];
};
