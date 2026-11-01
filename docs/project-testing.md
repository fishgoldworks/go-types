# Test strategy

Runtime behaviour is tested with Node's built-in `node:test` and `node:assert/strict`. The main `npm test` command also runs documentation examples and compiles their TypeScript snippets, so install the locked development dependencies with `npm ci` before running the complete suite or coverage. A globally resolvable TypeScript installation is not a substitute for the locked toolchain. Individual behavioural tests that import only the built-in test/assert modules can still run without external dependencies.

Tests check public root and subpath behaviour, documented exceptions, termination, iterator closing and application-visible side effects. Assertions target the public contract rather than private helper calls, intermediate implementation values or mocked native results.

## Contract coverage

| Group             | Covered cases                                                                                                                                                                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitive/numeric | All primitive categories, boxed payloads, falsy values, signed zero, NaN/infinities, integer/fraction/safe bounds, whitespace/numeric syntax, overridden coercion.                                                                                                                                                           |
| Native identity   | Foreign realms, subclasses, prototype/tag imitations, overridden getters/methods, proxies/revocation, real native receivers.                                                                                                                                                                                                 |
| Binary            | All typed-array constructors in the Node 22 test baseline, DataView, ArrayBuffer/SharedArrayBuffer, detached buffers, resizable out-of-bounds views, foreign values; Browser engines additionally cover Float16Array when present.                                                                                           |
| Matchers          | All eight native typeof names, direct/foreign/bound predicates, explicit instance predicates, required arguments, rejected boxed names/descriptors/arrays, primitive boolean results, callback receiver/argument/error identity, empty collections and wrong-type inputs, indexed reads, live state and short-circuit order. |
| Collections       | Empty/non-empty/wrong collection type, sparse/inherited indexes, invalid/fractional/huge lengths, length snapshots, null-prototype dictionaries, symbols/property scope, Map/Set native iteration and exception propagation.                                                                                                 |
| Iterators         | Method presence without invoking it, one-shot inputs, preserved first item, native truthy completion, malformed records, early close/finally, return errors, unsupported async inputs, non-consuming default checks.                                                                                                         |
| Graphs            | Repeated primitives, shared acyclic nodes, Map keys/values and Set members, mixed/deep cycles, inherited/enumerability/symbol scope, getters, and generated property/collection graphs checked against independent reference implementations.                                                                                |
| Conversions       | All public conversion functions; nullish/falsy values, native coercion, NaN/infinities, signed zero, precision boundaries, wrappers, foreign realms, array copy/density/iteration, Date/Symbol identity, condition results, errors and observable input hooks.                                                               |
| Package/API       | All public root and subpath names, CJS/ESM identity, private-path rejection, executable documentation examples, actual packed-source install, TypeScript true/false branches, dynamic type names, typed sparse arrays and rejected unsafe method calls.                                                                      |
| Browser           | Real DOM nodes, document.all complement/collection invariants, and iframe realms, native Error branch, detached/resizable views, optional APIs, constructor/protocol cases and all applicable documentation examples.                                                                                                        |

Source tests and coverage load canonical implementations through the small development entry. Public-path tests live in `test/package/` and run against an isolated tarball installation, alongside the older-runtime fixtures in `test/runtime/`. Standalone type and tree-shaking checks use a temporary consumer of the built package; release gates use the exact tarball.

`scripts/test.js` discovers `test/**/*.test.js` in a stable order and fails if no matching test files exist. Node options are forwarded before the discovered paths. A deliberate name filter that matches no test cases and explicit capability skips retain Node's normal behaviour; they are not evidence that the full suite passed.

`test/verification-tooling.test.js` exercises the real runner in isolated fixtures, checking discovery, option forwarding, failure exits, skips and coverage thresholds. It also verifies consumer-process diagnostics, asynchronous staging cleanup and isolation, and relative-module identity in the source-only loader. These are infrastructure controls, not a substitute for regressions in each runtime review area.

`test/benchmark-tooling.test.js` exercises benchmark loading with a neighbouring manifest, custom package entry points, explicit files and directory fallback. It checks worker-error exit codes and a real intentional timeout without asserting a performance threshold. Controlled-clock fixtures verify median-report arithmetic for odd and even sample counts; these fixtures do not measure runtime speed.

Some compatibility and regression cases intentionally overlap. The test count does not represent independent root causes or prove every possible behaviour.

## Commands

```sh
npm test
npm run coverage
npm run build
npm run test:types
npm run pack:package
npm run test:package -- --source-only
npm run benchmark
```

