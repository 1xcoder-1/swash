"use client";

import { useEffect, useState } from "react";
import {
  Counter,
  Frame,
  Marker,
  Morph,
  Reveal,
  Scramble,
  Typewriter,
  Ticker,
  Shimmer,
  BlurReveal,
  FlipWords,
  Glitch,
  CurvedText,
  Wave,
} from "swash";
import { Preview } from "./preview";
import { PixelButton } from "./pixel-button";

export function TypewriterDemo() {
  return (
    <Preview label="Typewriter loop + feel">
      <Typewriter
        loop={[
          "The quick brown fox.",
          "Graphemes, not code units. 🦊👩‍👩‍👧‍👦",
          "Reduced motion prints it all at once.",
        ]}
        feel="snappy"
      />
    </Preview>
  );
}

export function FrameDemo() {
  return (
    <Preview label="Frame with label and sweep">
      <Frame show label="selected" duration={900}>
        <span style={{ padding: "6px 14px" }}>Any element gets the frame.</span>
      </Frame>
    </Preview>
  );
}

export function RevealDemo() {
  return (
    <Preview label="Reveal by word, then by letter">
      <Reveal by="word" stagger={70}>
        Words arrive one after another.
      </Reveal>
      <Reveal by="letter" stagger={28} style={{ color: "var(--text-2)", fontSize: "0.8em" }}>
        Letters can, too.
      </Reveal>
    </Preview>
  );
}

const SCRAMBLE_TARGETS = ["Decode this line.", "Then this one.", "And this."];

export function ScrambleDemo() {
  const [i, setI] = useState(0);
  return (
    <Preview label="Scramble trigger=prop">
      <Scramble text={SCRAMBLE_TARGETS[i]} trigger="prop" />
      <button
        type="button"
        className="preview-replay"
        onClick={() => setI((n) => (n + 1) % SCRAMBLE_TARGETS.length)}
      >
        Next line
      </button>
    </Preview>
  );
}

export function MorphDemo() {
  return (
    <Preview label="Morph — continuous cycling, width-compensated">
      <Morph
        values={["Direct", "Transaction", "Processing", "Copy", "Be there soon"]}
        hold={1100}
        duration={700}
        loop
      />
    </Preview>
  );
}

export function CounterDemo() {
  return (
    <Preview label="Counter with prefix, suffix and format">
      <div className="counter-stats">
        <div className="counter-stat">
          <Counter to={12450} prefix="$" duration={1800} startOnView={false} />
          <span>Revenue this week</span>
        </div>
        <div className="counter-stat">
          <Counter
            to={98.4}
            suffix="%"
            format={(n) => n.toFixed(1)}
            duration={1400}
            startOnView={false}
          />
          <span>Uptime</span>
        </div>
        <div className="counter-stat">
          <Counter
            to={214}
            format={(n) =>
              `${Math.floor(n / 60)}m ${String(Math.round(n % 60)).padStart(2, "0")}s`
            }
            duration={1200}
            startOnView={false}
          />
          <span>Avg. build</span>
        </div>
      </div>
    </Preview>
  );
}

export function CounterFromDemo() {
  const [base, setBase] = useState(1280);
  return (
    <Preview label="Counter from and to">
      <Counter
        to={base * 2}
        from={base}
        startOnView={false}
        duration={1200}
        style={{ fontSize: 30, fontWeight: 600 }}
      />
      <button
        type="button"
        className="preview-replay"
        onClick={() => setBase((b) => b + 640)}
      >
        Next quarter
      </button>
    </Preview>
  );
}

export function MarkerHighlightDemo() {
  return (
    <Preview label="Marker highlight, two inks">
      <p className="marker-sentence">
        The launch was{" "}
        <Marker action="highlight" color="amber" show>
          a success
        </Marker>{" "}
        and{" "}
        <Marker action="highlight" color="emerald" show delay={400}>
          everyone came back
        </Marker>{" "}
        the next week.
      </p>
    </Preview>
  );
}

