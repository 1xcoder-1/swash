# Swash v1 Design

Date: 2026-11-11
Status: approved scope, pending spec review
Author: design session with the repo owner

## What swash is

Swash is a React library of ready-made text effect components. One line of JSX per effect, zero runtime dependencies, and every bug that made the old libraries in this space infamous is fixed in advance. The name comes from typography: a swash is a decorative stroke added to a letter. That is exactly what this library adds to text.

Swash is not an animation engine. It does not compete with Framer Motion or GSAP. It competes with the copy-pasted snippet files (MagicUI, goodui, React Bits) and with the stale npm packages developers keep hitting bugs in (react-simple-typewriter, react-type-animation, react-countup). The pitch in one sentence: install a package instead of pasting a file, and it still works after you upgrade Next.js or Tailwind.

The code merges two local libraries that already proved the hard parts:

- `kasumi-main`: the typewriter state machine, per-char blur via WAAPI, `feel` timing presets.
- `ram-main`: the imperative controller pattern (animation runs outside React state), a small tween engine with a cubic-bezier solver, canvas font metrics, reduced-motion handling, SSR-safe layout effects.

## Product decisions (locked)

| Decision | Value |
|---|---|
| Brand | swash |
| npm package | `swash` (bare name verified free on 2026-11-11) |
| v1 components | Typewriter, Frame, Reveal, Scramble, Morph, Counter, Marker (7) |
| Deferred to v1.1 | Marquee (react-fast-marquee has no reported bugs; no differentiation in v1) |
| Library stack | React 18+, TypeScript, tsup (esm + cjs + types), zero runtime deps |
| Docs stack | Next.js App Router site with a live playground (follows ram's `apps/docs` pattern) |
| Tests | Vitest + React Testing Library, CI gate on GitHub Actions |
| Commits | one commit per completed stage, nothing pushed mid-work, one PR at the end |
| Design skills | exploded, jakub.kr skills (/state-machine, /break, /teardown, /variant, /better-ui, /interface-review), impeccable. These are mandatory during component design and docs design. |

## Repository layout

```
swash/
├── packages/swash/
│   └── src/
│       ├── shared/        # engine: one copy of every hard problem
│       │   ├── grapheme.ts      # Intl.Segmenter split + fallback
│       │   ├── bezier.ts        # Newton-Raphson easing solver (from ram)
│       │   ├── tween.ts         # rAF tween + keyframes (from ram)
│       │   ├── waapi.ts         # Element.animate helpers, stable ref cache (from kasumi)
│       │   ├── motion.ts        # prefersReducedMotion, live matchMedia listener
│       │   ├── inview.ts        # shared IntersectionObserver registry
│       │   ├── metrics.ts       # canvas measureText, overhang (from ram)
│       │   └── client.ts        # useIsomorphicLayoutEffect (SSR-safe)
│       ├── typewriter/
│       ├── frame/
│       ├── reveal/
│       ├── scramble/
│       ├── morph/
│       ├── counter/
│       ├── marker/
│       └── index.ts       # named exports only; every folder tree-shakes alone
├── apps/docs/             # Next.js: landing, per-component pages, playground
└── docs/superpowers/      # this spec + the implementation plan
```

Every component folder holds `X.tsx` (with `"use client"` at line 1), `use-X.ts` if state logic is non-trivial, `types.ts`, and `X.test.tsx`.

## The shared engine rules

These four rules are what "production-level" means here. They are enforced in `shared/` once, not per component.

1. **Grapheme-safe splitting.** All character iteration goes through `Intl.Segmenter` with a code-point fallback for old Safari. `split('')` anywhere in this repo is a CI failure. This kills the emoji bug kasumi shipped with.
2. **Reduced motion is a first-class render mode, not an afterthought.** `prefersReducedMotion` is read through a live `matchMedia` subscription, so toggling the OS setting mid-page works without a reload. Each component declares its reduced variant: Typewriter swaps in whole-text render, Reveal and Marker show final state instantly, Scramble settles immediately, Counter jumps to final value, Morph snaps, Frame draws its border without the sweep.
3. **No animation restart on re-render.** Anything time-based runs through an imperative controller kept in a ref (the ram pattern). React re-rendering the parent must never cancel or restart an in-flight animation. This is the exact bug class from react-type-animation #32 and react-countup #540.
4. **Props can crash nothing.** Invalid preset strings, negative durations, empty children: every component falls back to its default and warns once in dev. `resolveFeel` returning undefined (the kasumi bug) cannot happen because presets resolve through a lookup with an explicit default branch.

## Components and their APIs

Props below are the contract. Optional props have sensible defaults and none are required except content.

### Typewriter (from kasumi, rewritten)

```tsx
<Typewriter
  text="Build it once, read it everywhere."
  feel="cinematic"           // cinematic | snappy | playful | { type: 'off', instant: true }
  cursor                    // renders the blinking caret
  loop={["text A", "text B"]} // rotate through phrases; onLoopDone fires per full cycle
  startOnView               // wait for IntersectionObserver before typing
  onDone={fn} onLoopDone={fn}
/>
```

Fixes over kasumi: grapheme clusters (emoji survive), controlled `text` change re-types instead of freezing, `onLoopDone` fires reliably under Next.js App Router (the react-simple-typewriter #19 bug class), reduced-motion support, `"use client"`. Caret blink is pure CSS so it costs no JS frames.

### Frame (from ram, renamed behavior kept)

```tsx
<Frame show={isFocused} label="Cmd K">
  <SearchDialog />
</Frame>
```

The design-tool selection box: accent outline animates around the child's border box, tracking (letter-spacing) animates on the badge label, everything drawn by one imperative controller with zero per-frame React state. Line advance never changes while tracking animates (the compensating negative margin trick from ram). `metrics.ts` overhang measurement keeps the frame glued to real glyph bounds after webfont load (ResizeObserver + `document.fonts.ready`).

### Reveal

```tsx
<Reveal by="word" stagger={40} startOnView once>
  {longParagraphOrHeading}
</Reveal>
```

Scroll-triggered word or letter reveal. `by`: `fade | word | letter | line`. Per-letter mode measures kerning-aware ranges (Range API client rects, the concern griffo raised) instead of blind splitting, so spacing never shifts mid-animation. Default animation is opacity + small y-translate through WAAPI with the shared stagger scheduler. This is the component developers currently build with GSAP ScrollTrigger or 200 lines of framer-motion; one line replaces it.

### Scramble

```tsx
<Scramble text="DECRYPTING" speed={1.2} trigger="mount" />
```

Decode-style character scramble. Iterates graphemes, swaps random glyphs per frame from a charset, resolves left to right. Imperative controller (rule 3), reduced-motion settles instantly. `trigger`: `mount | view | click | prop`.

### Morph (torph-style, ours)

```tsx
<Morph values={["2019", "2024", "tomorrow"]} duration={600} loop />
```

Character-by-character morph between strings: added characters grow in from the anchor point, removed characters shrink out, shared characters tween shape. No dependency, unlike torph's standalone package; our version shares the grapheme engine so emoji morph correctly (multi-char graphemes morph as units, never half an emoji). Reduced motion snaps between values. Measured width animates so surrounding text does not jump.

### Counter

```tsx
<Counter to={12450} prefix="$" duration={1800} startOnView once
  format={(n) => n.toLocaleString()} />
```

Number count-up on scroll into view. Built specifically to kill the three open react-countup bugs: re-render never restarts the count (rule 3), `startOnView` uses our shared inview registry and cannot double-register, `once` is guaranteed. Tab-hidden pause uses the Page Visibility API so a backgrounded tab does not resume mid-count on a stale clock. Reduced motion shows the final value immediately.

### Marker

```tsx
<Marker action="highlight" color="amber" startOnView>
  the phrase to emphasize
</Marker>
```

Hand-drawn emphasis: `highlight | underline | circle | box | strike`. The MagicUI/goodui ecosystem proves demand, and their issue tracker proves the pain: copy-paste files break on Tailwind v4 (#624, #561). Ours is npm-installed, depends on no CSS framework, and uses Range rects so a wrapped phrase gets one stroke per line and re-fits on resize and font load. Trigger modes: view (default), `show` prop for controlled draw/erase. Reduced motion paints instantly. Text stays plain selectable text; the drawing is an `aria-hidden` layer.

## Error handling policy

- Bad preset / unknown enum string: fall back to default + one `console.warn` per component instance in dev only. Never throw.
- SSR: first render outputs the final (post-animation) state so server HTML and client hydration match; animation re-plays only after mount when `startOnView` is false, or is skipped if reduced motion is on. This kills the hydration-warning class that StackOverflow threads blame on typewriter libraries.
- No layout thrash: all measurement is batched in one `requestAnimationFrame` per frame through the shared scheduler.

## Testing targets (the acceptance checklist)

Every numbered item in the memory checklist `Swash library v1 defect and market-gap acceptance checklist` gets a test. Concretely:

1. grapheme.ts table tests: emoji, ZWJ sequences, combining marks, RTL text
2. typewriter: loop callbacks fire exactly once per cycle (jsdom fake timers), text prop change re-types, feel fallback
3. frame: controller survives parent re-render without restart (render-count assertion)
4. reveal: inview registration is idempotent; cleanup on unmount
5. counter: re-render mid-count does not restart; once semantics; visibility change pause
6. marker: Range rect measurement with a mocked layout; controlled show toggle
7. shared/motion: reduced-motion listener reacts to matchMedia change event
8. package: exports map smoke test (esm + cjs import), a build-time grep gate for `"use client"` on every component entry

Design-phase workflow per component (mandatory skills): sketch states with `/state-machine`, stress it with `/break`, polish with `/better-ui`, document the final component anatomy in the docs site with `exploded`, and run `/interface-review` on each docs page before stage commit.

## Docs site (apps/docs)

Next.js App Router, following ram's docs pattern: landing page with live demos of all 7 components, one page per component (usage, props table, playground with the real knobs), an accessibility page documenting every reduced-motion behavior, and an `llms.txt` route so AI coding tools can consume the docs. Dark mode, no Tailwind dependency for the library itself (docs site styling is free to use whatever).

## Release flow

1. Stage commits locally per the checklist in the implementation plan (engine, then each component, then docs).
2. Nothing gets pushed during stages.
3. Final: create the GitHub repo, push everything as one branch, open one PR with the full history.
4. Version 0.1.0 published after the PR is approved; `swash` bare name reserved by publishing early.

## Out of scope for v1

- Marquee (v1.1, first feature)
- Shimmer / gradient text (gradient-shimmer already owns this space, June 2026)
- Handwriting / SVG stroke drawing (tegaki owns it)
- Slot-machine digits beyond Counter's roll (slot-text owns the pure version; Counter's scroll semantics are the differentiation)
- Non-React targets, Vue/Svelte ports
- CLI scaffolding tools