Installed-package checks require the pinned local TypeScript development tool. They compile strict ES2017 consumers with legacy node and Node16 resolution, checking every public CommonJS alias before executing the emitted JavaScript. The main declaration fixtures also check NodeNext resolution with ES2020 libraries. `scripts/test-tooltips.js` uses the TypeScript language service against the installed package to check purpose, result meaning and reference links in editor hovers and signature help, covering all public functions through root and focused CommonJS/ES module imports. For release verification, install the locked development dependencies and browser engines with `npx playwright install chromium firefox webkit`, then run `npm run verify:all`. Its build, artefact and browser checks can also be run individually:

```sh
npm run build
npm run test:build
npm run test:artifacts
npm run pack:package
npm run test:package
npm run test:tree-shaking
npm run test:browser
```

The complete gates build and pack once, then verify the same tarball, reporting its SHA-256 digest. The shared subprocess runner defaults to a three-minute limit. The combined installed-package and browser check in `verify:all` has a ten-minute aggregate budget; individual command limits and browser operation timeouts remain unchanged. Build tests cover replacement/rollback failures, unchanged canonical inputs, repeatability, stale and removed entries, invalid generation destinations, failed-build packing and wrong-directory lifecycle guards. An explicit missing tarball must fail instead of silently repacking the checkout. Artefact checks compare embedded source-map content with packaged source after normalising line endings; the build suite deliberately corrupts each map format to verify rejection. The source-map boundary fixtures also reject maps or mapped sources outside the package, absolute source paths, escaping source symlinks, nonempty `sourceRoot` and empty source inventories. They use the existing generated package as their control; passing them does not prove a fresh build succeeded or that every encoded mapping position is correct.

Packing-phase tests in `scripts/test-package-workflow.js` use a deliberately small build fixture and the real local npm pack operation. They check successful replacement, original-error preservation when cleanup also fails, failed-build short-circuiting, and rejection of stale documentation without dumping per-byte Buffer differences. They do not replace the real bundler and filesystem rollback tests. Build-failure assertions require evidence that the intended injected stage was actually reached; missing dependencies must not be described as tested minifier or replacement recovery.

The normal browser script uses JavaScript Playwright to run Chromium, Firefox and WebKit, and reads `package/dist/`; the release gate runs the same checker against the installed tarball. `npm run test:browser -- --source-only` uses a CommonJS source loader for diagnostics and does not verify esbuild output. `CHROMIUM_EXECUTABLE` optionally selects an existing Chromium installation. The optional `python scripts/test-browser-source.py` runner reproduces the inline source-only check when Python Playwright is installed; it does not replace release-bundle tests.

The optional Python runner reads source, browser contracts and API metadata as UTF-8 independently of the system locale. Run `python test/python-browser-runner.test.py` to check the text handed to Playwright under UTF-8 and CP1252 defaults; this standard-library regression needs Node and Python, but no Playwright installation. It checks transport fidelity, not browser behaviour. Run the optional browser command itself for that behaviour.

## Coverage interpretation

Coverage is measured on loaded files matching `src/**`, excluding tests and generated wrappers. The include pattern filters measured files; it does not automatically load unimported source. The canonical aggregate and behavioural tests must reach the supported implementations. The coverage command enforces 100% source-line coverage. Node reports lines, branches and functions separately; a 100% line result does not imply 100% branch coverage. Browser results are not merged into that report. No coverage number is manually rounded up to 100%.

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

`test/platform-capabilities.test.js` imports the real public modules in isolated child processes with selected host features present or absent. It checks Error branding, conservative tag rejection, captured intrinsics, optional collection constructors and local DOM-constructor semantics. These constructor checks complement the real DOM tests across browser engines; they do not replace browser execution.

The numeric public functions handle primitive numbers before calling the private payload helper. Its defensive primitive guards are therefore not reached through the public API and remain visible in the branch report.

`test/native-identity-lifecycle.test.js` checks timestamp transitions, frozen collection and RegExp inspection, trapping proxies, resizable and growable buffer/view states, and error payload getters. The same explicit expectations run against the public source entry and portable source in a separate realm. The browser contract also checks DOM adoption against each engine's native local-instance semantics (adoption can change the prototype realm), and binary state transitions. These test additions protect existing behaviour; passing both backends does not prove equivalence for every input.

## Independent contract checks

`test/independent-oracles.test.js` compares conversions with native operations across varied inputs. Matcher regressions separately check explicit expected results, callback order, number of calls and exceptions.