export function MarkerUnderlineDemo() {
  return (
    <Preview label="Marker underline and strike">
      <p className="marker-sentence">
        We{" "}
        <Marker action="underline" color="sky" show>
          shipped on Friday
        </Marker>{" "}
        and{" "}
        <Marker action="strike" color="rose" show delay={400}>
          dropped the cron job
        </Marker>{" "}
        right after.
      </p>
    </Preview>
  );
}

export function MarkerShapeDemo() {
  return (
    <Preview label="Marker circle and box">
      <p className="marker-sentence">
        Circle the{" "}
        <Marker action="circle" color="violet" show>
          deadline
        </Marker>{" "}
        and box the{" "}
        <Marker action="box" color="primary" show delay={400}>
          ship date
        </Marker>
        .
      </p>
    </Preview>
  );
}

/* --------------------------------------------------------------------------
 * Morph showcase demos — the live behaviours that used to lean on a separate
 * morphing package, now built on Swash's own <Morph>: shared characters hold
 * still, only what changed moves, and the line keeps its measured width so
 * nothing around the swap jumps. Zero third-party dependency.
 * ------------------------------------------------------------------------ */

/** Live reduced-motion flag, so a mid-page OS toggle pauses the loops. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Cycles an index on a delay while motion is allowed. */
function useCycle(length: number, ms: number, enabled: boolean): number {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setI((n) => (n + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms, enabled]);
  return i;
}

const PHRASES = [
  "Running late, be there soon.",
  "Running a bit behind, see you soon.",
  "Almost there, hold tight.",
];

/** Phrase — a sentence morphs by its shared characters. */
export function PhraseDemo() {
  const reduced = useReducedMotion();
  const i = useCycle(PHRASES.length, 2400, !reduced);
  return (
    <Preview label="Morph — shared characters stay put">
      <Morph values={PHRASES} loop={false} step={i} duration={600} />
    </Preview>
  );
}

const TONES: Array<[string, string]> = [
  ["Direct", "Running late, be there soon."],
  ["Friendly", "Running a bit behind, I'll be there soon!"],
  ["Formal", "I am running slightly behind; I will arrive shortly."],
];

/** Tone — the same message rewritten; only changed words move. */
export function ToneDemo() {
  const reduced = useReducedMotion();
  const i = useCycle(TONES.length, 2600, !reduced);
  return (
    <Preview label="Morph — rewrite without a layout jump">
      <div className="demo-bubble">
        <Morph values={TONES.map((t) => t[1])} loop={false} step={i} duration={600} />
      </div>
      <div className="demo-tone">
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M6 0.5L7.2 4.3L11 5.5L7.2 6.7L6 10.5L4.8 6.7L1 5.5L4.8 4.3L6 0.5Z"
            fill="currentColor"
          />
        </svg>
        <Morph values={TONES.map((t) => t[0])} loop={false} step={i} duration={500} />
      </div>
    </Preview>
  );
}

const SPRING_WORDS = ["Settled", "Bouncy", "Gentle", "Snappy"];

/** A short, springy swap driven by a cycling step. */
export function SpringDemo() {
  const reduced = useReducedMotion();
  const i = useCycle(SPRING_WORDS.length, 1400, !reduced);
  return (
    <Preview label="Morph — a quick, springy swap">
      <Morph values={SPRING_WORDS} loop={false} step={i} duration={450} />
    </Preview>
  );
}

const AMOUNTS = ["1,204", "1,318", "1,999", "2,048", "98,420"];

/** Amount — a lone number morphs digit by digit. */
export function AmountDemo() {
  const reduced = useReducedMotion();
  const i = useCycle(AMOUNTS.length, 1600, !reduced);
  return (
    <Preview label="Morph — digits change in place">
      <span className="demo-amount">
        <span className="demo-prefix">$</span>
        <Morph values={AMOUNTS} loop={false} step={i} duration={600} />
      </span>
    </Preview>
  );
}

