'use strict';
const collectionInput = require('./collectionInput');
const isArray = Array.isArray;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

function* mapInput(value) {
  for (const pair of collectionInput(value, true)) {
    if (
      !isArray(pair) ||
      pair.length !== 2 ||
      !getOwnPropertyDescriptor(pair, '0') ||
      !getOwnPropertyDescriptor(pair, '1')
    ) {
      throw new TypeError('toMap entries must be two-element arrays with both elements present.');
    }
    // Snapshot the original getters once, in key/value order, before native Map insertion.
    yield [pair[0], pair[1]];
  }
}
module.exports = mapInput;
