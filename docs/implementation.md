# Implementation map

| Location | Responsibility |
|---|---|
| `src/` | Focused type checks, matcher compilation and graph traversal. |
| `src/conversion/` | Nine native-first conversions and nine conditional variants. |
| `src/util/nativeTypes.js` | Optional once-only Node classifier discovery; browser code needs no static Node import. |
| `src/util/` | Private shared helpers; no public import guarantee. |
| `index.js`, `index.mjs`, `esm/` | Generated CommonJS and ESM entry points. |
| `index.d.ts`, `index.d.mts`, `types/` | Root and focused-import TypeScript declarations. |
| `scripts/exports.json` | The public function-name manifest. |
| `scripts/api.json` | Reviewed contracts, categories, parameters and executable examples. |
| `scripts/README.template.md` | Authored README prose, layout and usage guidance. |
| `scripts/docs.js`, `scripts/readme.js` | Reproducible source/API/README documentation generation. |
| `scripts/generate-entries.js` | Entry/declaration/export-map generation. |
| `scripts/test-build.js` | Isolated build-failure, rollback and complete-output regression checks. |
| `scripts/test-types.js` | Declaration compilation and compile-and-run fixtures using the same TypeScript compiler. |
| `scripts/test.js` | Shared runtime-test discovery and Node option forwarding for tests and coverage. |
| `scripts/build.js` | One complete build: entry generation, internal esbuild bundling, Terser minification, format smoke checks and distribution replacement with rollback. |
| `scripts/test-tree-shaking.js` | Real esbuild consumer-bundle granularity checks. |
| `scripts/test-artifacts.js` | Bundle notices, maps, compression and CommonJS/global/AMD behaviour. |
| `benchmarks/cases.js`, `scripts/benchmark*.js` | Benchmark workloads and command-line measurement runners. |
| `scripts/test-package.js` | Clean installed-tarball, import and declaration checks. |
| `test/`, `test/browser/` | Public-behaviour, documentation, import, declaration and browser tests. |

Public functions have one implementation. Conditional variants delegate to their base conversion after the shared strict condition check. Source-directory compatibility imports are export-map aliases, not separate implementations. The documentation and entry manifests are checked against the real public API.

See [project-design.md](project-design.md) for the contracts, [project-testing.md](project-testing.md) for contract test coverage, and [CONTRIBUTING.md](../CONTRIBUTING.md) for generation and release-verification commands.