/** Type — edit the field; the readout morphs to what you typed. */
export function TypeDemo() {
  const [pair, setPair] = useState({ prev: "420", next: "420" });
  const onChange = (next: string) => {
    // Only allow a currency-ish string; keep it cheap and safe.
    if (/^\$?[\d,]*\.?\d{0,2}$/.test(next)) {
      setPair((p) => ({ prev: p.next, next }));
    }
  };
  return (
    <Preview label="Morph — rewrites as you type">
      <input
        className="demo-input"
        inputMode="decimal"
        value={pair.next}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Amount"
      />
      <div className="demo-readout">
        <Morph values={[pair.prev, pair.next]} loop={false} step={1} duration={400} />
      </div>
    </Preview>
  );
}

/* --------------------------------------------------------------------------
 * Per-option demos — one demo per distinct behaviour of a component, so a
 * developer sees each prop do its own thing rather than one mixed panel.
 * ------------------------------------------------------------------------ */

/** Typewriter: one phrase, typed once, with the onDone callback. */
export function TypewriterOnceDemo() {
  const [done, setDone] = useState(false);
  return (
    <Preview label="Typewriter text + onDone">
      <Typewriter
        text="One phrase, typed once."
        onDone={() => setDone(true)}
      />
      {done ? <span className="demo-hint">onDone fired</span> : null}
    </Preview>
  );
}

/** Typewriter: the three feel presets side by side, same sentence. */
export function TypewriterFeelDemo() {
  return (
    <Preview label="Typewriter feel presets">
      <div className="tw-feel">
        <span className="tw-feel-label">cinematic</span>
        <Typewriter loop={["The same line."]} feel="cinematic" />
        <span className="tw-feel-label">snappy</span>
        <Typewriter loop={["The same line."]} feel="snappy" />
        <span className="tw-feel-label">playful</span>
        <Typewriter loop={["The same line."]} feel="playful" />
      </div>
    </Preview>
  );
}

/** Frame: controlled show, the outline draws in and erases on toggle. */
export function FrameToggleDemo() {
  const [show, setShow] = useState(true);
  return (
    <Preview label="Frame controlled by show">
      <Frame show={show} label="selected" duration={700}>
        <span style={{ padding: "6px 14px" }}>Toggles without remounting.</span>
      </Frame>
      <PixelButton onClick={() => setShow((v) => !v)}>
        {show ? "Hide frame" : "Show frame"}
      </PixelButton>
    </Preview>
  );
}

/** Frame: colour, corner radius and line width. */
export function FrameStyleDemo() {
  return (
    <Preview label="Frame color, radius and width">
      <div className="frame-row">
        <Frame show color="#e0b341" radius={16} duration={800}>
          <span style={{ padding: "6px 14px" }}>Amber, round</span>
        </Frame>
        <Frame show color="var(--color-accent)" width={3} radius={4} duration={800}>
          <span style={{ padding: "6px 14px" }}>Blue, sharp</span>
        </Frame>
      </div>
    </Preview>
  );
}

/** Reveal: whole lines rise, one after another. */
export function RevealLineDemo() {
  return (
    <Preview label="Reveal by line">
      <Reveal
        by="line"
        stagger={160}
        duration={600}
        style={{ textAlign: "left", maxWidth: 380, fontSize: "0.75em", fontWeight: 400 }}
      >
        Lines rise one after another. Each full line is one piece of the
        animation, wherever it wrapped.
      </Reveal>
    </Preview>
  );
}

/** Reveal: fade with no travel at all. */
export function RevealFadeDemo() {
  return (
    <Preview label="Reveal fade, y=0">
      <Reveal
        by="fade"
        stagger={45}
        y={0}
        style={{ maxWidth: 360, fontSize: "0.75em", fontWeight: 400 }}
      >
        Words fade in where they stand — nothing moves up from below.
      </Reveal>
    </Preview>
  );
}

/** Scramble: click the line to re-decode it. */
export function ScrambleClickDemo() {
  return (
    <Preview label="Scramble trigger=click">
      <Scramble text="Click the line to re-decode it." trigger="click" />
      <span className="demo-hint">trigger=&quot;click&quot;</span>
    </Preview>
  );
}

