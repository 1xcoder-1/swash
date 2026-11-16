# react-swash monorepo

The publishable package lives in [`packages/swash`](packages/swash). Its README ([`packages/swash/README.md`](packages/swash/README.md)) covers usage, props, and design rationale.

This repository is a pnpm workspace:

- `packages/swash/` the library, published to npm as `react-swash`, with CI gates (`scripts/gates.mjs`) and a packaged-output smoke test (`scripts/smoke.mjs`)
- `apps/docs/` the documentation site (Next.js)

Common commands, run from the repository root:

```bash
pnpm install
pnpm --filter react-swash check    # gates + build + smoke test
pnpm --filter react-swash test     # vitest suite
pnpm --filter react-swash build    # dist + type declarations
```
