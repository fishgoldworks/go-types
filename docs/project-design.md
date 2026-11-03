# Library design

This guide records go-types design constraints. The library provides small, composable checks and explicit conversions with stable, documented contracts.

- Keep zero runtime dependencies and small CommonJS source modules. The public API includes collection-content checks, collection normalisation and conversions. The changelog records published upgrade changes. Matcher validation stays internal; use go-fns to combine predicates.
- Prefer captured standard intrinsics where their contracts match; no speculative legacy polyfills and no security claims about a compromised runtime.
- Validate required type-name strings or predicates before inspecting collection inputs. Never probe predicates during validation or infer constructor intent. Preserve traversal, callback order, short-circuiting and exceptions; evaluate callback results using JavaScript truthiness and return primitive booleans from checks.
- `isArrayOf` and `isArrayLikeOf` accept empty inputs. Holes are read through ordinary indexed access. Non-empty array detection is separate.
- Include null-prototype plain dictionaries. Reject whitespace-only numeric strings. Preserve boxed Number/String/Boolean support and primitive-only Symbol/BigInt checks.
- Default empty/blank operations inspect sized collections and plain dictionaries without advancing caller iterators. Unsized iterable/iterator inputs throw. Map blankness concerns values; Set blankness concerns items.
- Binary checks establish native identity across realms; detached buffers/views remain their respective types. Protocol checks do not invoke the checked methods.
- Cycle detection follows enumerable string properties, including inherited, and genuine Map keys/values and Set members. Preserve property-first order and shared identity. Exclude symbols, non-enumerables, weak entries and arbitrary iterable contents; keep one fixed public policy and the private traversal helper.
- Normalise single-item-or-array inputs with `ensureArray`: preserve genuine array identity and readonly types; wrap supplied non-array values once without iteration or coercion; omission creates a fresh empty array. Normalise item/array/Set inputs with `ensureSet`: preserve genuine Set identity; arrays use native construction; other supplied values remain single members. Keep non-function-object inspection private under its explicit name.
- Keep local-realm Promise and DOM instance checks and document their prototype-chain and realm limitations.
- Type declarations are conservative: no unsafe integer/blank/plain-object/boxed-primitive negative-branch narrowing. Exact primitive checks and non-nullish filtering narrow.
- Use `node:test` for public-API tests, alongside independent generated graph/model tests, TypeScript consumer tests, browser tests and packed-package checks.
- Publish supported source, entries, declarations, bundles and documentation. Keep private helpers, tests and development tooling outside the public API.
- Expose focused base conversions and normalisers; compose conditional conversion with go-fns applyIf instead of publishing conversion-specific variants.
- Target Node >=8 for CommonJS consumers and the [documented ESM and browser requirements](runtime.md#supported-environments-and-verification). Keep development tools on Node >=22.16.0. Keep measured verification evidence separate from product documentation.

## Source and package boundaries

The private root manifest owns identity, version and development tooling. `scripts/package-layout.js` owns consumer runtime requirements and explicitly selects shared consumer metadata, and `scripts/generate-entries.js` derives the full import and declaration surface from `scripts/exports.json` into an owned staging directory. `scripts/build.js` assembles source and consumer docs, builds and checks bundles, then replaces `package/` with rollback on failure. Generated aliases, ESM wrappers, type wrappers and distributions belong only in that ignored output.

`pack:package` builds and packs fresh output. `verify` and `verify:all` use the same packer once and pass its exact tarball to the installed-consumer checks; the latter adds browser checks. Source tests continue to measure canonical implementations. Consumer resolution, type, tree-shaking and browser tests share reusable checks against the installed output. Local linking targets the built package. See [Contributing](../CONTRIBUTING.md) for commands and manual publication.
