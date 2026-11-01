'use strict';
// Exclude JavaScript functions while retaining the legacy document.all object.
function isNonFunctionObject(value) {
  const type = typeof value;
  return type === 'object' ? value !== null : type === 'undefined' && value !== undefined;
}
module.exports = isNonFunctionObject;
