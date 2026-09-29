# Contributing

## Working on the library

Use Node.js 22 or newer. Install the locked development dependencies with `npm ci`. Use `npm install` when intentionally changing dependency versions, and review the resulting lockfile.

```sh
npm ci
npm test
npm run test:types
npm run docs
npm run build
```

The shared runner in `scripts/test.js` selects `test/**/*.test.js` for both normal tests and coverage; compile-only fixtures under `test/types/` belong to `npm run test:types`. This keeps TypeScript fixtures out of Node's automatic test discovery. Forward Node test options with `npm test -- --test-name-pattern="pattern"`; the runner places them before the test paths so they take effect.

The runtime has no third-party dependencies. Keep public functions small. When fixing behaviour, add or update a regression test that exercises the public contract. Describe coercion, mutation, identity, exceptions and any consumption of iterators explicitly. Do not replace native identity operations with weaker constructor-name or string-tag checks.

## Adding or updating a function

Runtime checks live in `src/`; conversions live in `src/conversion/`. Private helpers are under `src/util/` and are not public package entry points.

Update `scripts/exports.json` and `scripts/api.json`, add the implementation and declarations in `index.d.ts`, then regenerate entries and documentation:

```sh
npm run entries
npm run docs
```

`README.md` is generated from `scripts/README.template.md` and the API metadata. Edit the template for authored prose and layout, and the metadata for function descriptions and examples. `docs/API.md` and source JSDoc examples are generated from the same metadata. Documentation tests check every advertised function and execute the API examples. `npm run test:docs` checks generated README, API documentation and source comments without modifying files; run `npm run docs` to refresh them.

Use New Zealand English in maintained prose and comments, preserving API identifiers, diagnostic strings and legal notices. Write expected JavaScript/TypeScript results as `// => result` and exceptions as `// => throws ErrorType`. Keep plain `//` for explanations and type annotations. Align trailing result comments across related examples, including lines separated by blank lines. No repository-wide formatter is configured; preserve the four-space indentation used by runtime code.

Test root and focused imports, conditional exports, and both positive and negative TypeScript branches. Conversions retain compatibility aliases under `go-types/conversion/` and `go-types/src/conversion/`.

## Verification

```sh
npm test
npm run coverage
npm run test:types
npx playwright install chromium
npm run build
npm run test:build
npm run test:artifacts
npm run test:package
npm run test:tree-shaking
npm run test:browser
```

`npm run verify` builds fresh entries and distributions, then checks documentation freshness and runs runtime coverage, declaration, build-failure, artefact, tree-shaking and installed-package checks. `npm run verify:all` adds real-browser verification and is the release gate. `npm pack` reuses `npm run verify`; `npm publish` also runs `npm run verify:all`. Inspect the actual tarball and generated bundles, not just the working source tree.

`npm run build` is the single public build command and owns entry generation, bundling, minification and smoke checks. Internal `bundle()` and `minify()` functions run sequentially; partial-build commands are not exposed. Output is staged until all formats pass smoke checks. A failed distribution replacement restores the previous `dist`; if restoration also fails, the error identifies the retained backup. `npm run test:build` verifies failures and complete replacement in isolated temporary copies. Public CJS and ESM surfaces must have identical function names and behaviour. Source-only package/browser commands are diagnostic tools, not replacements for testing generated artefacts.

CI is configured to check Node 22 and 24 on Linux and Windows, plus generated browser bundles in Chromium. Keep generated README, source comments, API docs, exports and declarations in sync; the workflow checks for drift after regeneration, including browser distributions. `.gitattributes` keeps text checkouts on LF so embedded source-map contents are reproducible across Windows and Linux.

## Package contents

The npm allowlist contains runtime source, public entry points, declarations, browser distributions, consumer API/conversion/migration/runtime guides, the changelog and licence. Maintainer guides remain in the repository and use repository links from the README. Tests, build tools, raw verification output, dependencies and temporary folders stay out of the runtime package. All conversion functions are part of the supported public surface.

Version changes and breaking contracts belong in `CHANGELOG.md` and `docs/migration.md`. Keep consumer documentation about the product and its contracts. Store run-specific test measurements, source revisions and environment details in a task-owned temporary directory outside the checkout. Historical results must not be relabelled as current evidence.

## Shared library tooling

Use [go-equality](https://github.com/koyote130708/go-equality) as the concrete reference for common folder and command names. Runtime cases use `test/**/*.test.js`, browser fixtures use `test/browser/`, benchmark workloads use `benchmarks/`, and command-line runners use `scripts/`. CommonJS tooling uses `.js` in this CommonJS package; TypeScript module-mode fixtures and their emitted `.cjs`/`.mjs` files retain explicit formats.

The shared command names are `build`, `docs`, `test`, `test:docs`, `coverage`, `test:types`, `test:artifacts`, `test:package`, `test:browser`, `verify`, `verify:all`, and `benchmark`. Specialised benchmarks use `benchmark:<subject>`. Source-only diagnostics use `npm run test:package -- --source-only` and `npm run test:browser -- --source-only` instead of separate aliases. Prefer these names over `bench` or `check:*` aliases.

Order npm commands by purpose: generation (`build`, `entries`, `docs`), tests in verification order with coverage, verification gates, benchmarks, then lifecycle hooks. Keep specialised benchmarks alphabetical. Reuse the same commands from coverage, CI and lifecycle hooks so their responsibilities cannot drift; keep browser verification explicit in `verify:all`.

The libraries share Node's built-in test/assert modules, TypeScript and Terser. Exact development versions belong in `package.json` and its npm-generated lockfile. Terser preserves observable names, property names, getters/proxy traps and strict nullish/typeof behaviour. Full licence notices and composed source maps remain in the browser distribution.

Two additional tools serve go-types-specific workflows: esbuild handles its CommonJS-to-ESM/browser bundling and verifies tree-shaking across its many entry points; JavaScript Playwright provides a pinned, npm-installable browser test runner. Acorn is not a direct dependency because go-types does not maintain go-equality's AST-based custom bundler. The runtime remains dependency-free, and its existing Node >=22 / ES2020 contract is unchanged. Do not copy the reference library's public formats, licence, minimum runtime or build internals solely to make metadata identical.