/** Scramble: a custom charset and speed, cycling between two lines. */
const GLYPH_LINES = ["SYNC // 0xA1", "SIGNAL LOCKED"];

export function ScrambleCharsetDemo() {
  const i = useCycle(GLYPH_LINES.length, 2600, true);
  return (
    <Preview label="Scramble custom charset">
      <Scramble
        text={GLYPH_LINES[i]}
        trigger="prop"
        charset="▚▞░▒▓█01"
        speed={2.2}
      />
    </Preview>
  );
}

/** Morph: driven by step instead of looping on its own. */
const STEP_LABELS = ["Ready", "Building", "Shipped"];

export function MorphStepDemo() {
  const [i, setI] = useState(0);
  return (
    <Preview label="Morph controlled by step">
      <Morph values={STEP_LABELS} loop={false} step={i} duration={600} />
      <div style={{ display: "flex", gap: 8 }}>
        {STEP_LABELS.map((s, n) => (
          <button
            key={s}
            type="button"
            className="preview-replay"
            onClick={() => setI(n)}
          >
            {s}
          </button>
        ))}
      </div>
    </Preview>
  );
}

/** Ticker: odometer digits roll when the value changes. */
const TICKER_VALUES = [499.95, 1299, 27500, 99.9];

export function TickerDemo() {
  const [i, setI] = useState(0);
  return (
    <Preview label="Ticker — rolling digits, static punctuation">
      <div style={{ fontSize: "2rem", fontWeight: 600 }}>
        <Ticker
          value={TICKER_VALUES[i]}
          prefix="$"
          duration={600}
          stagger={40}
          decimals={i === 0 || i === 3 ? 2 : 0}
          separator=","
        />
      </div>
      <button
        type="button"
        className="preview-replay"
        onClick={() => setI((n) => (n + 1) % TICKER_VALUES.length)}
      >
        Change value
      </button>
    </Preview>
  );
}

/** Shimmer: iridescent light beam across text. */
export function ShimmerDemo() {
  return (
    <Preview label="Shimmer — compositor-thread light beam">
      <div style={{ background: "#0b0b12", padding: "24px 28px", borderRadius: 12 }}>
        <Shimmer
          spread={220}
          duration={2400}
          color="rgba(255,255,255,0.9)"
          baseColor="#7a7a94"
        >
          Powered by next-gen AI
        </Shimmer>
      </div>
    </Preview>
  );
}

/** BlurReveal: cinematic depth of field. */
export function BlurRevealDemo() {
  return (
    <Preview label="Blur Reveal — word-safe grouping, no kerning loss">
      <div style={{ fontSize: "1.25rem", lineHeight: 1.6 }}>
        <BlurReveal by="word" blur={10} stagger={60} duration={500}>
          Intelligence designed for every scale.
        </BlurReveal>
      </div>
    </Preview>
  );
}

/** FlipWords: 3D card flip cycler. */
export function FlipWordsDemo() {
  return (
    <Preview label="Flip Words — 3D flip with reserved box">
      <div style={{ fontSize: "1.5rem" }}>
        Make it{" "}
        <FlipWords
          words={["ultra-fast", "bulletproof", "accessible", "production-ready"]}
          duration={2200}
          preserveSpace
          direction="vertical"
        />
        .
      </div>
    </Preview>
  );
}

/** Glitch: chromatic aberration and slice jitter. */
export function GlitchDemo() {
  return (
    <Preview label="Glitch — hover to fire, ::before / ::after only">
      <div style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "0.06em" }}>
        <Glitch
          text="SYSTEM REBOOT"
          trigger="hover"
          intensity="medium"
          colors={["#00ffff", "#ff00ff"]}
        />
      </div>
    </Preview>
  );
}

/** CurvedText: circular spinning badge. */
export function CurvedTextDemo() {
  return (
    <Preview label="Curved Text — SVG textPath, compositor rotate">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CurvedText
          text="EXPLORE THE SYSTEM • SCROLL DOWN • 2026 • "
          radius={72}
          speed={12}
        />
      </div>
    </Preview>
  );
}

