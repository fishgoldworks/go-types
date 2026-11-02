# Contributing

## Working on the library

Use Node.js 22.16.0 or later for development, excluding Node.js 23; Node 24 is recommended. The published CommonJS library supports Node 8.0.0 independently of these development tools. Install the locked development dependencies with `npm ci`. Use `npm install` when intentionally changing dependency versions, and review the resulting lockfile.

```sh
npm ci
npm test
npm run docs
npm run build
npm run test:types
```

The development root keeps canonical implementations, declarations, documentation and tooling. Its small `index.js` loads source for tests and benchmarks. The complete consumer layout, including aliases, ESM entries, declarations, metadata and browser bundles, is generated in the ignored `package/` directory. `scripts/exports.json` and `scripts/source-path.js` remain the public-function inventory and implementation mapping; there is no second hand-maintained export map.

The shared runner in `scripts/test.js` selects `test/**/*.test.js` in a stable order for both normal tests and coverage, and fails if no matching files exist; compile-only fixtures under `test/types/` belong to `npm run test:types`. This keeps TypeScript fixtures out of Node's automatic test discovery. Forward Node test options with `npm test -- --test-name-pattern="pattern"`; the runner places them before the test paths so they take effect.

The runtime has no third-party dependencies. Keep public functions small. When fixing behaviour, add or update a regression test that exercises the public contract. Describe coercion, mutation, identity, exceptions and any consumption of iterators explicitly. Do not replace native identity operations with weaker constructor-name or string-tag checks.

The README also shows optional composition with go-fns. To execute those examples against the real companion library, set `GO_TYPES_GO_FNS_ROOT` to the absolute path of a go-fns checkout or installed package, then run `node --test test/documentation-examples.test.js` or `npm run verify`. The installed-package checks inherit this setting. Without it, only the go-fns examples are explicitly reported as skipped; normal checks remain independent of a sibling checkout. An invalid supplied path or failing example fails verification.

## Adding or updating a function

Runtime checks live in `src/`; conversions live in `src/conversion/`. Private helpers are under `src/util/` and are not public package entry points.

Update `scripts/exports.json` and `scripts/api.json`, add the implementation and declarations in `index.d.ts`, then regenerate documentation and the package:

```sh
npm run docs
npm run build
```

`README.md` and `docs/API.md` use their templates in `scripts/` and the shared `scripts/api.json` metadata. Keep each summary focused on purpose and the main distinction from related functions. Use `description` and `notes` for the full reference, `tooltip` for essential call-time boundaries, `summaryReturn` for the result’s meaning, and `errors` for significant failure conditions. Format code literals and identifiers in prose with backticks. Keep ordinary examples before specialised cases.

`scripts/api-documentation.js` supplies shared signatures, parameter descriptions, return types and concise comments. `npm run docs` refreshes the README, full reference, source JSDoc and every public declaration overload’s comment in `index.d.ts`. Declaration signatures and helper-type comments remain authored in `index.d.ts`; runtime implementation and rationale comments remain authored in source. Conditional-converter tooltips and reference entries also reuse their base operation’s essential boundaries. Do not hand-edit generated prose.

`npm run test:docs` detects stale generated documents and comments without writing files. Source and reference examples execute in tests. Installed-package checks use the TypeScript language service to verify hover text and signature help for all public functions through root and focused CommonJS/ES module imports.

Use New Zealand English in maintained prose and comments, preserving API identifiers, diagnostic strings and legal notices. Write expected JavaScript/TypeScript results as `// => result` and exceptions as `// => throws ErrorType`. Keep plain `//` for explanations and type annotations. Use signature headings, an API summary with API/Description/Returns columns and parameter tables. Contents links every main section and selected subsections. Align trailing result comments across related examples, including lines separated by blank lines: use one-based column 32, or the smallest even column that leaves at least two spaces after the longest annotated code. Shorten exceptionally wide calls with fixtures or multiline calls. Use the shared two-space formatting in `.prettierrc.json`. Keep `<!-- prettier-ignore -->` immediately before each aligned example fence so its result-comment columns remain stable.

