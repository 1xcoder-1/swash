# swash monorepo

The publishable package lives in [`packages/swash`](packages/swash) and its README is
[`packages/swash/README.md`](packages/swash/README.md). Start there for usage, props and
the reasoning behind each component.

This repository holds a pnpm workspace:

- `packages/swash/` the library itself, the only thing that gets published, with its
  CI gates (`scripts/gates.mjs`) and packaged-output smoke test (`scripts/smoke.mjs`)
- `docs/superpowers/` the design spec and the implementation plan it was built from

Common commands, run from the repository root:

```bash
pnpm install
pnpm --filter swash check    # gates + build + smoke test
pnpm --filter swash test     # vitest suite
pnpm --filter swash build    # dist + type declarations
```
