# Library design

This guide records go-types design constraints. The library provides small, composable checks and explicit conversions with stable, documented contracts.

- Keep zero runtime dependencies and small CommonJS source modules. Preserve 46 original root export names. The 84-function API also includes reusable checkers, typed Map/Set validators and 22 conversions.
- Prefer captured standard intrinsics where their contracts match; no speculative legacy polyfills and no security claims about a compromised runtime.
- Compile and fully validate matcher configuration before checking any input. No constructor bodies or predicates run during compilation. Compile a compact directed acyclic graph of unions using an explicit stack, reject cyclic unions, snapshot each array once per compilation, and preserve callback order and number of calls. Native instance prototype errors are deferred until evaluation rather than inferred from constructibility. Instance matching remains native instanceof.
- `isArrayOf` and `isArrayLikeOf` accept empty inputs. Holes are read through ordinary indexed access. Non-empty array detection is separate.
- Include null-prototype plain dictionaries. Reject whitespace-only numeric strings. Preserve boxed Number/String/Boolean support and primitive-only Symbol/BigInt checks.
- Default empty/blank operations inspect sized containers and plain dictionaries without advancing caller iterators. Unsized iterable/iterator inputs throw. Provide explicit iterable variants with documented consumption/closing and termination limitations. Map blankness concerns values; Set blankness concerns items.
- Binary checks establish native identity across realms; detached buffers/views remain their respective types. Protocol checks do not invoke the checked methods.
- Keep existing cycle traversal scope: enumerable string properties, including inherited; no symbols, non-enumerables or Map/Set entries.
- Keep local-realm Promise and DOM instance checks and document their prototype-chain and realm limitations.
- Type declarations are conservative: no unsafe integer/blank/plain-object/boxed-primitive negative-branch narrowing. Exact primitive checks and non-nullish filtering narrow.
- Use `node:test` for public-API tests, alongside independent generated graph/model tests, TypeScript consumer tests, browser tests and packed-package checks.
- Publish supported source, entries, declarations, bundles and documentation. Keep private helpers, tests and development tooling outside the public API.
- Expose all eleven native-first conversions and their eleven conditional counterparts. Document nullish input, output identity, exceptions, precision and iteration; skipped conversions do not inspect the input.
- Target Node >=8 for CommonJS consumers and the [documented ESM and browser requirements](runtime.md#supported-environments-and-verification). Keep development tools on Node >=22.16.0. Keep measured verification evidence separate from product documentation.

## Source and package boundaries

The root manifest owns identity, version, runtime requirements and development tooling; it is private. `scripts/package-layout.js` explicitly selects consumer metadata, and `scripts/generate-entries.js` derives the full import and declaration surface from `scripts/exports.json` into an owned staging directory. `scripts/build.js` assembles source and consumer docs, builds and checks bundles, then replaces `package/` with rollback on failure. Generated aliases, ESM wrappers, type wrappers and distributions belong only in that ignored output.

`pack:package` builds and packs fresh output. `verify` and `verify:all` use the same packer once and pass its exact tarball to the installed-consumer checks; the latter adds browser checks. Source tests continue to measure canonical implementations. Consumer resolution, type, tree-shaking and browser tests share reusable checks against the installed output. Local linking targets the built package. See [Contributing](../CONTRIBUTING.md) for commands and manual publication.
