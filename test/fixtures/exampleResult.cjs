'use strict';
const vm = require('node:vm');

function isExpectedResult(text) {
  if (/^throws (TypeError|RangeError|SyntaxError|Error)$/.test(text)) return true;
  try {
    new vm.Script('(' + text + '\n)');
    return true;
  } catch (error) {
    if (error instanceof SyntaxError) return false;
    throw error;
  }
}

// Keep executable results intact; separate a trailing prose note only when needed.
module.exports = function exampleResult(text) {
  if (isExpectedResult(text)) return text;
  const annotated = text.match(/^(.+?)\s+\([^()]+\)$/);
  return annotated && isExpectedResult(annotated[1]) ? annotated[1] : text;
};
