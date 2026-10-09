'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const createChecks = require('./fixtures/optional-api-checks.cjs');
const { moduleLoader, environment } = require('./fixtures/verify-optional-apis.cjs');
const names = require('../scripts/exports.json');
const sourcePath = require('../scripts/source-path');
const root = path.resolve(__dirname, '..');
for (const nativeBackend of [false, true])
  for (const missing of createChecks().scenarios) {
    test(
      'optional APIs before loading (' +
        (nativeBackend ? 'Node bridge' : 'portable') +
        '): ' +
        (missing.join(', ') || 'native present'),
      () => {
        const { context, checks, held } = environment(missing, nativeBackend);
        const load = moduleLoader(root, context),
          api = {};
        for (const name of names) api[name] = load(sourcePath(name));
        assert.ok(checks.check(api, missing, held) > 90);
      }
    );
  }
