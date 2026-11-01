'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { packageRoot } = require('./package-layout');
function run(command, argv, cwd, { inherit = false, env = {}, timeout = 180000 } = {}) {
  if (!Number.isSafeInteger(timeout) || timeout <= 0)
    throw new TypeError('Process timeout must be a positive integer in milliseconds.');
  if (command === 'npm') {
    const cli =
      process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
    if (!fs.existsSync(cli)) throw Error('Run this command through npm so its CLI can be located.');
    command = process.execPath;
    argv = [cli, ...argv];
  }
  const result = spawnSync(command, argv, {
    cwd,
    encoding: 'utf8',
    timeout,
    stdio: inherit ? 'inherit' : 'pipe',
    env: { ...process.env, ...env, npm_config_audit: 'false', npm_config_fund: 'false' }
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw Error(
      command +
        ' ' +
        argv.join(' ') +
        ' failed (' +
        result.status +
        '):\n' +
        (result.stdout || '') +
        '\n' +
        (result.stderr || '')
    );
  return result.stdout;
}
async function withStagedConsumer(check) {
  if (!fs.existsSync(path.join(packageRoot, 'package.json')))
    throw Error('Run npm run build before checking the generated package.');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'go-types-consumer-'));
  try {
    fs.writeFileSync(path.join(temporary, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    fs.mkdirSync(path.join(temporary, 'node_modules'));
    fs.cpSync(packageRoot, path.join(temporary, 'node_modules', 'go-types'), { recursive: true });
    return await check(temporary);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
module.exports = { run, withStagedConsumer };