Test root and focused imports, conditional exports, and both positive and negative TypeScript branches. Conversions retain compatibility aliases under `go-types/conversion/` and `go-types/src/conversion/`.

## Verification

```sh
npm test
npm run coverage
npm run build
npm run test:types
npx playwright install chromium firefox webkit
npm run test:build
npm run test:artifacts
npm run pack:package
npm run test:package
npm run test:tree-shaking
npm run test:browser
```

`npm run verify` builds and packs once, checks documentation freshness, source coverage and build failures, then installs that exact tarball for declaration, entry-point, artefact and tree-shaking checks. `npm run verify:all` adds real-browser checks against the same installation. Both print the tarball path and SHA-256 digest. The generated manifest includes consumer metadata and runtime dependency declarations, with no development dependencies or repository lifecycle hooks.

`npm run build` is the single public build command and owns entry generation, bundling, minification and smoke checks. Internal `bundle()` and `minify()` functions run sequentially; partial-build commands are not exposed. The complete package is assembled in a fresh staging directory and validated before replacement. Builds leave canonical files unchanged, remove stale generated entries and are checked for repeatability. A failed package replacement restores the previous `package/`; if restoration also fails, the error identifies the retained backup. `npm run test:build` verifies failures and complete replacement in isolated temporary copies. Public CJS and ESM surfaces must have identical function names and behaviour. Source-only package/browser commands are diagnostic tools, not replacements for testing generated artefacts.

CI runs development checks on Node 22.16.0 and 24, installed-consumer checks on Node 8.0.0, 8.17.0, 12.17.0, 13.0.0 and 14.0.0 on Linux and Windows, and generated browser bundles in Chromium, Firefox and WebKit. The Ubuntu Node 24 job uploads its verified tarball; older-runtime, browser and TypeScript jobs download and test that same artefact without rebuilding it. The workflow checks tracked documentation and source-comment freshness; ignored package output is covered by deterministic-build and installed-package tests. `.gitattributes` keeps text checkouts on LF so embedded source-map contents are reproducible across Windows and Linux.

The optional-API matrix in `test/fixtures/optional-api-checks.cjs` is shared by source, installed-package and browser verification. Add affected operations and expected absence behaviour when introducing a native capability. Features must be disabled before loading a fresh module graph; ordinary modern-runtime coverage alone cannot establish optionality.

### Packing, local consumers and release review

`npm run pack:package` builds fresh output and writes `artifacts/<name>-<version>.tgz`, deriving the filename from package metadata. It does not run the full release gate. If packing and temporary-directory cleanup both fail, both errors and the retained staging path are reported. A cleanup-only failure also fails the command; the existence of a tarball alone is not verification. Installed-package checks compare documentation bytes exactly and report the mismatching path without rendering large Buffer diffs. `npm run test:package -- <tarball.tgz>` verifies that exact file without rebuilding or repacking; with no path, it uses the current-version tarball in `artifacts/`. Add `--browser` for browser verification of that installation.

Run `npm run verify:all` before a manual release, review its results, then publish the exact reported tarball with `npm publish <tarball.tgz>`. The development root is permanently `private: true`; its `prepack` and `prepublishOnly` hooks reject wrong-directory operations. They do not provide validation for the generated package. The verification orchestrator owns those checks and stops on failures.

For local `npm link` or folder dependencies, first build and target `package/`, or install the generated tarball. Rebuild after source changes. Installing the repository directly from Git does not produce the published layout; use the built directory or tarball for pre-release consumers. No consumer-time build hooks are provided.

### Older-runtime consumer verification

Set `GO_TYPES_RUNTIME_NODE` to an absolute path to a Node executable before running `npm run test:package` or the full verification gate. For example, in PowerShell:

