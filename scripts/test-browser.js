'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, firefox, webkit } = require('playwright');
const root = path.join(__dirname, '..');
const metadata = require('./api.json');
const names = require('./exports.json');
const sourcePath = require('./source-path.js');
const createOptionalApiChecks = require('../test/fixtures/optional-api-checks.cjs');

const contract = fs.readFileSync(path.join(root, 'test', 'browser', 'contract.js'), 'utf8');
// Read expressions and result literals from the generated source comments so a
// broken JSDoc serialiser cannot hide behind correct API-metadata examples.
const metadataExamples = metadata.flatMap((item) => item.examples);
const sourceExamples = names.flatMap((name) => {
  const source = fs.readFileSync(path.join(root, sourcePath(name)), 'utf8');
  const examples = [...source.matchAll(/^\s*\* @example (.*);\s+\/\/ => (.*)$/gm)];
  assert.ok(examples.length, `${name} source JSDoc must contain executable examples`);
  return examples.map(([, expression, expected]) => ({
    expression,
    expected,
    requires: metadataExamples.find((example) => example.expression === expression)?.requires || []
  }));
});
async function load(page, mode, packageDirectory) {
  if (mode === 'source') await page.addScriptTag({ content: require('./source-test-loader.js')() });
  else if (mode === 'esm')
    await page.evaluate(async () => {
      globalThis.Types = (await import('/bundle.mjs')).default;
    });
  else
    await page.addScriptTag({
      content: fs.readFileSync(
        path.join(packageDirectory, 'dist', mode === 'umd' ? 'go-types.js' : 'go-types.min.js'),
        'utf8'
      )
    });
}
async function checkOptionalHostFailure(browser, url, mode, packageDirectory) {
  // Use a fresh page so an earlier successful load or ESM cache cannot conceal
  // a failure while discovering the optional host bridge.
  const page = await browser.newPage();
  try {
    await page.goto(url);
    await page.evaluate(() => {
      globalThis.process = {
        getBuiltinModule() {
          throw Error('unavailable optional bridge');
        }
      };
    });
    await load(page, mode, packageDirectory);
    const result = await page.evaluate(() => ({
      loaded: Types.isNumber(new Number(2)),
      finite: Types.isFinite(new Number(2)),
      negative: Types.isFinite({}),
      dictionary: Types.isEmpty({})
    }));
    assert.deepEqual(
      result,
      { loaded: true, finite: true, negative: false, dictionary: true },
      `${mode}: optional host failure must preserve portable behavior`
    );
    return result;
  } finally {
    await page.close();
  }
}
async function checkOptionalApis(browser, url, mode, packageDirectory) {
  let assertions = 0;
  const scenarios = createOptionalApiChecks().scenarios;
  const source =
    mode === 'esm'
      ? undefined
      : mode === 'source'
        ? require('./source-test-loader.js')()
        : fs.readFileSync(
            path.join(packageDirectory, 'dist', mode === 'umd' ? 'go-types.js' : 'go-types.min.js'),
            'utf8'
          );
  for (const missing of scenarios) {
    const page = await browser.newPage();
    try {
      await page.goto(url);
      // The child realm loses optional APIs; Playwright's parent realm retains its own dependencies.
      assertions += await page.evaluate(
        async ({ missing, factory, source, bundleUrl, esm }) => {
          const frame = globalThis.document.createElement('iframe');
          // Firefox needs a navigated document for dynamic imports in the child realm.
          frame.src = new URL('/capability-frame', bundleUrl).href;
          const loaded = new Promise((resolve) => {
            frame.onload = resolve;
          });
          globalThis.document.body.appendChild(frame);
          await loaded;
          const child = frame.contentWindow;
          const checks = child.eval('(' + factory + ')()');
          const held = checks.prepare(missing);
          if (esm) child.Types = (await child.eval('import(' + JSON.stringify(bundleUrl) + ')')).default;
          else child.eval(source);
          return checks.check(child.Types, missing, held);
        },
        {
          missing,
          factory: createOptionalApiChecks.toString(),
          source,
          bundleUrl: url + '/bundle.mjs',
          esm: mode === 'esm'
        }
      );
    } catch (error) {
      throw new Error(mode + ': optional APIs ' + (missing.join(', ') || 'native present') + ': ' + error.message, {
        cause: error
      });
    } finally {
      await page.close();
    }
  }
  return { scenarios: scenarios.length, assertions };
}
async function verifyBrowser(packageDirectory, { sourceOnly = false } = {}) {
  const server = http.createServer((request, response) => {
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    if (request.url === '/bundle.mjs') {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(fs.readFileSync(path.join(packageDirectory, 'dist', 'go-types.mjs')));
    } else {
      response.setHeader('Content-Type', 'text/html');
      response.end('<!doctype html><html><body></body></html>');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const engines = [];
  try {
    const modes = sourceOnly ? ['source'] : ['umd', 'umd-minified', 'esm'];
    const url = `http://127.0.0.1:${server.address().port}`;
    for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
      const browser = await browserType.launch(
        engine === 'chromium' && process.env.CHROMIUM_EXECUTABLE
          ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
          : {}
      );
      try {
        const results = [];
        for (const mode of modes) {
          const page = await browser.newPage();
          let result;
          try {
            await page.goto(url);
            await load(page, mode, packageDirectory);
            await page.addScriptTag({ content: contract });
            result = await page.evaluate(
              ({ metadata, names, sourceExamples }) => runGoTypesBrowserTests(Types, metadata, names, sourceExamples),
              { metadata, names, sourceExamples }
            );
          } finally {
            await page.close();
          }
          const throwingOptionalBridge = await checkOptionalHostFailure(browser, url, mode, packageDirectory);
          const optionalApis = await checkOptionalApis(browser, url, mode, packageDirectory);
          results.push({ mode, ...result, throwingOptionalBridge, optionalApis });
        }
        engines.push({ engine, version: browser.version(), results });
      } finally {
        await browser.close();
      }
    }
    assert.ok(!engines.some(({ results }) => results.some((result) => result.failed)), JSON.stringify(engines));
    return { sourceOnly, sourceExamples: sourceExamples.length, engines };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
module.exports = verifyBrowser;
if (require.main === module)
  verifyBrowser(require('./package-layout').packageRoot, { sourceOnly: process.argv.includes('--source-only') })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