/** Wave: kinetic sine text. */
export function WaveDemo() {
  return (
    <Preview label="Wave — grapheme-safe, per-letter CSS delay">
      <div style={{ fontSize: "1.5rem", fontWeight: 500 }}>
        <Wave amplitude={10} interval={90} trigger="hover">
          Catch the momentum 👩‍👩‍👧‍👦
        </Wave>
      </div>
    </Preview>
  );
}

/* ----------------------------------------------------------- second acts */
/* Two more examples per newer component, so every docs page shows the
   props actually used together. */

/** Ticker: three stats on one rolling clock. */
const STAT_SERIES = [
  { uptime: 99.98, requests: 1284, latency: 42 },
  { uptime: 99.95, requests: 2041, latency: 37 },
  { uptime: 100, requests: 986, latency: 51 },
];

export function TickerStatsDemo() {
  const i = useCycle(STAT_SERIES.length, 2400, true);
  const s = STAT_SERIES[i];
  const cells = [
    { label: "uptime", value: <Ticker value={s.uptime} decimals={2} suffix="%" duration={500} /> },
    { label: "requests", value: <Ticker value={s.requests} duration={600} /> },
    { label: "p95 ms", value: <Ticker value={s.latency} duration={450} /> },
  ];
  return (
    <Preview label="Ticker — live stats row">
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
        {cells.map((c) => (
          <div key={c.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 650 }}>{c.value}</div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-faint)",
              }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </Preview>
  );
}

/** Ticker: onDone reports the exact moment every column has landed. */
export function TickerDoneDemo() {
  const [value, setValue] = useState(1024);
  const [landed, setLanded] = useState(true);
  return (
    <Preview label="Ticker — onDone when the digits land">
      <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
        <span style={{ fontSize: "2rem", fontWeight: 650 }}>
          <Ticker value={value} duration={700} onDone={() => setLanded(true)} />
        </span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            className="preview-replay"
            onClick={() => {
              setLanded(false);
              setValue(Math.round(Math.random() * 9000) + 500);
            }}
          >
            Roll a new value
          </button>
          <span aria-live="polite" style={{ fontSize: 13, color: "var(--color-muted)" }}>
            {landed ? "landed" : "rolling…"}
          </span>
        </div>
      </div>
    </Preview>
  );
}

/** Shimmer: loading lines, each lit by a wider beam. */
export function ShimmerLinesDemo() {
  const lines = [
    "Fetching your weekly report…",
    "Crunching 12,481 events",
    "Almost there",
  ];
  return (
    <Preview label="Shimmer — loading lines">
      <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
        {lines.map((l, n) => (
          <Shimmer
            key={l}
            baseColor="#3f3f55"
            color="#9a9ac0"
            spread={120 + n * 60}
            duration={1400 + n * 400}
          >
            {l}
          </Shimmer>
        ))}
      </div>
    </Preview>
  );
}

