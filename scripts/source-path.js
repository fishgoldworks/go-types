'use strict';

// Conversions retain their original source directory; other public functions are flat.
module.exports = function sourcePath(name) {
  return (
    (name.startsWith('to') || ['box', 'unbox', 'parseJson'].includes(name) ? 'src/conversion/' : 'src/') + name + '.js'
  );
};
