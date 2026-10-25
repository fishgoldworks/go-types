# Changelog

## 2.0.0 — Unreleased

This major update removes `isTypeOf` and `isThenable`, retains the other 43 root exports from 1.3.1 and adds 50 functions. Read the [migration guide](docs/migration.md) before upgrading.

### Breaking changes

- `toPlainObject` and requested `toPlainObjectIf` conversions reject strings with `TypeError`; JSON parsing belongs to `fromJson`. Object copying and entry conversion are unchanged.
- Removed `isThenable`; use `isPromiseLike` for the same callable-`then` check. `isPromiseLike` no longer requires or reads `catch`.
- Removed `isTypeOf`. Collection matchers accept only required type-name strings or predicates; use an explicit predicate for `instanceof`. Predicate results must be synchronous primitive booleans.
- Missing or invalid matchers throw before input inspection, including empty and wrong-container inputs. Boxed names, matcher arrays and descriptors are no longer accepted.
- Empty arrays and array-like values pass valid element constraints. Array-like lengths must be non-negative safe integers.
- Null-prototype dictionaries qualify as plain objects, and whitespace-only strings are no longer numeric.
- `isEmpty` and `isBlank` reject unsized iterators and iterables without advancing them. Use the explicit consuming helpers when iteration is intended.
- Private implementation imports are no longer public entry points. The supported CommonJS runtime minimum is Node.js 8.0.0; see the runtime guide for ESM and browser requirements.

### Added

- Map/Set content checks, safe-integer and non-nullish helpers, binary-data checks, iterator/async-iterable checks and explicit consuming iterable checks. `isJson` is now exported from the root.
- Seventeen conversions with matching conditional variants: primitive values, arrays, maps, sets, plain objects, JSON parsing/serialisation, boxing/unboxing, regular expressions and promises. See the [conversion guide](docs/conversions.md) for input, identity, precision and error rules.
- Default and named ES module imports at the package root and every function subpath, direct CommonJS function imports and TypeScript declarations. Legacy CommonJS declarations support TypeScript 4.5; Node16/NodeNext requires 4.9 and Bundler requires 5.0.
- Readable, minified and standalone ES module browser bundles with source maps and MIT notices.

### Fixed

- Genuine native-type and cross-realm recognition, array-like validation, JSON validation and cycle detection. Shared acyclic children and repeated primitive values are not cycles.
- Browser `document.all` handling and missing optional native APIs, including import safety and clear errors for unavailable requested conversions.
- Collection checks preserve callback order, exceptions and short-circuiting without probing callbacks during validation.

### Documentation

- Clarified type-checking and conversion contracts, standardised imports and API wording, and aligned README, reference and editor documentation. Corrected contributor runtime guidance and kept examples compatible with the supported runtime.

### Development

- Generates a private-root-owned consumer package with transactional build replacement, exact-tarball verification and guarded root publication.
- Adds source, declaration, documentation, installed-consumer and real-browser checks. Local `temp/` and `.tmp/` directories remain outside the distribution and verification inputs.

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