`test/matcher-oracle.test.js` checks a hand-specified corpus across all four collection families, including wrapper distinctions and composed predicates. `test/source-examples.test.js` executes the expected results in generated source JSDoc. The browser runner also executes the actual JSDoc examples, including DOM cases, against each distributed format and verifies recovery when optional-host discovery throws. These checks supplement the README, API-metadata, native/fallback, compiler and browser tests; no finite suite proves every possible JavaScript program.

`test/native-backend-and-sizing.test.js` checks optional-host initialisation failure recovery, native/fallback numeric behaviour with foreign/modified/imitation/proxy values, and unsized-input diagnostics without consuming anything. Benchmarks and inspector exception counts remain separate from timing-independent behavioural assertions.

`test/value-boundaries.test.js` checks optional classifier-property failures through real public imports and isolated hosts, once-only capability capture, preserved execution errors, primitive/boxed boundaries and current-prototype classification. The browser contract additionally checks `document.all` after prototype changes and restores its original prototype after each case. These host fixtures do not claim protection from a compromised runtime.

`test/protocol-lifecycle.test.js` checks precise method reads without invocation, live capability changes, primitive and boxed inputs, local Promise constructor selection and error propagation. The browser contract includes callable HTMLDDA method values and checks of sized collections. These checks do not guarantee that an arbitrary detected method will execute successfully.

`test/collection-conversion-lifecycle.test.js` checks native iterator acquisition and completion, overridden iteration, entry-slot read order, error precedence, shallow reference preservation and conditional re-entrancy. Its documentation controls check that each Map/Set conditional error link targets the corresponding base conversion, not merely an existing anchor. `test/types/conversion-inference.cts` protects callback-body inference, explicit receiver requirements, literal/dynamic condition results and collection element inference; `test/types/runtime-safe.cts` executes bound and receiver-independent controls. These are observable-contract checks, not private-helper assertions.

`test/sized-container-lifecycle.test.js` protects sized-input dispatch, cardinality-only reads, captured matcher/length state with live indexed values, Map key/value ordering, dictionary key snapshots and non-consuming handling of native collections. `test/types/collection-inference.cts` and its ESM companion check callback-body/receiver inference, bound controls, conservative result signatures and all collection-content predicate positions. These assertions protect the documented contracts rather than prescribing private helper calls.

`test/numeric-text-contract.test.js` checks numeric partitions against an independent binary64 encoding model, including subnormal and safe-integer boundaries. It separates numeric-string grammar from JSON syntax and covers whitespace, escapes, overflow, underflow, precision, primitive/boxed bigints, poisoned hooks and captured built-ins. Explicit expectations run against canonical and portable source APIs; neither backend supplies the other's expected results. The browser contract includes foreign-wrapper and text-grammar controls. These checks do not promise lossless parsing or schema validation, and are not benchmarks.

`test/scalar-conversion-contract.test.js` protects scalar coercion hints and fallback ordering, exact thrown values, wrapper conversion versus identity, Date clipping, Symbol description conversion, realm-local boxing and condition ordering. The scalar-inference fixtures check primitive-intersection boxing, preserved object types, literal/dynamic conditions and contextual callback types through CommonJS and ESM imports. Runtime-safe and ES2017 consumers execute the successful boxing and identity cases; negative type checks prevent boxed results from being used as primitives.

`test/graph-lifecycle.test.js` checks stable reachable graphs against a topological-elimination oracle built from explicit adjacency lists, rather than copying the runtime's active-path traversal. It covers inherited edges and hidden shadows, getter receivers, repeated shared nodes, abrupt-exit recovery, re-entrant checks, distinct proxy vertices and frozen foreign objects. It also checks mixed object/Map/Set graphs against the independent oracle. `test/isCircular.test.js` covers native contents, property-first ordering, overridden iterators and methods, foreign/subclass/prototype/proxy controls, error identity, re-entrancy and deep mixed graphs. The browser contract adds native collection cycles, isolated HTMLDDA graphs and foreign getter/shadow controls. Fresh-load optional-capability tests cover constructor and method absences and their fallback dependencies. Hidden properties, symbols, weak entries and arbitrary iterable contents remain excluded; these checks make no timing or garbage-collection claims.

`test/types/optional-iterator.cts` and its ESM companion check optional/nullable iterator precedence in array conversion declarations, callback-body inference, and requested versus skipped conversion results. Positive controls retain definite iterable and plain/definitely-nullish array-like inference. The strict ES2017 fixture and compiled runtime-safe cases exercise the same boundary. The declaration verifier also compiles and executes all focused ESM alias declarations, checking signature assignability and rejecting implicit `any`, rather than relying only on CommonJS routes.
