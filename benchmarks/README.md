# Public-API smoke benchmarks

Run `npm run benchmark` (or `node scripts/benchmark.js` for JSON-only output). `BENCH_ITERATIONS` and `BENCH_ROUNDS` configure sample length and repeated rounds. The runner defines the default sample, round and warm-up counts.

The harness reports all samples and their median nanoseconds per call. For an even number of rounds, the median is the average of the two middle sorted samples. It consumes results to keep the workload observable. Cases cover native/captured array identity with the same input mix, primitive-plus-boxed number checks, ordinary-object collection negatives, repeated matcher validation versus a reused compiled checker, array validation and non-nullish filtering.

These measurements include the cost of dispatching the benchmark and consuming results. Just-in-time compilation, garbage collection, process scheduling, input distributions and runtime versions affect results. Measurements do not establish a statistically reliable speedup, a cross-engine ranking, worst-case complexity or production throughput.

The preconstructed union specification is held constant; the direct `isTypeOf` case still compiles it on every call. The array-collection case includes creation of its small input array; account for that cost when comparing results.

Use repeated independent process runs and realistic application inputs before setting performance requirements. Do not replace correct native branding with weaker tag/prototype heuristics merely to improve a microbenchmark. Capturing a native reference is not, by itself, a speed claim.

Keep benchmark output in a task-owned temporary directory outside the checkout, recording the source revision, runtime, platform and sample configuration.

## Compare two versions

Run `node scripts/benchmark-compare.js /absolute/old/root /absolute/new/root` for alternating isolated-process measurements and `node scripts/benchmark-matcher-scaling.js /absolute/old/root /absolute/new/root` for shared-union scaling. See [the performance guide](../docs/performance.md).

## Dictionary and descriptor paths

Run `node scripts/benchmark-hot-paths.js /absolute/old/root /absolute/new/root` for warmed processes in alternating version order, with identical input sequences and all raw samples. This covers dictionaries, Maps/Sets, scalar descriptors, primitive/boxed numbers and already-fast controls.

`node scripts/benchmark-native-exceptions.js` counts native exception events independently of timing. `--assert-zero` checks the targeted optimised paths on Node versions exposing `process.getBuiltinModule`; it is not a browser/fallback requirement.
