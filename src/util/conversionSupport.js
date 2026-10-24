'use strict';
const isString = require('../isString');
const isNumber = require('../isNumber');
const isBoolean = require('../isBoolean');
const isDate = require('../isDate');
const isRegExp = require('../isRegExp');
const hasNativeBrand = require('./hasNativeBrand');
const bigintValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : undefined;
let symbolValueOf = typeof Symbol === 'function' ? Symbol.prototype.valueOf : undefined;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const getOwnPropertySymbols = Object.getOwnPropertySymbols;
const reflectOwnKeys = typeof Reflect === 'object' && Reflect !== null ? Reflect.ownKeys : undefined;
let iteratorKey = typeof Symbol === 'function' ? Symbol.iterator : undefined;

function ownKeys(value) {
  if (typeof reflectOwnKeys === 'function') return reflectOwnKeys(value);
  if (typeof getOwnPropertySymbols !== 'function') {
    throw new TypeError(
      'Record conversion requires Reflect.ownKeys or Object.getOwnPropertySymbols to copy properties.'
    );
  }
  return getOwnPropertyNames(value).concat(getOwnPropertySymbols(value));
}

// Recover the intrinsic key when a host removes the optional Symbol global.
if (
  iteratorKey === undefined &&
  (typeof reflectOwnKeys === 'function' || typeof getOwnPropertySymbols === 'function')
) {
  const keys = ownKeys(Array.prototype);
  for (let i = 0; i < keys.length; i++) {
    if (typeof keys[i] === 'symbol' && typeof getOwnPropertyDescriptor(Array.prototype, keys[i]).value === 'function') {
      iteratorKey = keys[i];
      break;
    }
  }
}

if (symbolValueOf === undefined && typeof iteratorKey === 'symbol') {
  symbolValueOf = Object.getPrototypeOf(iteratorKey).valueOf;
}

function isUnsupportedObject(value) {
  return (
    isString(value) ||
    isNumber(value) ||
    isBoolean(value) ||
    isDate(value) ||
    isRegExp(value) ||
    hasNativeBrand(value, symbolValueOf) ||
    hasNativeBrand(value, bigintValueOf)
  );
}
module.exports = { ownKeys, iteratorKey, isUnsupportedObject };
