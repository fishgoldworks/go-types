# Changelog

## 2.0.0

- Align development tooling with go-equality: `benchmarks/` workloads, `scripts/benchmark*.js` runners, `.test.js` tests, `test/browser/` fixtures, `test:*` commands and separate `verify` / `verify:all` gates.
- Share pinned TypeScript/Terser tooling while retaining esbuild for bundling/tree-shaking and npm Playwright for browser verification.

- Fix minified browser predicates misclassifying `document.all` as nullish; use Terser with safe comparison/typeof/getter settings, preserved names and composed source maps.

- Fix Node 24 runtime-test discovery so compile-only TypeScript fixtures are checked by the compiler rather than executed as tests.
- Enforce LF text checkouts and check regenerated browser artefacts in CI to keep source maps reproducible across platforms.
- Restore the npm-generated development lockfile and generated browser distributions using the pinned toolchain.
- Preserve the full MIT licence and package version in readable, minified and ESM browser bundles.
- Limit the npm documentation to consumer guides; link to repository maintainer guides and clarify that published browser bundles are ready to use.
- Verify installed documentation links, standalone bundle notices, source maps, AMD behaviour and meaningful minification during package checks.

- Avoid exception-driven numeric object rejection on Node with captured native Number classification, preserving primitive fast paths and intrinsic fallback behaviour.
- Recover from failed optional native-backend discovery without breaking portable imports.
- Correct generated source example result literals and clarify unsized synchronous/async/next-only input diagnostics.
- Add independent matcher/conversion oracles, source-example execution and expanded backend regressions.

- Correct structural/native false-branch narrowing in the remaining identity checks; retain exact primitive and nullish narrowing.
- Return Date conservatively from toDate instead of promising preservation of structural subtype properties.
- Use optional captured Node native brand predicates to avoid exception-driven negative checks; preserve browser intrinsic fallbacks.
- Generate direct per-function named ESM exports while preserving default/CommonJS identity, with a consumer tree-shaking release check.
- Add structural type, native/fallback parity, import, and exception-count regressions plus reproducible object/descriptor benchmarks.

- Fix unsafe failure-branch TypeScript narrowing for dynamic matchers and collection-content validators.
- Compile shared matcher graphs once per array identity, keep iterative evaluation, and retain effectful callback order and multiplicity.
- Support native bound instance hooks without constructibility/prototype preflight calls.
- Apply strict browser nullish boundaries, including document.all and nested containers.
- Optimise primitive matcher dispatch, numeric payload extraction, and actual-array empty/blank paths without weaker identity checks.
- Add reproducible before/after benchmark tooling and regression tests for shared graphs, native instance errors and declaration safety.

- Correct native identity, null-prototype and cross-realm checks, cycle detection, array-like lengths and JSON validation.
- Add binary-data checks, asynchronous/iterator-like checks, reusable matchers, typed Map/Set validators and explicit consuming iterable operations.
- Provide 18 supported conversion utilities, including all conditional variants, bringing the public API to 80 functions.
- Fully implement object, string and symbol conversion; add iterable-aware array conversion and whole-value integer truncation.
- Validate matcher configuration consistently; distinguish explicit predicates from native instance targets.
- Accept empty typed collections and null-prototype plain dictionaries; reject whitespace-only numeric validation text.
- Keep default empty/blank checks non-consuming for unsized iterables.
- Add CommonJS, ESM, focused and conversion-directory imports with TypeScript declarations.
- Add black-box, conversion, documentation-example, consumer, real-browser and packaging tests.
- Restore a polished README with the complete function catalogue, conversion guide and migration notes.
- Generate documentation and entry points from reviewed manifests; stage browser builds and enforce package verification.

## Earlier history

### v1.3.1
2022-10-21

 * Updated the bundle path in the readme file.
 * Removed the console.log line.
 

### v1.3.0
2022-10-19

 * Converted to CommonJS module format.
 * Added isValidDate function.
 * Added isInvalidDate function.
 * Added a build script.
 * Added a changelog file.
 * Added the bundle files.

 
### v1.2.0
2022-09-01

 * Added isCyclic function.
 * Added isPair function.
 
 
### v1.1.0
2022-07-30

 * Added isThenable function.
 * Added isArrayOf function.
 * Added isArrayLikeOf function.
 * Added isNode function.
 * Added isElement function.
 * Added isFragment function.
 

### v1.0.0
2022-07-10

 * Initial release
