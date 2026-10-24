'use strict';

// Conversions retain their original source directory; other public functions are flat.
module.exports = function sourcePath(name) {
  return (
    (name.startsWith('to') || ['box', 'boxIf', 'unbox', 'unboxIf', 'fromJson', 'fromJsonIf'].includes(name)
      ? 'src/conversion/'
      : 'src/') +
    name +
    '.js'
  );
};