```powershell
$env:GO_TYPES_RUNTIME_NODE = "C:\runtimes\node-v8.0.0\node.exe"
npm run verify:all
```

The package runner builds its temporary installation with modern npm, then checks every public function, every CommonJS alias and both UMD bundles using the requested executable. It tests CommonJS, browser-global and AMD loading, native-feature absence, cross-realm values, iterator closing and callback errors. Node 14 or newer, and Node 12.17 or newer within the 12.x release line, also run the ESM consumer. Standalone ESM bundle checks require Node 14 or newer. The current development runtime is always checked. Strict installed-package TypeScript checks use ES2017 output and libraries with both legacy node and Node16 module resolution, verify every public CommonJS alias and both CommonJS bundle imports without implicit any, and execute the emitted consumers on each requested runtime. Native ESM declaration checks cover the bundle default imports and the standalone ESM bundle’s named exports. The separate NodeNext/ES2020 fixtures retain the richer native BigInt type checks. An invalid executable or a failed consumer check fails the command; the runner never downloads or silently skips a requested runtime. `test/runtime/` CommonJS fixtures must keep Node 8-compatible syntax and built-ins; ESM fixtures must respect the runtime requirements of the imports they exercise.

## Package contents

`package/` and `artifacts/` are ignored build outputs. The former is the npm package root, so installed imports remain `go-types/isArray`, without a `package/` prefix. `npm run build` owns entry generation; the former standalone `entries` command has been removed to avoid partial package output.

The npm allowlist contains runtime source, public entry points, declarations, browser distributions, consumer API/conversion/migration/runtime guides, the changelog and licence. Maintainer guides remain in the repository and use repository links from the README. Tests, build tools, raw verification output, dependencies and temporary folders stay out of the runtime package. All conversion functions are part of the supported public surface.

Version changes and breaking contracts belong in `CHANGELOG.md` and `docs/migration.md`. Keep consumer documentation about the product and its contracts. Store run-specific test measurements, source revisions and environment details in a task-owned temporary directory outside the checkout. Historical results must not be relabelled as current evidence.

## Shared library tooling

