'use strict';
console.error(
  'The development root is private. Run npm run verify:all, then publish the verified tarball from artifacts/.'
);
process.exitCode = 1;
