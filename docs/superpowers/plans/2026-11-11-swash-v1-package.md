# Swash v1 Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `swash` npm package: 7 production-grade text effect components (Typewriter, Frame, Reveal, Scramble, Morph, Counter, Marker) on a shared engine, fully tested.

**Architecture:** Monorepo at the repo root (`i:\New folder`). `packages/swash/` holds the library: one `shared/` engine that enforces the four production rules (grapheme-safe, live reduced-motion, no re-render restart, no-crash props) plus one folder per component. Components drive animation through refs and WAAPI, never through React state per frame. The docs site (`apps/docs/`) is a separate plan and comes after this package works.

**Tech Stack:** React 19 (peer `>=18`), TypeScript, tsup, pnpm workspaces, Vitest + React Testing Library + jsdom, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-11-swash-design.md`

**Reference sources to port from (untracked, kept local, do not commit):**
- `kasumi-main/packages/kasumi/src/` useTypewriter.ts, timing.ts, blur.ts
- `ram-main/packages/ram/src/` ram.tsx, animate.ts, metrics.ts

## Global Constraints

- Package name is `swash`, bare, verified free on npm on 2026-11-11.
- Zero runtime dependencies. `react` and `react-dom` are peerDependencies `>=18.0.0` only.
- Install all devDependencies with `@latest` at task time; do not pin versions from memory.
- Every component entry file starts with `"use client"` on line 1. A test enforces this.
- `split('')` is banned in `packages/swash/src/`. The same test greps for it.
- Every completed task ends in exactly one local commit. Nothing is pushed during this plan; the single PR happens in the docs-site plan at the end.
- No em dashes or hyphen-dashes in user-facing text (README, JSDoc, error messages, docs copy).
- Mandatory design skills during this plan: `/state-machine` and `/break` run against each component after its tests pass (throwaway pages under `/tmp/`, never committed); `/better-ui` and `/interface-review` run over the final package demos before the closing commit of the plan.
- Tests live next to code: `packages/swash/src/<folder>/<name>.test.tsx`.
- jsdom has no layout and no WAAPI. Every test file that touches animation uses the shared `installWaapiMock()` helper defined in Task 1.

---

### Task 1: Monorepo scaffold + test harness

**Files:**
- Create: `package.json` (root, workspace manifest)
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `packages/swash/package.json`, `packages/swash/tsconfig.json`, `packages/swash/tsup.config.ts`, `packages/swash/vitest.config.ts`
- Create: `packages/swash/src/index.ts` (empty for now, one export added per task)
- Create: `packages/swash/src/test/waapi-mock.ts`
- Create: `packages/swash/src/test/scaffold.test.tsx`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `installWaapiMock(): void` installs `Element.prototype.animate` returning `{ finished: Promise<void>, cancel(), finish(), play(), currentTime: number }` and records calls on `HTMLElement.prototype.__animateCalls` (array per element). All later test files import it.
- Produces: pnpm scripts `dev`, `build`, `test`, `lint`, `typecheck` at the repo root.

- [ ] **Step 1: Init the workspace.** Create root `package.json`:

```json
{
  "name": "swash-monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r --filter swash build",
    "test": "pnpm -r --filter swash test",
    "typecheck": "pnpm -r --filter swash typecheck"
  }
}
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - packages/*
```

Create `.gitignore`:

```
node_modules/
dist/
coverage/
kasumi-main/
ram-main/
*.tsbuildinfo
```

- [ ] **Step 2: Create `packages/swash/package.json`** (name, exports map, scripts):

```json
{
  "name": "swash",
  "version": "0.1.0",
  "description": "Ready-made, dependency-free text effect components for React.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": { "react": ">=18.0.0", "react-dom": ">=18.0.0" }
}
```

- [ ] **Step 3: Install latest dev toolchain** from the repo root:

```bash
pnpm add -Dw typescript@latest tsup@latest vitest@latest @vitejs/plugin-react@latest jsdom@latest @testing-library/react@latest @testing-library/jest-dom@latest react@latest react-dom@latest @types/react@latest
```

Expected: exit code 0, `pnpm-lock.yaml` created.

- [ ] **Step 4: Create `packages/swash/tsconfig.json`** (strict, jsx react-jsx, lib includes ES2022 for Intl.Segmenter types) and `packages/swash/tsup.config.ts`:

```ts
import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  treeshake: true,
  external: ["react", "react-dom"],
});
```

- [ ] **Step 5: Create `packages/swash/vitest.config.ts`**:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: [] },
});
```

- [ ] **Step 6: Write the failing scaffold test.** Create `packages/swash/src/test/waapi-mock.ts`:

```ts
export function installWaapiMock() {
  const calls = new WeakMap<Element, Array<PropertyDescriptor[] | Keyframe[]>>();
  (Element.prototype as any).animate = function (keys: any) {
    const list = calls.get(this) ?? [];
    list.push(keys);
    calls.set(this, list);
    let done!: () => void;
    const finished = new Promise<void>((r) => (done = r));
    setTimeout(done, 0);
    return { finished, cancel() {}, finish() { done(); }, play() {}, pause() {} };
  };
  (globalThis as any).__waapiCalls = calls;
}
export function animateCallCount(el: Element): number {
  return ((globalThis as any).__waapiCalls.get(el)?.length ?? 0) as number;
}
```

Create `packages/swash/src/index.ts` with only a placeholder export line `export const __swashReady = true;` and `packages/swash/src/test/scaffold.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { installWaapiMock } from "./waapi-mock";
import { __swashReady } from "../index";

describe("scaffold", () => {
  it("imports the package entry", () => {
    expect(__swashReady).toBe(true);
  });
  it("waapi mock records animate calls", () => {
    installWaapiMock();
    const { container } = render(<div />);
    container.firstChild!.animate([], {});
    expect(((globalThis as any).__waapiCalls.get(container.firstChild!).length)).toBe(1);
  });
});
```

- [ ] **Step 7: Run it and watch it pass immediately** (scaffold tasks have no bug to write first; this verifies the harness):

```bash
pnpm --filter swash test
```

Expected: 2 passed.

- [ ] **Step 8: Add CI.** Create `.github/workflows/ci.yml`:

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck && pnpm test && pnpm build
```

- [ ] **Step 9: Commit.**

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml .gitignore .github packages/swash
git commit -m "chore: scaffold swash monorepo with vitest, tsup and ci"
```

---

### Task 2: shared/grapheme.ts, shared/client.ts, shared/warn.ts

**Files:**
- Create: `packages/swash/src/shared/grapheme.ts`
- Create: `packages/swash/src/shared/client.ts`
- Create: `packages/swash/src/shared/warn.ts`
- Test: `packages/swash/src/shared/grapheme.test.ts`, `warn.test.ts`

**Interfaces:**
- Produces: `splitGraphemes(text: string): string[]`
- Produces: `splitWordTokens(text: string): Array<{ text: string; space: boolean }>` (tokens include whitespace runs, flagged)
- Produces: `useIsomorphicLayoutEffect` (layout effect on client, passive effect on server)
- Produces: `warnOnce(key: string, message: string): void` (deduped per key, no-op in production)

- [ ] **Step 1: Write failing tests.** `grapheme.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { splitGraphemes, splitWordTokens } from "./grapheme";

describe("splitGraphemes", () => {
  it("keeps family emoji as one unit", () => {
    expect(splitGraphemes("a👨‍👩‍👧b")).toEqual(["a", "👨‍👩‍👧", "b"]);
  });
  it("keeps combining marks attached", () => {
    expect(splitGraphemes("é")).toEqual(["é"]);
  });
  it("handles RTL text without mangling", () => {
    expect(splitGraphemes("مرحبا")).toHaveLength(5);
  });
  it("returns empty array for empty string", () => {
    expect(splitGraphemes("")).toEqual([]);
  });
});

describe("splitWordTokens", () => {
  it("preserves spaces as flagged tokens", () => {
    expect(splitWordTokens("hi there")).toEqual([
      { text: "hi", space: false },
      { text: " ", space: true },
      { text: "there", space: false },
    ]);
  });
});
```

`warn.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { warnOnce } from "./warn";

afterEach(() => vi.restoreAllMocks());

describe("warnOnce", () => {
  it("warns once per key, not twice", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnOnce("t2-key", "bad preset: nope");
    warnOnce("t2-key", "bad preset: nope");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("bad preset: nope");
  });
});
```

- [ ] **Step 2: Run, verify FAIL** (module not found):

```bash
pnpm --filter swash test src/shared
```

- [ ] **Step 3: Implement.** `grapheme.ts`:

```ts
type SegmenterLike = { segment(input: string): Iterable<{ segment: string }> };
const segmenter: SegmenterLike | null =
  typeof Intl !== "undefined" && (Intl as any).Segmenter
    ? new (Intl as any).Segmenter(undefined, { granularity: "grapheme" })
    : null;

export function splitGraphemes(text: string): string[] {
  if (segmenter) return Array.from(segmenter.segment(text), (s) => s.segment);
  return Array.from(text); // code-point fallback for old engines
}

export function splitWordTokens(text: string): Array<{ text: string; space: boolean }> {
  return text
    .split(/(\s+)/)
    .filter((t) => t.length > 0)
    .map((t) => ({ text: t, space: /^\s+$/.test(t) }));
}
```

`client.ts`:

```ts
import { useEffect, useLayoutEffect } from "react";
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

`warn.ts`:

```ts
const seen = new Set<string>();
export function warnOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (seen.has(key)) return;
  seen.add(key);
  console.warn(`[swash] ${message}`);
}
```

- [ ] **Step 4: Run, verify PASS** (same command as Step 2).
- [ ] **Step 5: Add grapheme + warn exports to `src/index.ts` later; engine internals stay unexported except types components need.**
- [ ] **Step 6: Commit.**

```bash
git add packages/swash/src/shared packages/swash/src/index.ts
git commit -m "feat(shared): grapheme splitting, isomorphic layout effect, dev warn"
```

---

### Task 3: shared/bezier.ts + shared/tween.ts (port of ram animate.ts)

**Files:**
- Create: `packages/swash/src/shared/bezier.ts`
- Create: `packages/swash/src/shared/tween.ts`
- Test: `packages/swash/src/shared/tween.test.ts`

**Interfaces:**
- Produces: `cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number`
- Produces: `EASE: { out: (t:number)=>number; inOut: (t:number)=>number }` where `out = cubicBezier(0.16, 1, 0.3, 1)` and `inOut = cubicBezier(0.65, 0, 0.35, 1)`
- Produces: `tween(opts: TweenOptions): TweenController`

```ts
export interface TweenOptions {
  from: number;
  to: number;
  duration: number;          // ms, >= 0; 0 completes on the first frame
  easing?: (t: number) => number;
  delay?: number;            // ms
  onUpdate: (value: number, progress: number) => void;
  onComplete?: () => void;
}
export interface TweenController { cancel(): void }
```

- [ ] **Step 1: Write failing tests** (`tween.test.ts`, fake timers driving rAF):

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cubicBezier, EASE } from "./bezier";
import { tween } from "./tween";

beforeEach(() => {
  vi.useFakeTimers();
  let now = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: (t: number) => void) => {
    now += 16;
    return setTimeout(() => cb(now), 0) as unknown as number;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("cubicBezier", () => {
  it("anchors endpoints exactly", () => {
    const e = cubicBezier(0.16, 1, 0.3, 1);
    expect(e(0)).toBe(0);
    expect(e(1)).toBe(1);
  });
  it("is monotonic for an ease-out curve", () => {
    let prev = -1;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = EASE.out(t);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("tween", () => {
  it("ends at target with onComplete", async () => {
    const seen: number[] = [];
    const done = vi.fn();
    tween({ from: 0, to: 100, duration: 80, onUpdate: (v) => seen.push(v), onComplete: done });
    await vi.runAllTimersAsync();
    expect(seen[seen.length - 1]).toBe(100);
    expect(done).toHaveBeenCalledTimes(1);
  });
  it("zero duration completes immediately at target", async () => {
    const onUpdate = vi.fn();
    tween({ from: 5, to: 9, duration: 0, onUpdate });
    await vi.runAllTimersAsync();
    expect(onUpdate).toHaveBeenLastCalledWith(9, 1);
  });
  it("cancel stops updates", async () => {
    const onUpdate = vi.fn();
    const c = tween({ from: 0, to: 1, duration: 1000, onUpdate });
    await vi.advanceTimersByTimeAsync(100);
    c.cancel();
    const before = onUpdate.mock.calls.length;
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate.mock.calls.length).toBe(before);
  });
});
```

- [ ] **Step 2: Run, verify FAIL.** `pnpm --filter swash test src/shared`
- [ ] **Step 3: Implement.** Port the Newton-Raphson solver out of `ram-main/packages/ram/src/animate.ts` into `bezier.ts` (same algorithm, cleaned): sample curve, derivative, `newtonRaphson` iterations with `numbersEqual` epsilon, and `subdivide` fallback. Export `cubicBezier` and the `EASE` table. Implement `tween.ts` around a single rAF loop:

```ts
import { EASE } from "./bezier";
export function tween(o: TweenOptions): TweenController {
  const ease = o.easing ?? EASE.out;
  let raf = 0, start: number | null = null, cancelled = false;
  const frame = (now: number) => {
    if (cancelled) return;
    if (start === null) start = now + (o.delay ?? 0);
    if (now < start) { raf = requestAnimationFrame(frame); return; }
    const t = o.duration <= 0 ? 1 : Math.min(1, (now - start) / o.duration);
    o.onUpdate(o.from + (o.to - o.from) * ease(t), t);
    if (t === 1) o.onComplete?.();
    else raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return { cancel() { cancelled = true; cancelAnimationFrame(raf); } };
}
```

- [ ] **Step 4: Run, verify PASS.**
- [ ] **Step 5: Commit.** `git commit -m "feat(shared): cubic bezier solver and rAF tween controller"`

---

### Task 4: shared/motion.ts + shared/inview.ts + shared/presets.ts

**Files:**
- Create: `packages/swash/src/shared/motion.ts`
- Create: `packages/swash/src/shared/inview.ts`
- Create: `packages/swash/src/shared/presets.ts`
- Test: `packages/swash/src/shared/motion.test.ts`, `inview.test.ts`, `presets.test.ts`

**Interfaces:**
- Produces: `useReducedMotion(): boolean` (useSyncExternalStore, live updates)
- Produces: `getReducedMotion(): boolean` (non-hook read for imperative code; false on server)
- Produces: `observeInview(el: Element, opts: { once?: boolean; ratio?: number; rootMargin?: string }, onEnter: () => void): () => void`
- Produces: `FEELS: Record<FeelName, Feel>`, `resolveFeel(feel?: FeelName | Feel): Feel` (never undefined; unknown name warns and falls back to `cinematic`)

```ts
export type FeelName = "cinematic" | "snappy" | "playful";
export interface Feel { charDelay: number; jitter: number; deleteRatio: number; pause: number }
```

- [ ] **Step 1: Write failing tests.**

`motion.test.ts` (mock matchMedia with a controllable matches flag and captured change listeners):

```ts
// key assertions:
// useReducedMotion reflects matchMedia state and re-renders when the change
// listener fires (renderHook from @testing-library/react).
// getReducedMotion() returns false when window.matchMedia is absent.
```

Write it concretely: stub `window.matchMedia` with `vi.stubGlobal`, dispatch `mql.dispatchEvent(new Event("change"))` after flipping `mql.matches`, expect `result.current` to become `true`.

`inview.test.ts`:

```ts
// Stub IntersectionObserver class capturing callbacks + observe/unobserve calls.
// 1) observeInview calls onEnter when isIntersecting fires.
// 2) with once, the returned cleanup ran internally: a second intersect does not fire again.
// 3) calling observeInview twice with the same element+options registers the
//    element only once in the shared observer (idempotence, the countup #699 bug class).
// 4) the cleanup unregisters: observer after unmount has 0 elements.
```

`presets.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { FEELS, resolveFeel } from "./presets";

describe("resolveFeel", () => {
  it("maps known names", () => {
    expect(resolveFeel("snappy")).toBe(FEELS.snappy);
  });
  it("passes custom objects through", () => {
    const f = { charDelay: 5, jitter: 0, deleteRatio: 0.5, pause: 0 };
    expect(resolveFeel(f)).toBe(f);
  });
  it("never returns undefined for garbage input (kasumi crash bug)", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveFeel("not-a-feel" as any)).toBe(FEELS.cinematic);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(resolveFeel("not-a-feel" as any)).toBe(FEELS.cinematic);
    expect(spy).toHaveBeenCalledTimes(1); // warnOnce dedupes
  });
});
```

- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement.**

`motion.ts` exactly as sketched in the spec session: module-level `MediaQueryList` cache, `Set` of listeners, `change` event wired once on first subscribe in browser, `useSyncExternalStore(subscribe, get, () => false)`.

`inview.ts`: registry keyed by `${ratio}|${rootMargin}`, one `IntersectionObserver` per key, `Map<Element, Set<handler>>` per observer; `once` removes after firing; returned cleanup deletes handler and unobserves the element when its set empties.

`presets.ts`:

```ts
import { warnOnce } from "./warn";
export type FeelName = "cinematic" | "snappy" | "playful";
export interface Feel { charDelay: number; jitter: number; deleteRatio: number; pause: number }
export const FEELS: Record<FeelName, Feel> = {
  cinematic: { charDelay: 42, jitter: 0.1, deleteRatio: 0.45, pause: 1400 },
  snappy:    { charDelay: 18, jitter: 0.05, deleteRatio: 0.3, pause: 700 },
  playful:   { charDelay: 55, jitter: 0.2, deleteRatio: 0.6, pause: 1000 },
};
export function resolveFeel(feel?: FeelName | Feel): Feel {
  if (typeof feel === "object" && feel) return feel;
  if (feel === undefined) return FEELS.cinematic;
  const found = FEELS[feel as FeelName];
  if (!found) {
    warnOnce(`feel:${String(feel)}`, `unknown feel "${String(feel)}", using cinematic`);
    return FEELS.cinematic;
  }
  return found;
}
```

- [ ] **Step 4: Run, verify PASS.**
- [ ] **Step 5: Commit.** `git commit -m "feat(shared): reduced motion store, inview registry, crash-free feel presets"`

---

### Task 5: Counter (reference component pattern)

Counter is first because it proves the controller pattern (rule 3) and the inview registry on the component that has the worst bugs in the market (react-countup #540, #699, #876).

**Files:**
- Create: `packages/swash/src/counter/Counter.tsx`
- Create: `packages/swash/src/counter/types.ts`
- Test: `packages/swash/src/counter/Counter.test.tsx`
- Modify: `packages/swash/src/index.ts` (add `export { Counter } ...`)

**Interfaces:**
- Consumes: `tween`, `EASE`, `useReducedMotion`, `observeInview`, `useIsomorphicLayoutEffect`
- Produces: `<Counter to from duration delay prefix suffix format startOnView once onDone className style />`

```tsx
export interface CounterProps {
  to: number;
  from?: number;             // default 0
  duration?: number;         // default 1500 ms
  delay?: number;            // default 0
  prefix?: string; suffix?: string;
  format?: (n: number) => string; // default Math.round(n).toLocaleString("en-US")
  startOnView?: boolean;     // default true
  once?: boolean;            // default true
  onDone?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
```

- [ ] **Step 1: Write failing tests.** `Counter.test.tsx` covers exactly the market bugs:

```tsx
// Setup: fake timers + rAF stub like Task 3, installWaapiMock not needed.
// A helper renderCounted(props) returns { container, display, rerender } where
// display() reads the number span textContent.

it("counts to the target and formats", async () => {
  const { display } = renderCounted({ to: 1000, startOnView: false, duration: 100 });
  await vi.runAllTimersAsync();
  expect(display()).toBe("1,000");
});

it("re-render with same props does NOT restart mid-count (countup #540)", async () => {
  const { display, rerender } = renderCounted({ to: 1000, startOnView: false, duration: 1000 });
  await vi.advanceTimersByTimeAsync(500);
  const midValue = parseInt(display().replace(/,/g, ""), 10);
  expect(midValue).toBeGreaterThan(0);
  rerender(<Counter to={1000} startOnView={false} duration={1000} />);
  await vi.advanceTimersByTimeAsync(16);
  // value moved forward from midValue, never jumped back near 0
  const after = parseInt(display().replace(/,/g, ""), 10);
  expect(after).toBeGreaterThanOrEqual(midValue);
});

it("startOnView fires the count once on intersect and never again (countup #876)", async () => {
  // stub IntersectionObserver; mount with startOnView; fire intersect twice;
  // after timers run, onDone called exactly once and value reached target once
});

it("pauses when the tab is hidden and resumes without stale jumps", async () => {
  // set document.hidden true mid-count: display stops changing;
  // set false: it continues to the target (Page Visibility in effect)
});

it("reduced motion shows the final value instantly", () => {
  // matchMedia matches reduced: display() is "1,000" on first paint, no rAF
});

it("prefix and suffix render around the number", () => {
  // prefix="$" suffix="%" renders "$...%"
});
```

Write these as real Vitest code with the stubs above; every assertion spelled out as in Tasks 2-4 (no pseudo steps allowed in the committed plan beyond this sketch: expand each `it` fully when writing the file).

- [ ] **Step 2: Run, verify FAIL** (module not found).
- [ ] **Step 3: Implement `Counter.tsx`.** Structure (the pattern every later component copies):

```tsx
"use client";
import { useRef, useState, useEffect } from "react";
import { tween } from "../shared/tween";
import { useReducedMotion } from "../shared/motion";
import { observeInview } from "../shared/inview";
import { useIsomorphicLayoutEffect } from "../shared/client";
import type { CounterProps } from "./types";

export function Counter(p: CounterProps) {
  const {
    to, from = 0, duration = 1500, delay = 0, prefix = "", suffix = "",
    format = (n) => Math.round(n).toLocaleString("en-US"),
    startOnView = true, once = true, onDone, className, style,
  } = p;
  const ref = useRef<HTMLSpanElement>(null);
  const out = useRef<HTMLSpanElement>(null);
  const ctrl = useRef<ReturnType<typeof tween> | null>(null);
  const doneRef = useRef(onDone); doneRef.current = onDone;
  const started = useRef(false);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(!startOnView);

  useIsomorphicLayoutEffect(() => {
    if (reduced) { setFinal(); return; }        // rule 2: final value instantly
    if (!visible || started.current) return;     // rule 3: re-render changes nothing
    started.current = true;
    ctrl.current = tween({
      from, to, duration, delay,
      onUpdate: (v) => { if (out.current) out.current.textContent = format(v); },
      onComplete: () => doneRef.current?.(),
    });
    return () => { ctrl.current?.cancel(); started.current = false; };
  }, [visible, reduced]); // NOT on render; NOT on format identity

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    return observeInview(ref.current, { once, ratio: 0.3 }, () => setVisible(true));
  }, [startOnView, once]);

  useEffect(() => {                                        // Page Visibility
    if (typeof document === "undefined") return;
    const onVis = () => {
      if (!document.hidden) return;                        // resume handled by rAF gap
      ctrl.current?.cancel(); started.current = false;     // restart cleanly on return
      if (visible) setVisible((v) => v);                   // touch state to re-run effect
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [visible]);

  function setFinal() {
    if (out.current) out.current.textContent = format(to);
    started.current = true;
  }

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      <span ref={out}>{started.current ? "" : format(from)}</span>
      {suffix}
    </span>
  );
}
```

Server first render prints `format(from)`; after mount the animation overwrites textContent directly (no React state per frame). Note: for `startOnView` the SSR value must equal the pre-count client value or the post-count value consistently; we render `format(from)` server-side and reveal on intersect, which is hydration-stable.

- [ ] **Step 4: Run, verify PASS.** Then run `/break` on a throwaway Counter demo page in `/tmp/` (props: negative duration, to<from, NaN format results, rapid unmount during count). Fix anything it surfaces before committing.
- [ ] **Step 5: Export from index, commit.**

```bash
git add packages/swash/src/counter packages/swash/src/index.ts
git commit -m "feat(counter): scroll count-up immune to re-render restart and spy bugs"
```

---

### Task 6: Typewriter

**Files:**
- Create: `packages/swash/src/typewriter/Typewriter.tsx`
- Create: `packages/swash/src/typewriter/useTypewriter.ts`
- Create: `packages/swash/src/typewriter/types.ts`
- Test: `packages/swash/src/typewriter/Typewriter.test.tsx`
- Modify: `packages/swash/src/index.ts`

**Interfaces:**
- Consumes: `splitGraphemes`, `resolveFeel`, `FEELS`, `useReducedMotion`, `observeInview`, `warnOnce`, `useIsomorphicLayoutEffect`, `tween` (for blur-in via WAAPI)
- Produces:

```tsx
export interface TypewriterProps {
  text?: string;                       // single phrase
  loop?: string[];                     // rotating phrases (mutually exclusive with text; loop wins, warns)
  feel?: FeelName | Feel;              // default "cinematic"
  cursor?: boolean;                    // default true
  startOnView?: boolean;               // default false
  onDone?: () => void;                 // single-phrase completion
  onLoopDone?: (phrase: string, index: number) => void; // every FULL rotation of loop
  className?: string; style?: React.CSSProperties;
}
```

- [ ] **Step 1: Write failing tests.** Fake timers throughout. Cover:
  1. Grapheme test: `text="🚀 go"` types the rocket as ONE step (kasumi `split('')` bug fixed).
  2. `onLoopDone` fires exactly once per full rotation of a 2-item loop over 3 rotations (react-simple-typewriter #19 bug class).
  3. Changing `text` prop mid-type restarts typing on the new string instead of freezing (controlled prop bug).
  4. `resolveFeel("bogus")` path: renders with cinematic timing, warns once, never crashes.
  5. Reduced motion: full text present on first paint, no timers pending, `onDone` fired once.
  6. `cursor` renders `<span data-swash-caret>` and deleting mode removes grapheme by grapheme.
  7. Unmount during typing clears its timer (no setState-after-unmount warning).
- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement `useTypewriter.ts`** as a port of `kasumi-main/packages/kasumi/src/useTypewriter.ts` with these exact deltas:
  - `split('')` replaced by `splitGraphemes`.
  - `Math.random()` jitter kept but seeded per character index (`jitterFor(i, seed)`) so re-renders produce identical delays.
  - State machine kept: `idle → typing → pausing → deleting → done/next-phrase`. Held in a ref-driven timer loop, React state updated per emitted grapheme ONLY for the visible slice (this one component may use state per step; typewriter steps are human-scale, not 60fps).
  - When `text`/`loop` prop identity changes: cancel timer, reset index, restart.
  - `onLoopDone` fires when the pointer wraps back to index 0 after deleting the last phrase.
  - Blur-in per character uses WAAPI (`el.animate` opacity/blur keyframes ported from `blur.ts`) with the stable cached ref callbacks pattern from kasumi (so caret re-renders do not cancel in-flight char animations).
  - Caret blink: pure CSS keyframes injected once via a `useStyle(name, css)` micro-helper (idempotent `document.head.appendChild`, skip on server).
- [ ] **Step 4: Implement `Typewriter.tsx`**: renders `<span>` with typed graphemes as child spans (caret span when `cursor`), wires the hook, `"use client"` first line.
- [ ] **Step 5: Run, verify PASS.** Then `/state-machine` pass: mount a throwaway page showing `idle, typing, pausing, deleting, done, reduced-motion` frames of one Typewriter; visually confirm no stuck caret and no half-graphemes. Fix before commit.
- [ ] **Step 6: Commit.** `git commit -m "feat(typewriter): grapheme-safe feel-based typing with reliable loop callbacks"`

---

### Task 7: Frame (port of ram)

**Files:**
- Create: `packages/swash/src/frame/Frame.tsx`
- Create: `packages/swash/src/frame/metrics.ts` (contentOverhang, port of ram metrics.ts)
- Create: `packages/swash/src/frame/types.ts`
- Test: `packages/swash/src/frame/Frame.test.tsx`
- Modify: `packages/swash/src/index.ts`

**Interfaces:**
- Consumes: `tween`, `EASE`, `useReducedMotion`, `useIsomorphicLayoutEffect`, `warnOnce`
- Produces:

```tsx
export interface FrameProps {
  show?: boolean;                 // controlled visibility of the selection frame
  label?: string;                 // badge text (e.g. "Cmd K")
  color?: string;                 // default "currentColor"
  radius?: number;                // px, default 4
  width?: number;                 // frame stroke px, default 2
  duration?: number;              // sweep ms, default 500
  children: React.ReactNode;
}
```

- [ ] **Step 1: Write failing tests** (jsdom has no layout, so assert structure and controller behavior, not geometry):
  1. `show` false → decoration layer has `opacity: 0` / `display:none`, children render untouched.
  2. `show` true → decoration layer present with `aria-hidden="true"` and `pointer-events: none`.
  3. Toggling parent re-renders (same show value) does NOT re-invoke `Element.animate` again (controller ref pattern; use `animateCallCount` from Task 1 mock).
  4. Reduced motion: toggling show applies final styles with zero `animate` calls.
  5. label renders badge with tracking compensation style `marginRight` equal to minus one tracking step.
- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement.** Port `ram-main/packages/ram/src/ram.tsx` trimmed to the Frame API:
  - Keep: imperative `createController()` sequence over `--frame-*` custom properties, `keyframes`-style piecewise tween from `shared/tween.ts` (`from`/`to` opacity plus clip-path inset sweep for the border draw), trailing letter-space compensation on the label, ResizeObserver + `document.fonts.ready` re-measure using `metrics.ts` `contentOverhang`.
  - Change: prop names to the Frame API above; remove ram's `position`/`transition` presets not used; `"use client"`.
- [ ] **Step 4: Run, verify PASS.** `/break` throwaway: rapid show toggling, unmount mid-sweep, label longer than the child. Fix.
- [ ] **Step 5: Commit.** `git commit -m "feat(frame): selection frame with imperative controller and font-metric aware badge"`

---

### Task 8: Reveal

**Files:**
- Create: `packages/swash/src/reveal/Reveal.tsx`
- Create: `packages/swash/src/reveal/types.ts`
- Test: `packages/swash/src/reveal/Reveal.test.tsx`
- Modify: `packages/swash/src/index.ts`

**Interfaces:**
- Consumes: `splitGraphemes`, `splitWordTokens`, `observeInview`, `EASE`, `useReducedMotion`, `installWaapiMock`-compatible `el.animate` usage
- Produces:

```tsx
export interface RevealProps {
  children: string;                        // v1 text-only (enforced + warnOnce otherwise)
  by?: "fade" | "word" | "letter" | "line"; // default "word"
  stagger?: number;                         // ms per item, default 40
  duration?: number;                        // ms per item, default 400
  y?: number;                               // px translate, default 0.35em via CSS var
  startOnView?: boolean;                    // default true
  once?: boolean;                           // default true
  className?: string; style?: React.CSSProperties;
}
```

- [ ] **Step 1: Write failing tests:**
  1. SSR-shape: initial DOM contains the FULL text (final state) in wrapper spans, satisfying hydration rule from the spec.
  2. `by="word"` mounts with inview fired: each word span gets exactly one `animate` call; count equals word count (spaces unanimated).
  3. `once=false`: second intersect after a leave re-animates (calls double).
  4. `by="letter"` with an emoji phrase animates as many spans as graphemes, not UTF-16 units.
  5. reduced motion: zero `animate` calls, text visible.
- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement.** Children string → tokens per `by`; whitespace stays as text nodes; each unit wrapped in `span` with `will-change: opacity, transform` set only during animation. Pre-animation: in a layout effect after mount (never in SSR HTML), units get `opacity:0; translateY(var(--swash-reveal-y))`; then `el.animate([{opacity:0, transform:'translateY(12px)'}, {opacity:1, transform:'none'}], {duration, delay: i*stagger, easing: EASE.outLabel, fill: 'both'})` with `onfinish` clearing inline styles. `by="line"` measures line boxes through Range client rects (mocked in tests) and animates per unique rect top. inview from shared registry (ratio 0.2, rootMargin "0px 0px -10% 0px").
- [ ] **Step 4: Run, verify PASS.** `/state-machine` throwaway page: frames `idle, first intersect, mid-stagger, settled, re-leave with once=false, reduced`. Fix.
- [ ] **Step 5: Commit.** `git commit -m "feat(reveal): scroll word letter and line reveals with kerning-safe ranges"`

---

### Task 9: Scramble

**Files:**
- Create: `packages/swash/src/scramble/Scramble.tsx`
- Create: `packages/swash/src/scramble/types.ts`
- Test: `packages/swash/src/scramble/Scramble.test.tsx`
- Modify: `packages/swash/src/index.ts`

**Interfaces:**
- Consumes: `splitGraphemes`, `tween`, `observeInview`, `useReducedMotion`
- Produces:

```tsx
export interface ScrambleProps {
  text: string;
  charset?: string;                       // default "!<>-_\\/[]{}=+*^?#0123456789ABCDEF"
  speed?: number;                         // 0.5..3 multiplier, default 1
  trigger?: "mount" | "view" | "click" | "prop"; // default "mount"
  onDone?: () => void;
  className?: string; style?: React.CSSProperties;
}
```

- [ ] **Step 1: Write failing tests** (fake timers, seedable RNG stubbed via `vi.stubGlobal("Math", {...Math, random: seededFn})`):
  1. Runs to completion: after enough frames, textContent equals `text` exactly, `onDone` once.
  2. Every intermediate frame has the SAME grapheme count as `text` (no layout jump).
  3. `trigger="prop"`: scrambling starts only when `text` changes, and retargets gracefully mid-run (old run cancelled, no second loop).
  4. `trigger="click"`: pointer-driven start via the element's click event.
  5. Reduced motion: final text instantly, no timers.
- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement.** Controller: graphemes of target; per-character reveal time `resolveAt(i) = (i / n) * duration * speedFactor`; one rAF loop through `tween({from:0,to:1})` writing `textContent` per frame: index resolved if progress*duration >= resolveAt(i), else random glyph from charset. Keep one run in a ref; prop change cancels + retargets (re-render never auto-restarts, rule 3). Space characters never scramble (stay spaces).
- [ ] **Step 4: Run, verify PASS.** `/break` throwaway: empty string, 1 grapheme, 500 graphemes, unmount mid-run. Fix.
- [ ] **Step 5: Commit.** `git commit -m "feat(scramble): decode effect with grapheme-stable frames and prop triggers"`

---

### Task 10: Morph

**Files:**
- Create: `packages/swash/src/morph/Morph.tsx`
- Create: `packages/swash/src/morph/transition.ts` (pure diff helper)
- Create: `packages/swash/src/morph/types.ts`
- Test: `packages/swash/src/morph/Morph.test.tsx`, `transition.test.ts`
- Modify: `packages/swash/src/index.ts`

**Interfaces:**
- Consumes: `splitGraphemes`, `tween`, `EASE`, `useReducedMotion`
- Produces:

```tsx
export interface MorphProps {
  values: string[];            // <2 values: warnOnce + renders first (or empty)
  duration?: number;           // ms per morph, default 600
  hold?: number;               // ms at rest between morphs, default 1200
  loop?: boolean;              // default false (single step to values[1])
  step?: number;               // advance trigger when not looping
  onMorphed?: (value: string, index: number) => void;
  className?: string; style?: React.CSSProperties;
}
```

```ts
// transition.ts (pure, table-tested):
export interface MorphPlan { keep: number; out: string[]; in_: string[] }
export function planTransition(from: string, to: string): MorphPlan
// longest common grapheme prefix/suffix kept; middle removed, middle added.
```

- [ ] **Step 1: Write failing tests.** `transition.test.ts` table cases first:

```ts
expect(planTransition("2019", "2024")).toEqual({ keep: 3, out: ["9"], in_: ["4"] });
expect(planTransition("cat", "car")).toEqual({ keep: 2, out: ["t"], in_: ["r"] });
expect(planTransition("", "hi")).toEqual({ keep: 0, out: [], in_: ["h", "i"] });
expect(planTransition("🚀x", "🚀y").out).toEqual(["x"]);
```

`Morph.test.tsx`: loop index advances and wraps (fake timers counting hold+duration per cycle, `onMorphed` once per morph); final displayed text equals `values[i]` between morphs; emoji morphs whole graphemes (assert frame textContent never contains a lone surrogate: scan for `Array.from(x).length` matching plan); reduced motion snaps and still advances values on hold timers; 1-value array warns once and renders it.
- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement.** Per frame during a morph: kept prefix rendered as-is; removed tail graphemes scale/fade out from the right; added tail fades in; shared last-char before the boundary gets a squash (`scaleX(0.5)`) mid-morph, the torph feel. Width: wrap in inline-block and tween measured width from `previous` to `next` (measure with `getBoundingClientRect().width` on a hidden ruler span; tests mock it) so surrounding text never jumps.
- [ ] **Step 4: Run, verify PASS.** `/state-machine` throwaway frames: resting A, 25%, 50%, 75%, resting B, wrap-around. Fix.
- [ ] **Step 5: Commit.** `git commit -m "feat(morph): dependency-free string morph with whole-grapheme transitions and width compensation"`

---

### Task 11: Marker

**Files:**
- Create: `packages/swash/src/marker/Marker.tsx`
- Create: `packages/swash/src/marker/paths.ts` (seeded wobble path builders)
- Create: `packages/swash/src/marker/types.ts`
- Test: `packages/swash/src/marker/Marker.test.tsx`, `paths.test.ts`
- Modify: `packages/swash/src/index.ts`

**Interfaces:**
- Consumes: `observeInview`, `useReducedMotion`, `useIsomorphicLayoutEffect`, `tween`, Range API
- Produces:

```tsx
export interface MarkerProps {
  children: string;               // v1 string-only
  action?: "highlight" | "underline" | "circle" | "box" | "strike"; // default "highlight"
  color?: "amber" | "emerald" | "sky" | "rose" | "violet" | "primary" | string; // default "amber"
  show?: boolean;                 // controlled; undefined = trigger on view
  startOnView?: boolean;          // default true when uncontrolled
  duration?: number;              // ms, default 800
  delay?: number;
  className?: string; style?: React.CSSProperties;
}
```

- [ ] **Step 1: Write failing tests.** `paths.test.ts` pure: `wobblyLine(width, seed)` and `wobblyEllipse(w, h, seed)` return SVG path `d` strings starting with M, deterministic per seed, and endpoints within 1px of requested bounds. `Marker.test.tsx`: mocked `Range.getClientRects` returning two rects → underline draws two subpaths (line-wrap case); `highlight` uses background-size transition inline style `backgroundSize: '0% 100%'` → `'100% 100%'` after trigger; drawing layer `aria-hidden="true"`; reduced motion: `backgroundSize` is final on first paint and zero animate calls; controlled `show=false→true` animates once, repeated identical `show` prop re-renders do not re-trigger (rule 3).
- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement.** `highlight`: CSS background-image linear-gradient in the ink color at 30% opacity, `box-decoration-break: clone`, animate `background-size` width by WAAPI on the inline span (no measurement needed, wraps naturally, the viberdy-proven trick). `underline`/`strike`/`circle`/`box`: absolutely-positioned `aria-hidden` SVG overlay (sized from parent bounding rect) whose paths come from `paths.ts` using the Range rects (one path per rect line; circle/box use the union rect). Draw-on via `stroke-dashoffset` tween. Re-measure on ResizeObserver + `document.fonts.ready`. Colors: preset map with separate light/dark values (CSS var fallback `color: currentColor` for "primary"), no CSS framework.
- [ ] **Step 4: Run, verify PASS.** `/break` throwaway: uncontrolled mount while off-screen then scroll in, phrase split across 3 lines, show toggle spam, RTL text. Fix.
- [ ] **Step 5: Commit.** `git commit -m "feat(marker): hand-drawn emphasis that wraps lines and needs no tailwind"`

---

### Task 12: Package gates (use client, split ban, exports smoke, size)

**Files:**
- Create: `packages/swash/scripts/gates.mjs`
- Create: `packages/swash/src/test/package.test.ts`
- Modify: `packages/swash/package.json` (add `"check": "node scripts/gates.mjs && tsup && node scripts/smoke.mjs"`, create `scripts/smoke.mjs`)

**Interfaces:**
- Consumes: everything above
- Produces: CI-usable `pnpm --filter swash check`

- [ ] **Step 1: Write the failing gate script** `gates.mjs`:

```js
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const SRC = fileURLToPath(new URL("../src", import.meta.url)); // Windows-safe, not .pathname
let bad = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!name.includes("test")) walk(p); continue; }
    if (!/\.tsx?$/.test(name) || name.includes(".test.")) continue;
    const src = readFileSync(p, "utf8");
    const sep = p.includes("\\") ? "\\" : "/"; // normalize for path checks on Windows
    const inComponent = ["typewriter", "frame", "reveal", "scramble", "morph", "counter", "marker"]
      .some((f) => p.split(sep).includes(f));
    const isEntry = inComponent && name.endsWith(".tsx") && !name.includes("test");
    if (isEntry && !src.startsWith('"use client"')) { console.error(`missing use client: ${p}`); bad++; }
    if (/\bsplit\(''\)/.test(src)) { console.error(`banned split(''): ${p}`); bad++; }
  }
}
walk(SRC);
process.exit(bad ? 1 : 0);
```

- [ ] **Step 2: `package.test.ts` smoke**: build not required here; import every named export from `../index`, assert each renders a minimal instance without throwing (React `renderToString` from `react-dom/server` for the SSR path: no `window` access at import time, no warnings). This is the real hydration gate:

```ts
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Counter, Frame, Marker, Morph, Reveal, Scramble, Typewriter } from "../index";

describe("ssr safety", () => {
  it("renders every component to string with no window", () => {
    for (const el of [
      <Counter to={1} />, <Frame><b>x</b></Frame>, <Marker>hi</Marker>,
      <Morph values={["a", "b"]} />, <Reveal>hello world</Reveal>,
      <Scramble text="x" />, <Typewriter text="hi" />,
    ]) {
      expect(() => renderToString(el)).not.toThrow();
    }
  });
});
```

- [ ] **Step 3: Run gates, fix any violations they find** (expected first run: passes if Tasks 5-11 were done right; if not, that is the point).
- [ ] **Step 4: `smoke.mjs`**: after `tsup` build, `import()` the esm dist in a Node script, require the cjs via `createRequire`, assert both export the 7 names. Wire into `check`.
- [ ] **Step 5: Run, verify PASS.**
- [ ] **Step 6: Commit.** `git commit -m "chore(package): use client and ssr safety gates with esm cjs smoke test"`

---

### Task 13: README + final polish pass

**Files:**
- Create: `packages/swash/README.md`
- Modify: root `README.md` (short pointer), `packages/swash/package.json` (repository/keywords fields)

- [ ] **Step 1: Write `packages/swash/README.md`** following the spec tone: one-line pitch, install, the 7 components each with a copy-pasteable 6-line example and its prop table, a "Why this exists" section that links the research facts (the stale-bug table from the spec, no names of local research tools), accessibility section (reduced motion table per component), zero-dependency + bundle note. No em dashes, no hype adjectives.
- [ ] **Step 2: Run `/better-ui` + `/interface-review`** across the throwaway demo page containing all 7 components (from Tasks 5-11, updated). Fix every HIGH finding, list MEDIUMs in the commit message body if deferred.
- [ ] **Step 3: Run the full suite:** `pnpm --filter swash check && pnpm test && pnpm build`. All green.
- [ ] **Step 4: Commit.** `git commit -m "docs(package): readme with per-component usage, a11y table and rationale"`

---

## Self-review notes (done at plan time)

- Spec coverage: engine rules 1-4 → Tasks 2-4 + gates Task 12; 7 components → Tasks 5-11 (Counter, Typewriter, Frame, Reveal, Scramble, Morph, Marker); acceptance checklist items → Tests in Tasks 5 (countup bugs), 6 (typewriter bugs), 12 (hydration/use-client emoji gates). Docs site, llms.txt, playground, publish, PR → deliberately in Plan 2 (`2026-11-11-swash-docs-site.md`, to be written after this plan completes), matching the spec's split release flow.
- Marquee, shimmer, handwriting: out of scope per spec, nothing to do.
- Type consistency checked: `tween`, `TweenController`, `observeInview`, `useReducedMotion`, `resolveFeel`, `splitGraphemes`, `splitWordTokens`, `planTransition`, `installWaapiMock`, `animateCallCount` used identically across tasks.

## Execution Handoff

After saving: offer Subagent-Driven (fresh subagent per task, review between) or Inline (executing-plans checkpoints). Every task = one commit = the user's per-stage rule. No pushes until Plan 2's PR task.