Use [go-equality](https://github.com/koyote130708/go-equality) as the concrete reference for common folder and command names. Runtime cases use `test/**/*.test.js`, browser fixtures use `test/browser/`, benchmark workloads use `benchmarks/`, and command-line runners use `scripts/`. CommonJS tooling uses `.js` in this CommonJS package; TypeScript module-mode fixtures and their emitted `.cjs`/`.mjs` files retain explicit formats.

Root and generated consumer manifests share the family field order, with dependencies alphabetised by package name. `scripts/package-layout.js` owns generated metadata order and retains `os` then `cpu` after shared fields when supplied. Conditional exports, compiler mappings and fallback arrays retain their semantic order.

The shared command names are `build`, `docs`, `test`, `test:docs`, `coverage`, `test:types`, `test:artifacts`, `test:package`, `test:browser`, `verify`, `verify:all`, and `benchmark`. Specialised benchmarks use `benchmark:<subject>`. Source-only diagnostics use `npm run test:package -- --source-only` and `npm run test:browser -- --source-only` instead of separate aliases. Prefer these names over `bench` or `check:*` aliases.

Order npm commands by purpose: generation and packing (`build`, `docs`, `pack:package`), lint and formatting, the shared test families with coverage, verification gates, benchmarks, then lifecycle hooks. Keep specialised benchmarks alphabetical. Reuse the same check implementations from standalone commands, CI and the verification orchestrator; keep browser verification explicit in `verify:all`.

The libraries share Node's built-in test/assert modules, TypeScript and Terser. Exact development versions belong in `package.json` and its npm-generated lockfile. Terser preserves observable names, property names, getters/proxy traps and strict nullish/typeof behaviour. Full licence notices and composed source maps remain in the browser distribution.

Two additional tools serve go-types-specific workflows: esbuild handles its CommonJS-to-ESM/browser bundling and verifies tree-shaking across its many entry points; JavaScript Playwright provides a pinned, npm-installable browser test runner. Acorn is not a direct dependency because go-types does not maintain go-equality's AST-based custom bundler. The runtime remains dependency-free, with Node >=8 CommonJS support and the [documented ESM and browser requirements](docs/runtime.md#supported-environments-and-verification). Do not copy the reference library's public formats, licence, minimum runtime or build internals solely to make metadata identical.

## Executable code quality

The development manifest pins `minimatch` 11.0.4 through an override because upstream linting dependencies still specify affected 10.x versions ([advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249)). Recheck the override when updating those tools.

Run `npm run lint` and `npm run format:check`; `npm run lint:fix` applies supported ESLint fixes and `npm run format` formats maintained files. The paired lint commands use `eslint .` with zero warnings, and the paired formatting commands use `prettier .` with the same `.prettierignore` scope. `eslint.config.mjs` and `.prettierrc.json` own the executable configuration. Verification and CI run the read-only checks before the release gate. The [development manifest](package.json) and [lockfile](package-lock.json) own the ESLint, TypeScript ESLint, globals and Prettier versions; [ESLint configuration](eslint.config.mjs) and [Prettier configuration](.prettierrc.json) own their rules. The pinned tools support the documented contributor runtime; they do not change consumer compatibility.

The baseline checks maintained JavaScript, tooling and tests, with explicit module/host environments, and parses TypeScript declarations and consumer fixtures. Compiler checks remain responsible for declaration semantics. Intentional public `any` types, import-equals declarations, structural empty-object types and unused compiler-only bindings retain narrow TypeScript-scope exceptions: changing those contracts solely for lint would alter supported consumers or remove negative cases. JavaScript still checks undefined and unused bindings; caught error bindings remain allowed for old-runtime syntax compatibility. Review these scopes when the related contracts change.

Prettier owns maintained JavaScript/TypeScript, nested configuration, Markdown and documentation templates. Generated distributions, dependency/coverage output, locked or vendored data, historical release records, legal text and generated `README.md`/`docs/API.md` are excluded. Local `<!-- prettier-ignore -->` comments preserve aligned result examples in canonical templates and maintained guides; documentation generation and executable-example checks continue to validate them. Generated files must still pass their artefact freshness checks. Node globals belong to tooling and Node tests; browser globals belong to the browser fixture, with only the specific optional host names exposed to runtime modules. TypeScript exceptions remain scoped to declarations and compiler fixtures. Review these exceptions when their owning contracts change. No playbook modules or configuration dependency are imported.

## Consumer TypeScript compatibility

The legacy CommonJS consumer minimum is TypeScript 4.5 (verified with 4.5.2). Node16/NodeNext consumers require 4.9 (verified with 4.9.5) to reject invalid named imports from CommonJS bundles; Bundler consumers require 5.0 (verified with 5.0.2). Keep the pinned development compiler for builds and the complete modern module checks. `node scripts/test-types-compat.js --compiler /path/to/typescript/lib/tsc.js --package /path/to/built-or-installed-package` reuses the existing inference and rejected-call fixtures with strict declaration checking. Older compilers use `.ts` fixture copies and equivalent type-import syntax; the runner independently requires every negative assertion to produce a diagnostic. Modern NodeNext, Bundler, emitted consumers and option-specific controls remain in `npm run test:types`. The TypeScript CI job installs and tests the exact packed consumer using both the minimum and contributor compiler.

## Local playgrounds

Keep experiments in `temp/` or `.tmp/` directories at any depth. Git, formatting, linting, runtime test discovery, coverage, source-browser loading and package assembly exclude those directories. The release verifier also rejects them in the installed package. Keep maintained source and regression fixtures elsewhere; do not delete local experiments during release cleanup.

The browser release check executes the packaged README script-tag example in each required engine, validates its exact-version CDN links and serves that candidate's own bundle bytes. This checks the example before publication; it does not claim those CDN URLs are already public.
