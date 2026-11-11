# swash

Ready-made text effects for React: one line of JSX each, zero runtime dependencies, and the bugs that made the old libraries in this space infamous are fixed before you meet them.

The name comes from typography. A swash is a decorative stroke added to a letter. That is what these components add to text.

Swash is not an animation engine. It does not compete with Framer Motion or GSAP. It competes with the snippet you paste out of a copy-paste UI collection and with the npm package that has not been touched in two years.

```bash
npm install swash      # or: pnpm add swash
```

```bash
bun add swash          # or: deno add npm:swash
```

React 18 or newer. Every component is a client component already, so a Next.js App Router page needs no `"use client"` line of its own to use them.

## What is in the box

| Component | What it does |
| --- | --- |
| [Typewriter](#typewriter) | Types a phrase, or rotates through a list of them |
| [Frame](#frame) | Draws a selection frame around a child, the way a design tool does |
| [Reveal](#reveal) | Brings a line of text in word by word, letter by letter or line by line |
| [Scramble](#scramble) | Decodes a word out of noise |
| [Morph](#morph) | Changes one word into another, moving only the part that differs |
| [Counter](#counter) | Counts a number up when it scrolls into view |
| [Marker](#marker) | Draws a hand-drawn highlight, underline, strike, ring or box over a phrase |

Every example below is copy-pasteable. Import the names you use from `swash`:

```tsx
import { Counter, Marker, Reveal } from "swash";
```

## Typewriter

```tsx
<Typewriter
  text="Build it once, read it everywhere."
  feel="cinematic"
  loop={["text A", "text B"]}
  cursor
  startOnView
  onLoopDone={(phrase) => console.log(phrase)}
/>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | | One phrase, typed once. Ignored when `loop` is set. |
| `loop` | `string[]` | | Phrases to rotate through, holding and erasing each one. |
| `feel` | `"cinematic" \| "snappy" \| "playful" \| Feel` | `"cinematic"` | A preset name, or your own `{ charDelay, jitter, deleteRatio, pause }` in ms. |
| `cursor` | `boolean` | `true` | The blinking caret. It is a CSS animation, so it costs no frames. |
| `startOnView` | `boolean` | `false` | Wait for the text to scroll into view before typing. |
| `onDone` | `() => void` | | The single phrase is on screen. |
| `onLoopDone` | `(phrase, index) => void` | | One full turn of `loop` finished. |
| `className`, `style` | | | Passed to the wrapper. |

Changing `text` re-types instead of freezing, which is the failure people reported against the popular typewriter packages. Emoji type as whole characters: a family of four is one keystroke, not seven.

## Frame

```tsx
<Frame show={isFocused} label="Cmd K" radius={10}>
  <SearchInput />
</Frame>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `show` | `boolean` | `false` | Whether the frame is drawn. The outline stays in the DOM either way, so a toggle never remounts it. |
| `label` | `string` | | Text for the chip on the top-right corner. No label, no chip. |
| `color` | `string` | `"currentColor"` | Any CSS colour for the outline and the chip. |
| `radius` | `number` | `4` | Corner radius in px. |
| `width` | `number` | `2` | Outline thickness in px. |
| `duration` | `number` | `500` | How long the frame takes to draw itself in, in ms. |
| `children` | `ReactNode` | | What to draw around. |
| `className`, `style` | | | Passed to the wrapper. |

The outline sweeps around the child's border box and the chip's letter-spacing animates at the same time, without the line advance changing underneath it. Measurement happens on content change and once more when a webfont lands, so the frame stays glued to the real glyph bounds instead of the fallback font's.

## Reveal

```tsx
<Reveal by="word" stagger={40} startOnView once>
  The paragraph or heading you want to arrive.
</Reveal>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | Text in v1. Anything else renders as it is, unanimated, and says so once in dev. |
| `by` | `"fade" \| "word" \| "letter" \| "line"` | `"word"` | How the line is cut into pieces. |
| `stagger` | `number` | `40` | Ms between one piece and the next. |
| `duration` | `number` | `400` | How long one piece takes. |
| `y` | `number` | `0.35em` | How far each piece rises from, in px. |
| `startOnView` | `boolean` | `true` | Wait for the line to scroll into view. |
| `once` | `boolean` | `true` | Stay revealed, rather than replaying on every visit. |
| `className`, `style` | | | Passed to the wrapper. |

Word mode is the default for a reason. Letter mode puts every grapheme in its own inline box so the browser can move it, and a box that small is where the font's shaping stops: kerning pairs across a break lose their adjustment, and a cursive or connected script falls apart. Use it on short display text, not on a paragraph. The pieces are spans around your words, not a replacement for them: the sentence is in the markup before any of it moves.

## Scramble

```tsx
<Scramble
  text="DECODE ME"
  charset="!<>-_\\/[]{}=+*^?#"
  speed={1.2}
  trigger="view"
  onDone={fn}
/>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | required | The line the effect decodes to. It is also what the markup carries. |
| `charset` | `string` | built-in noise | The glyphs the churn draws from. |
| `speed` | `number` | `1` | Half to three times the pace. Outside that it is clamped, not ignored. |
| `trigger` | `"mount" \| "view" \| "click" \| "prop"` | `"mount"` | `view` waits for the scroll, `click` waits for a press, `prop` waits for `text` to change. |
| `onDone` | `() => void` | | The word has settled. |
| `className`, `style` | | | Passed to the wrapper. |

It resolves left to right, the way the effect is meant to read. The word is in the markup the whole time, so the decode is decoration rather than a gate: a reader who never clicks it still has the text.

## Morph

```tsx
<Morph
  values={["2019", "2024", "tomorrow"]}
  duration={600}
  hold={1200}
  loop
  onMorphed={(value, index) => console.log(value)}
/>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `values` | `string[]` | required | The words to move between. Fewer than two and there is nothing to morph, which is said out loud once. |
| `duration` | `number` | `600` | How long one swap takes, in ms. |
| `hold` | `number` | `1200` | How long the word sits still before the next swap. |
| `loop` | `boolean` | `false` | Keep going through the list, or step once. |
| `step` | `number` | `1` | Which value to be on, for a list you page through instead of looping. |
| `onMorphed` | `(value, index) => void` | | A swap landed. |
| `className`, `style` | | | Passed to the wrapper. |

The shared beginning of the two words holds still, the tail that leaves squeezes out and the tail that arrives squeezes in. Width is measured and animated, so the sentence around it does not flinch. Multi-character graphemes move as one unit, so an emoji never morphs as half a face.

## Counter

```tsx
<Counter
  to={12450}
  prefix="$"
  duration={1800}
  startOnView
  once
  format={(n) => n.toLocaleString()}
/>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `to` | `number` | required | The number to land on. |
| `from` | `number` | `0` | The number to start from. |
| `duration` | `number` | `1500` | Count time in ms. |
| `delay` | `number` | `0` | Wait before counting, in ms. The first count only. |
| `prefix`, `suffix` | `string` | `""` | Printed around the number, like `$` or `%`. |
| `format` | `(n: number) => string` | rounding with thousands separators | Turns the running value into text. |
| `startOnView` | `boolean` | `true` | Wait for the element to scroll into view. |
| `once` | `boolean` | `true` | Count on the first appearance only. Off means it counts again each time it appears. |
| `onDone` | `() => void` | | The number has landed. |
| `className`, `style` | | | Passed to the wrapper. |

A parent that re-renders mid-count changes nothing, which is the bug class people have reported against the popular counter packages. A tab that goes to the background stops the clock instead of resuming on a stale one, and the server writes the number it starts from rather than the one it counts up to, so there is nothing to correct on hydration.

## Marker

```tsx
<Marker action="circle" color="rose" startOnView show={drawn}>
  the phrase to emphasize
</Marker>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `string` | required | The words being marked. They stay plain text; the drawing sits over them. |
| `action` | `"highlight" \| "underline" \| "strike" \| "circle" \| "box"` | `"highlight"` | Which mark to draw. Anything else falls back to a highlight and says so once. |
| `color` | `"amber" \| "emerald" \| "sky" \| "rose" \| "violet" \| "primary" \| string` | `"amber"` | A named ink, `primary` for `--swash-primary`, or any CSS colour. |
| `show` | `boolean` | | Draw or erase. Left out, the mark draws itself when the text scrolls into view. |
| `startOnView` | `boolean` | `true` | When uncontrolled, wait for the text to come on screen. |
| `duration` | `number` | `800` | How long the mark takes to draw, in ms. |
| `delay` | `number` | `0` | Wait this long before the pen touches down. |
| `className`, `style` | | | Passed to the wrapper. |

A phrase that wraps gets one stroke per line, fitted to the line boxes the browser chose, and re-fitted when the text reflows or a webfont arrives. The highlight is painted with the text's own background, so it needs no measurement at all and costs nothing on resize.

No Tailwind, no CSS framework, no config. The named inks come with a dark-mode value each, through a stylesheet the component writes once per page.

## Why this exists

The effects in this space are mostly copy-pasted files and packages that stopped being maintained. The bugs below are the ones developers kept reporting against them, and each one is a test in this repo:

| Reported against | What happened | What swash does |
| --- | --- | --- |
| `react-type-animation` #32 | A parent re-render restarted the animation in flight | Time-based work runs through an imperative controller in a ref. Re-rendering the parent changes nothing. |
| `react-countup` #540 | The count restarted whenever the component re-rendered | Same controller, plus the value lives outside React state. |
| `react-simple-typewriter` #19 | Loop callbacks never fired under Next.js App Router | `onLoopDone` fires once per cycle, tested with the module reloaded per test. |
| `react-simple-typewriter` | Emoji broke: `split("")` cut a grapheme into its code units | Everything iterates through `Intl.Segmenter`, with a code-point fallback for old Safari. `split("")` anywhere in this repo fails CI. |
| MagicUI, goodui files (#624, #561) | Copy-pasted effect files broke on Tailwind v4 | Nothing depends on a CSS framework. Install the package. |
| kasumi | An unknown timing preset returned `undefined` and crashed mid-animation | Presets resolve through a lookup with an explicit default branch. |
| typewriter packages generally | Hydration warnings on the server | First render outputs what a reader without script would want, and no component touches the browser while rendering. |

Four rules, enforced once in the shared engine rather than per component:

1. **Grapheme-safe splitting.** No character is ever cut in half.
2. **Reduced motion is a render mode.** `prefers-reduced-motion` is read through a live `matchMedia` subscription, so changing the OS setting mid-page takes effect without a reload.
3. **No restart on re-render.** Nothing time-based is driven by React state.
4. **Props can crash nothing.** A bad preset name, a negative duration, an empty list: the component uses its default and warns once in development. It does not throw.

## Accessibility

Every component declares what it does when the reader has asked for reduced motion. None of them hide the text: the words are in the markup before, during and after the effect, and the decoration is out of the reading order.

| Component | With reduced motion on |
| --- | --- |
| Typewriter | The phrase is printed whole. No typing, no caret animation. |
| Frame | The outline and chip appear and go, without the sweep. |
| Reveal | Every piece is already where it belongs. Nothing rises. |
| Scramble | The word settles immediately, without the noise. |
| Morph | Values snap from one to the next. |
| Counter | The final number is shown on the first paint. |
| Marker | The finished mark is painted, stroke by stroke never drawn. |

Other things worth knowing:

- The Frame outline, the Marker drawing and the Scramble churn are `aria-hidden`. A screen reader reads the sentence once, not the decoration around it.
- Marker's highlight leaves the text selectable and copyable, because it is a background painted on the words themselves.
- Counter and Marker are safe inside a heading: they render a `span` and no extra structure.
- Effects that trigger on scroll use one shared `IntersectionObserver` registry, so a page full of them costs one observer per distinct element, not one per component.

## Size and dependencies

Zero runtime dependencies. React is a peer dependency, which means your app's copy of React is the only one on the page.

The whole package is about 53 KB of ESM before gzip, unminified, and every component tree-shakes alone: an app that imports `Counter` gets `Counter` and the shared engine, not the marker's path generator.

```bash
npm install swash
```

MIT licensed.
