# Test strategy

Runtime tests use Node's built-in `node:test` and `node:assert/strict` without requiring development dependencies. They check public root and subpath behaviour, documented exceptions, termination, iterator closing and application-visible side effects. Assertions target the public contract rather than private helper calls, intermediate implementation values or mocked native results.

## Contract coverage

| Group | Covered cases |
|---|---|
| Primitive/numeric | All primitive categories, boxed payloads, falsy values, signed zero, NaN/infinities, integer/fraction/safe bounds, whitespace/numeric syntax, overridden coercion. |
| Native identity | Foreign realms, subclasses, prototype/tag imitations, overridden getters/methods, proxies/revocation, real native receivers. |
| Binary | All typed-array constructors in the Node 22 test baseline, DataView, ArrayBuffer/SharedArrayBuffer, detached buffers, resizable out-of-bounds views, foreign values; Chromium additionally covers Float16Array when present. |
| Matchers | Eight typeof names, boxed names, null/undefined, constructors/bounds/arrows/custom hooks, predicates, async/non-boolean returns, invalid descriptors, unions, holes/accessors, shared/cyclic/deep configuration, order/snapshot behaviour, deterministic linear shared-graph inspection, deep iterative evaluation and bound targets with custom hooks/prototypes. |
| Collections | Empty/non-empty/wrong container, sparse/inherited indexes, invalid/fractional/huge lengths, length snapshots, null-prototype dictionaries, symbols/property scope, Map/Set native iteration and exception propagation. |
| Iterators | Method presence without invoking it, one-shot inputs, preserved first item, native truthy completion, malformed records, early close/finally, return errors, unsupported async inputs, non-consuming default checks. |
| Graphs | Repeated primitives, shared acyclic nodes, self/mutual cycles, deep chains, inherited/enumerability/symbol scope, getters, and deterministic generated graphs checked against an independent small-graph reference implementation. |
| Conversions | All 18 public functions; nullish/falsy values, native coercion, NaN/infinities, signed zero, precision boundaries, wrappers, foreign realms, array copy/density/iteration, Date/Symbol identity, condition results, errors and observable input hooks. |
| Package/API | All public root and subpath names, CJS/ESM identity, private-path rejection, executable documentation examples, actual packed-source install, TypeScript true/false branches, dynamic matcher unions, typed sparse arrays and rejected unsafe method calls. |
| Browser | Real DOM nodes, document.all complement/collection invariants, and iframe realms, native Error branch, detached/resizable views, optional APIs, constructor/protocol cases and all applicable documentation examples. |

Some compatibility and regression cases intentionally overlap. The test count does not represent independent root causes or prove every possible behaviour.

## Commands

```sh
npm test
npm run coverage
npm run test:types
npm run test:package -- --source-only
npm run benchmark
```

Type and package checks require the pinned TypeScript development tool or a compatible globally available compiler. For release verification, install the locked development dependencies and Chromium with `npx playwright install chromium`, then run `npm run verify:all`. Its build, artefact and browser checks can also be run individually:

```sh
npm run build
npm run test:build
npm run test:artifacts
npm run test:package
npm run test:tree-shaking
npm run test:browser
```

The normal browser script uses JavaScript Playwright. `npm run test:browser -- --source-only` uses a CommonJS source loader for diagnostics and does not verify esbuild output. `CHROMIUM_EXECUTABLE` optionally selects an existing Chromium installation. The optional `python scripts/test-browser-source.py` runner reproduces the inline source-only check when Python Playwright is installed; it does not replace release-bundle tests.

## Coverage interpretation

Coverage is measured on `src/**`, excluding tests and generated wrappers. The coverage command enforces 100% source-line coverage. Node reports lines, branches and functions separately; a 100% line result does not imply 100% branch coverage. Browser results are not merged into that report. No coverage number is manually rounded up to 100%.

A high coverage percentage does not establish contract correctness, completeness or security. The independent graph oracle, explicit regressions, negative type tests, real-browser checks and clean-consumer installation add different evidence.

## Limits and deliberate exclusions

A finite suite cannot cover every getter, proxy trap, iterator, callback, mutation sequence or JavaScript graph. The suite targets the identified contracts and important boundaries. Infinite iterators and callbacks that never return are documented non-termination cases; tests must not hang indefinitely to demonstrate them.

The library is not a schema validator, arbitrary-object sanitiser or compromised-runtime security boundary. Cross-realm Promise/DOM detection is not promised. Development-tool build and CI versions require their own real execution; source tests are not a replacement for production bundles.

Keep measured counts, exact environments, source revisions and unexecuted checks in a task-owned temporary directory outside the checkout. Historical results apply to the source revision and environment tested. Do not use old test counts for a coverage badge or as evidence for changed code.

## Structural type and native backend regressions

The compile fixtures `native-safety.cts` and `native-safety.mts` check unsafe success/failure narrowing and Date subtype return claims across CommonJS, named/default ESM and focused/source-conversion aliases. `@ts-expect-error` asserts that unsafe code is rejected; compile-and-run fixtures separately exercise safe handling without casts.

`test/native-parity.test.js` compares Node's optional native predicates to the unaccelerated source in isolated VM contexts. It includes changed prototypes, foreign values, tags, getters, proxies, detached buffers, optional process absence and post-import reassignment. The public contract, not private helper calls, is the correctness oracle.

`scripts/benchmark-native-exceptions.js --assert-zero` is a separate performance diagnostic for Node hosts supporting native acceleration; it is not a browser requirement or a timing assertion. The esbuild tree-shaking gate must use the pinned real toolchain and records contributing modules and output bytes.

## Host capability checks

`test/platform-capabilities.test.js` imports the real public modules in isolated child processes with selected host features present or absent. It checks Error branding, conservative tag rejection, captured intrinsics, optional collection constructors and local DOM-constructor semantics. These constructor checks complement the real DOM tests in Chromium; they do not replace browser execution.

The numeric public functions handle primitive numbers before calling the private payload helper. Its defensive primitive guards are therefore not reached through the public API and remain visible in the branch report.

## Independent contract checks

`test/independent-oracles.test.js` compares deterministically generated shared matcher graphs with a bounded recursive reference interpreter. It checks results, callback order, number of calls and exceptions, and compares conversions with native operations across varied inputs.

`test/matcher-oracle.test.js` adds an independently seeded shared-graph corpus with stateful predicates and exception traces. `test/source-examples.test.js` executes the expected results in generated source JSDoc. The browser runner also executes the actual JSDoc examples, including DOM cases, against each distributed format and verifies recovery when optional-host discovery throws. These checks supplement the README, API-metadata, native/fallback, compiler and browser tests; no finite suite proves every possible JavaScript program.

`test/native-backend-and-sizing.test.js` checks optional-host initialisation failure recovery, native/fallback numeric behaviour with foreign/modified/imitation/proxy values, and unsized-input diagnostics without consuming anything. Benchmarks and inspector exception counts remain separate from timing-independent behavioural assertions.
