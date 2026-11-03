# Performance

## What the implementation optimises

Type-name strings use shared checks. Collection calls validate each required matcher once and reuse the resulting check for their entries. Predicates run in traversal order, stop at the first failure and are never cached or called during validation.

Actual-array empty/blank checks bypass irrelevant boxed-String/Map/Set receiver checks. These used to create and catch exceptions on the ordinary array path. Lengths and items are still read according to the same array-like policy, including observable getters, unsupported-size errors and sparse/inherited indices.

Numeric refinements extract a boxed Number payload once rather than repeatedly routing through other validators. Primitive numbers bypass receiver probes; captured native numeric operations are used where their behaviour matches the contract. Prototype and tag imitations still fail; ordinary object negatives for native brands can still require an intrinsic rejection. Fast paths do not substitute weaker string-tag identity checks.

## Non-throwing native-brand paths on Node

When available, captured `node:util.types` predicates handle native brand checks. Ordinary dictionaries no longer create and catch three incompatible-receiver exceptions before reaching empty/blank dictionary logic. Map/Set dispatch and matcher validation also avoid irrelevant receiver errors. Selection happens once through guarded `process.getBuiltinModule`, with no static Node import in browser code.

Browsers and other hosts without the native classifiers retain intrinsic receiver checks. The Node improvement does not establish a browser speed guarantee. Primitive fast paths remain unchanged.

Numeric checks use the captured native Number-object classifier before unboxing on Node. This avoids exception-driven rejection of non-number objects and adds a classifier call for genuine boxed numbers. Hosts without that classifier retain the intrinsic receiver probe.

## Import granularity

Root named ESM exports point directly to per-function implementations so bundlers can omit unused functions. `sideEffects: false` and the existing focused imports are retained. The default export still exposes the full namespace, and CommonJS/ESM share the same function instances.

This is a bundler optimisation, not native Node lazy loading. Use `import isArray from 'go-types/isArray'` to load only that implementation in Node. `npm run test:tree-shaking` performs an actual esbuild consumer-bundle check and compares root named versus focused imports while rejecting unrelated matcher/conversion code in the output.

## Repeated validation

Collection checks such as `isArrayOf` validate a type-name string or predicate once per call and reuse it for their entries. Predicate closures retain their live state.

Use the logic utilities in [go-fns](https://github.com/fishgoldworks/go-fns) to combine existing predicates into reusable functions. Go Types does not depend on go-fns.

Conversions retain native coercion semantics. Where the converted value is needed, convert once and validate the result rather than performing redundant conversion and validation passes.

## Reproduce measurements

```sh
npm run benchmark
node scripts/benchmark-compare.js /path/to/previous-library /path/to/updated-library
node scripts/benchmark-matcher-scaling.js /path/to/previous-library /path/to/updated-library
node scripts/benchmark-hot-paths.js /path/to/previous-library /path/to/updated-library
node scripts/benchmark-native-exceptions.js
node scripts/benchmark-numeric-paths.js /path/to/previous-library /path/to/updated-library
```

The comparison uses identical input sequences, consumes results, warms each case and repeats each library in independent processes with alternating order. It reports the median of process medians and keeps every raw sample. The scripts define the batch and process counts. The scaling probe uses fresh subprocesses with deadlines to bound each measurement.

The scripts accept source checkout directories, generated `package/` directories or explicit CommonJS entry files. Directory inputs use the package's declared `main` or Node's directory index fallback, even when a neighbouring `package.json` exists. Matcher-scaling timeouts remain reported results; unexpected worker failures retain their diagnostics and make the command exit unsuccessfully.

The comparison and matcher-scaling scripts print JSON when supplied with two source revisions. Keep results, source revisions and environment details in a task-owned temporary directory outside the checkout.

These local microbenchmarks do not guarantee application latency or another runtime's speed. Garbage collection, just-in-time compilation, CPU load and timer resolution affect very small measurements. Timings also include benchmark dispatch and result-consumption overhead. Near-equal nanosecond results are not reliable evidence of improvement or regression.

No timing threshold is a unit-test assertion. Behaviour tests check answers, exceptions, callback order, indexed reads and mutations independently of timing.

The hot-path comparison also alternates versions in separate processes, warms each case, uses identical inputs and consumes results. It prints every timing sample as JSON. Exception events are counted separately with the Node inspector; timing is never gathered under that debugger. Measurements do not establish a universal speedup or describe unmeasured generated bundles.

## Numeric rejection trade-off

The numeric-path script reports primitive, genuine boxed, non-number object and mixed inputs separately for finite, integer, safe-integer and numeric checks. The Node optimisation targets frequently rejected objects; it does not make every successful boxed-number check faster. Inspect the full results before applying a rejection-path speedup to an application dominated by primitive numbers. Exception instrumentation is disabled during timing.
