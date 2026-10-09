'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const createChecks = require('./optional-api-checks.cjs');
function moduleLoader(directory, context) {
  const cache = new Map();
  return function load(relative) {
    const filename = path.resolve(directory, relative);
    assert.ok(filename.startsWith(path.resolve(directory) + path.sep), 'Consumer dependency must stay inside package');
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const run = vm.compileFunction(fs.readFileSync(filename, 'utf8'), ['module', 'exports', 'require'], {
      filename,
      parsingContext: context
    });
    run(module, module.exports, (request) => {
      assert.ok(request.startsWith('.'));
      const target = path.resolve(path.dirname(filename), request);
      return load(target.endsWith('.js') ? target : target + '.js');
    });
    return module.exports;
  };
}
function environment(missing, nativeBackend = false) {
  const context = vm.createContext(nativeBackend ? { process: { getBuiltinModule: process.getBuiltinModule } } : {});
  const checks = vm.runInContext('(' + createChecks.toString() + ')()', context);
  const held = checks.prepare(missing);
  return { context, checks, held };
}
function verifyInstalled(directory, { sourceOnly = false } = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  const scenarios = createChecks().scenarios;
  let assertions = 0;
  for (const missing of scenarios) {
    const root = environment(missing);
    assertions += root.checks.check(moduleLoader(directory, root.context)('index.js'), missing, root.held);
    // Fresh focused imports cannot borrow initialisation from a successful root import.
    const focused = environment(missing),
      load = moduleLoader(directory, focused.context),
      api = Object.create(null);
    for (const [alias, route] of Object.entries(manifest.exports)) {
      if (alias === '.' || alias === './package.json' || alias.startsWith('./dist/')) continue;
      const entry = Array.isArray(route) ? route[0] : route;
      const name = path.basename(alias).replace(/\.js$/, '');
      const check = load(entry.require.default);
      if (api[name]) assert.equal(check, api[name], alias);
      api[name] = check;
    }
    assertions += focused.checks.check(api, missing, focused.held);
    if (!sourceOnly)
      for (const file of ['go-types.js', 'go-types.min.js']) {
        const bundle = environment(missing);
        vm.runInContext(fs.readFileSync(path.join(directory, 'dist', file), 'utf8'), bundle.context);
        assertions += bundle.checks.check(bundle.context.Types, missing, bundle.held);
      }
  }
  return { scenarios: scenarios.length, assertions, root: true, focused: true, bundles: sourceOnly ? 0 : 2 };
}
module.exports = { moduleLoader, environment, verifyInstalled };