/** Shimmer: a warm badge — the beam colour is fully yours to pick. */
export function ShimmerBadgeDemo() {
  return (
    <Preview label="Shimmer — lit badge">
      <span
        style={{
          display: "inline-block",
          border: "1px solid var(--color-line)",
          borderRadius: 999,
          padding: "9px 20px",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        <Shimmer spread={90} duration={1800} baseColor="#c9a227" color="#fff3b0">
          ✦ Premium tier
        </Shimmer>
      </span>
    </Preview>
  );
}

/** Blur Reveal: by line, for hero copy that arrives like titles. */
export function BlurRevealLineDemo() {
  const [run, setRun] = useState(0);
  return (
    <Preview label="Blur Reveal — by line, hero copy">
      <h3 key={run} style={{ margin: 0, fontSize: "1.6rem", lineHeight: 1.35, textAlign: "center" }}>
        <BlurReveal by="line" blur={14} stagger={140} duration={700} startOnView={false}>
          {"Motion that means something.\nEvery line finds its place."}
        </BlurReveal>
      </h3>
      <button type="button" className="preview-replay" onClick={() => setRun((n) => n + 1)}>
        Replay lines
      </button>
    </Preview>
  );
}

/** Blur Reveal: by char for a short display phrase. */
export function BlurRevealCharDemo() {
  const [run, setRun] = useState(0);
  return (
    <Preview label="Blur Reveal — by char, short title">
      <p key={run} style={{ margin: 0, fontSize: "1.8rem", fontWeight: 600 }}>
        <BlurReveal by="char" blur={8} stagger={28} duration={450} startOnView={false}>
          Set in motion.
        </BlurReveal>
      </p>
      <button type="button" className="preview-replay" onClick={() => setRun((n) => n + 1)}>
        Replay letters
      </button>
    </Preview>
  );
}

/** Flip Words: the horizontal axis, width breathing with each word. */
export function FlipWordsHorizontalDemo() {
  return (
    <Preview label="Flip Words — horizontal, breathing width">
      <div style={{ fontSize: "1.5rem" }}>
        A cache of <em>some</em> size — actually{" "}
        <FlipWords
          words={["tiny", "compact", "capacious", "enormous"]}
          duration={2000}
          preserveSpace={false}
          direction="horizontal"
        />
        .
      </div>
    </Preview>
  );
}

/** Flip Words: begin where you like, dwell as long as you like. */
export function FlipWordsStartDemo() {
  return (
    <Preview label="Flip Words — start at your index">
      <div style={{ fontSize: "1.4rem" }}>
        Our promise:{" "}
        <FlipWords
          words={["quiet", "steady", "fast", "kind"]}
          duration={3200}
          startAtIndex={2}
        />
        .
      </div>
    </Preview>
  );
}

/** Glitch: always-on ambience at the lowest intensity. */
export function GlitchAlwaysDemo() {
  return (
    <Preview label="Glitch — always on, subtle">
      <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.1em" }}>
        <Glitch text="OUT OF ORDER" trigger="always" intensity="subtle" />
      </div>
    </Preview>
  );
}

/** Glitch: one burst when the block scrolls into view. */
export function GlitchScrollDemo() {
  return (
    <Preview label="Glitch — fires on scroll">
      <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
        <Glitch
          text="SIGNAL LOST"
          trigger="scroll"
          intensity="medium"
          colors={["#ffd166", "#ef476f"]}
        />
      </div>
    </Preview>
  );
}

/** Curved Text: counter-clockwise, extra letter spacing along the path. */
export function CurvedTextReverseDemo() {
  return (
    <Preview label="Curved Text — reverse, wide spacing">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CurvedText
          text="AROUND WE GO • SLOWLY • "
          radius={64}
          speed={8}
          reverse
          spacing={2}
        />
      </div>
    </Preview>
  );
}

/** Curved Text: a compact sticker beside a label. */
export function CurvedTextBadgeDemo() {
  return (
    <Preview label="Curved Text — compact sticker">
      <div style={{ display: "flex", alignItems: "center", gap: 18, justifyContent: "center" }}>
        <CurvedText text="NEW DROP • 2026 • " radius={34} speed={5} />
        <span style={{ fontSize: 15, color: "var(--color-muted)" }}>
          It spins on the compositor — one keyframe, no JavaScript per frame.
        </span>
      </div>
    </Preview>
  );
}

/** Wave: an endless loop, tighter than the hover default. */
export function WaveLoopDemo() {
  return (
    <Preview label="Wave — endless loop">
      <div style={{ fontSize: "1.4rem", fontWeight: 500 }}>
        <Wave trigger="loop" amplitude={6} interval={70} duration={1000}>
          Never standing still
        </Wave>
      </div>
    </Preview>
  );
}

/** Wave: one pass when the line enters the viewport. */
export function WaveViewDemo() {
  return (
    <Preview label="Wave — rises on view">
      <div style={{ fontSize: "1.4rem", fontWeight: 500 }}>
        <Wave trigger="view" amplitude={12} interval={110}>
          Good morning ☀️
        </Wave>
      </div>
    </Preview>
  );
}
