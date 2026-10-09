# Changelog

## 2.0.0

- Preserved UTF-8 source and Unicode examples in the optional Python browser runner on non-UTF-8 systems, avoiding false conversion-test failures.

- Exported `PrimitiveTypeMap` consistently from CommonJS and ES module declarations, with parity checks for every public helper type.

- Kept non-enumerable own properties and getters out of cycle traversal on Node 8, including dictionary objects that shadow inherited enumerable keys.

- Aligned `NarrowingMatcher` callback receivers with the runtime invocation contract and verified valid callbacks in emitted CommonJS and ES module consumers.

- Kept Error detection conservative when both native branding and the tag key are unavailable, accepted callable browser instance hooks, and added Firefox/WebKit to browser verification with engine-correct DOM-adoption expectations.

- Isolated optional native APIs across loading and execution, added local reference/numeric fallbacks and clear unsupported-conversion errors, and verified API absence before fresh source, installed-package and browser-bundle imports.

- Added native Map and Set conversions, including conditional variants, inferred TypeScript collection types and iterable/error behaviour checks.

- Generated a self-contained `package/` directory, keeping the development manifest and source tree small while preserving all public import paths and runtime support.
- Verified and release-reviewed one packed tarball, retained transactional build recovery, and prevented accidental publication of the development root.
- Loaded package directories consistently in benchmark tools, failed commands on unexpected matcher-worker errors, and rejected source maps whose embedded content differs from packaged source.

- Supported Node 8.0.0 CommonJS consumers with feature-gated BigInt/async-iterator handling, compatible nested matchers and physical public subpath entries.
- Supported strict ES2017 TypeScript consumers without requiring global BigInt declarations, and resolved focused-import declarations under legacy node module resolution.
- Supported native package ESM imports on Node >=14 and Node 12.17+ within the 12.x release line; kept standalone ESM bundles on Node >=14 and development tooling on Node >=22.16.0.
- Added declarations for all three bundle subpaths, matching CommonJS, native ESM default and standalone ESM named imports, with compiled-and-executed consumer checks.

- Aligned development tooling with go-equality: `benchmarks/` workloads, `scripts/benchmark*.js` runners, `.test.js` tests, `test/browser/` fixtures, `test:*` commands and separate `verify` / `verify:all` gates.
- Shared pinned TypeScript/Terser tooling while retaining esbuild for bundling/tree-shaking and npm Playwright for browser verification.

- Fixed minified browser predicates misclassifying `document.all` as nullish; used Terser with safe comparison/typeof/getter settings, preserved names and composed source maps.

- Fixed Node 24 runtime-test discovery so compile-only TypeScript fixtures are checked by the compiler rather than executed as tests.
- Enforced LF text checkouts and checked regenerated browser artefacts in CI to keep source maps reproducible across platforms.
- Restored the npm-generated development lockfile and generated browser distributions using the pinned toolchain.
- Preserved the full MIT licence and package version in readable, minified and ESM browser bundles.
- Limited the npm documentation to consumer guides; linked to repository maintainer guides and clarified that published browser bundles are ready to use.
- Verified installed documentation links, standalone bundle notices, source maps, AMD behaviour and meaningful minification during package checks.

- Avoided exception-driven numeric object rejection on Node with captured native Number classification, preserving primitive fast paths and intrinsic fallback behaviour.
- Recovered from failed optional native-backend discovery without breaking portable imports.
- Corrected generated source example result literals and clarified unsized synchronous/async/next-only input diagnostics.
- Added independent matcher/conversion oracles, source-example execution and expanded backend regressions.

- Corrected structural/native false-branch narrowing in the remaining identity checks; retained exact primitive and nullish narrowing.
- Returned `Date` conservatively from `toDate` instead of promising preservation of structural subtype properties.
- Used optional captured Node native brand predicates to avoid exception-driven negative checks; preserved browser intrinsic fallbacks.
- Generated direct per-function named ESM exports while preserving default/CommonJS identity, with a consumer tree-shaking release check.
- Added structural type, native/fallback parity, import, and exception-count regressions plus reproducible object/descriptor benchmarks.

- Fixed unsafe failure-branch TypeScript narrowing for dynamic matchers and collection-content validators.
- Compiled shared matcher graphs once per array identity, kept iterative evaluation, and retained effectful callback order and multiplicity.
- Supported native bound instance hooks without constructibility/prototype preflight calls.
- Applied strict browser nullish boundaries, including `document.all` and nested containers.
- Optimised primitive matcher dispatch, numeric payload extraction, and actual-array empty/blank paths without weaker identity checks.
- Added reproducible before/after benchmark tooling and regression tests for shared graphs, native instance errors and declaration safety.

- Corrected native identity, null-prototype and cross-realm checks, cycle detection, array-like lengths and JSON validation.
- Added binary-data checks, asynchronous/iterator-like checks, reusable matchers, typed Map/Set validators and explicit consuming iterable operations.
- Provided 22 supported conversion utilities, including all conditional variants, bringing the public API to 84 functions.
- Fully implemented object, string and symbol conversion; added iterable-aware array conversion and whole-value integer truncation.
- Validated matcher configuration consistently; distinguished explicit predicates from native instance targets.
- Accepted empty typed collections and null-prototype plain dictionaries; rejected whitespace-only numeric validation text.
- Kept default empty/blank checks non-consuming for unsized iterables.
- Added CommonJS, ESM, focused and conversion-directory imports with TypeScript declarations.
- Added black-box, conversion, documentation-example, consumer, real-browser and packaging tests.
- Restored a polished README with the complete function catalogue, conversion guide and migration notes.
- Generated documentation and entry points from reviewed manifests; staged browser builds and enforced package verification.

## 1.3.1 — 2022-10-21

- Updated the bundle path in the readme file.
- Removed the console.log line.

## 1.3.0 — 2022-10-19

- Converted to CommonJS module format.
- Added isValidDate function.
- Added isInvalidDate function.
- Added a build script.
- Added a changelog file.
- Added the bundle files.

## 1.2.0 — 2022-09-01

- Added isCyclic function.
- Added isPair function.

## 1.1.0 — 2022-07-30

- Added isThenable function.
- Added isArrayOf function.
- Added isArrayLikeOf function.
- Added isNode function.
- Added isElement function.
- Added isFragment function.

## 1.0.0 — 2022-07-10

- Initial release
