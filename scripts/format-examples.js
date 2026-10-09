'use strict';

// Use column 32 by default, expanding the whole group to an even column when needed.
module.exports = function formatExamples(code, minimum = 32) {
  const lines = code.split('\n');
  const results = lines.map((line) => line.match(/^(.*?)\s+\/\/ => (.+)$/));
  const column = Math.ceil(Math.max(minimum, ...results.filter(Boolean).map((match) => match[1].length + 3)) / 2) * 2;
  return lines
    .map((line, index) => {
      const result = results[index];
      return result ? result[1].padEnd(column - 1) + '// => ' + result[2] : line;
    })
    .join('\n');
};
