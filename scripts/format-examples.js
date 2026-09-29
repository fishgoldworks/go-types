'use strict';

// Keep related result comments aligned without changing code or expected values.
module.exports = function formatExamples(code, width = 0) {
  const lines = code.split('\n');
  const results = lines.map(line => line.match(/^(.*?)\s+\/\/ => (.+)$/));
  const column = Math.max(width, ...results.filter(Boolean).map(match => match[1].length));
  return lines.map((line, index) => {
    const result = results[index];
    return result ? result[1].padEnd(column + 1) + '// => ' + result[2] : line;
  }).join('\n');
};
