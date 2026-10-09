'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { root, packageRoot, artifactPath } = require('./package-layout');
const { run } = require('./consumer-tools');
function packPackage() {
  // A failed build stops here; it cannot pack an earlier successful package.
  run(process.execPath, [path.join(__dirname, 'build.js')], root, { inherit: true });
  const target = artifactPath();
  const directory = path.dirname(target);
  fs.mkdirSync(directory, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(directory, '.pack-'));
  let packError;
  let packFailed = false;
  try {
    const packed = JSON.parse(
      run('npm', ['pack', packageRoot, '--ignore-scripts', '--json', '--pack-destination', temporary], root)
    )[0];
    if (packed.filename !== path.basename(target)) throw Error('Unexpected tarball filename: ' + packed.filename);
    fs.renameSync(path.join(temporary, packed.filename), target);
    console.log(JSON.stringify({ tarball: target, files: packed.entryCount, bytes: packed.size }, null, 2));
  } catch (error) {
    packError = error;
    packFailed = true;
  }
  // Finish cleanup before propagating the result, retaining both failures if needed.
  try {
    fs.rmSync(temporary, { recursive: true, force: true });
  } catch (cleanupError) {
    if (packFailed) {
      // eslint-disable-next-line preserve-caught-error -- AggregateError.errors retains both failures.
      throw new AggregateError([packError, cleanupError], 'Packing failed; cleanup also failed at ' + temporary);
    }
    throw cleanupError;
  }
  if (packFailed) throw packError;
  return target;
}
module.exports = packPackage;
if (require.main === module) {
  try {
    if (process.argv.length !== 2) throw Error('Usage: npm run pack:package');
    packPackage();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
