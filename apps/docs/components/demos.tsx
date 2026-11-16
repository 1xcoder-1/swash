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
  Glitch,
  Wave,
  Neon,
  Echo,
  Slice,
  SplitFlap,
} from "swash";
import { Preview } from "./preview";
import { PixelButton } from "./pixel-button";

export function TypewriterDemo() {
  return (
    <Preview label="Typewriter loop + feel">
      <Typewriter
        loop={[
          "Your Weekly Report Is Ready.",
          "Graphemes, Not Code Units.",
          "Reduced Motion Prints It All At Once.",
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
        <span style={{ padding: "6px 14px" }}>Every Element Gets A Frame.</span>
      </Frame>
    </Preview>
  );
}

export function RevealDemo() {
  return (
    <Preview label="Reveal by word, then by letter">
      <Reveal by="word" stagger={70}>
        Words Arrive One After Another.
      </Reveal>
      <Reveal by="letter" stagger={28} style={{ color: "var(--text-2)", fontSize: "0.8em" }}>
        Letters Can, Too.
      </Reveal>
    </Preview>
  );
}

const SCRAMBLE_TARGETS = ["Decode This Line.", "Then This One.", "And This One."];

export function ScrambleDemo() {
  const [i, setI] = useState(0);
  return (
    <Preview label="Scramble trigger=prop">
      <Scramble text={SCRAMBLE_TARGETS[i]} trigger="prop" />
      <PixelButton onClick={() => setI((n) => (n + 1) % SCRAMBLE_TARGETS.length)}>
        Next Line
      </PixelButton>
    </Preview>
  );
}

export function MorphDemo() {
  return (
    <Preview label="Morph — continuous cycling, width-compensated">
      <Morph
        values={["Direct", "Transaction", "Processing", "Copy", "Be There Soon"]}
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
          <span>Revenue This Week</span>
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
          <span>Avg. Build</span>
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
        style={{ fontSize: 30, fontWeight: 500 }}
      />
      <PixelButton onClick={() => setBase((b) => b + 640)}>
        Next Quarter
      </PixelButton>
    </Preview>
  );
}

export function MarkerHighlightDemo() {
  return (
    <Preview label="Marker highlight, two inks">
      <p className="marker-sentence">
        The Launch Was{" "}
        <Marker action="highlight" color="amber" show>
          A Success
        </Marker>{" "}
        And{" "}
        <Marker action="highlight" color="emerald" show delay={400}>
          Everyone Came Back
        </Marker>{" "}
        The Next Week.
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
          Shipped On Friday
        </Marker>{" "}
        And{" "}
        <Marker action="strike" color="rose" show delay={400}>
          Dropped The Cron Job
        </Marker>{" "}
        Right After.
      </p>
    </Preview>
  );
}

export function MarkerShapeDemo() {
  return (
    <Preview label="Marker circle and box">
      <p className="marker-sentence">
        Circle The{" "}
        <Marker action="circle" color="violet" show>
          Deadline
        </Marker>{" "}
        And Box The{" "}
        <Marker action="box" color="primary" show delay={400}>
          Ship Date
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
  "Running Late, Be There Soon.",
  "Running A Bit Behind, See You Soon.",
  "Almost There, Hold Tight.",
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
  ["Direct", "Running Late, Be There Soon."],
  ["Friendly", "Running A Bit Behind, I'll Be There Soon!"],
  ["Formal", "I Am Running Slightly Behind; I Will Arrive Shortly."],
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
        text="One Phrase, Typed Once."
        onDone={() => setDone(true)}
      />
      {done ? <span className="demo-hint">onDone Fired</span> : null}
    </Preview>
  );
}

/** Typewriter: the three feel presets side by side, same sentence. */
export function TypewriterFeelDemo() {
  return (
    <Preview label="Typewriter feel presets">
      <div className="tw-feel">
        <span className="tw-feel-label">cinematic</span>
        <Typewriter loop={["The Same Line."]} feel="cinematic" />
        <span className="tw-feel-label">snappy</span>
        <Typewriter loop={["The Same Line."]} feel="snappy" />
        <span className="tw-feel-label">playful</span>
        <Typewriter loop={["The Same Line."]} feel="playful" />
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
        <span style={{ padding: "6px 14px" }}>Toggles Without Remounting.</span>
      </Frame>
      <PixelButton onClick={() => setShow((v) => !v)}>
        {show ? "Hide Frame" : "Show Frame"}
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
          <span style={{ padding: "6px 14px" }}>Amber, Round</span>
        </Frame>
        <Frame show color="var(--color-accent)" width={3} radius={4} duration={800}>
          <span style={{ padding: "6px 14px" }}>Blue, Sharp</span>
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
        style={{ textAlign: "left", maxWidth: 380, fontSize: "0.75em", fontWeight: 500 }}
      >
        Lines Rise One After Another. Each Full Line Is One Piece Of The
        Animation, Wherever It Wrapped.
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
        style={{ maxWidth: 360, fontSize: "0.75em", fontWeight: 500 }}
      >
        Words Fade In Where They Stand — Nothing Moves Up From Below.
      </Reveal>
    </Preview>
  );
}

/** Scramble: click the line to re-decode it. */
export function ScrambleClickDemo() {
  return (
    <Preview label="Scramble trigger=click">
      <Scramble text="Click The Line To Re-Decode It." trigger="click" />
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
          <PixelButton
            key={s}
            className={i === n ? "is-active" : undefined}
            aria-pressed={i === n}
            onClick={() => setI(n)}
          >
            {s}
          </PixelButton>
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
      <div style={{ fontSize: "2rem", fontWeight: 500 }}>
        <Ticker
          value={TICKER_VALUES[i]}
          prefix="$"
          duration={600}
          stagger={40}
          decimals={i === 0 || i === 3 ? 2 : 0}
          separator=","
        />
      </div>
      <PixelButton onClick={() => setI((n) => (n + 1) % TICKER_VALUES.length)}>
        Change Value
      </PixelButton>
    </Preview>
  );
}

/** Reveal: the blur entrance — pieces pull into focus. */
export function RevealBlurDemo() {
  return (
    <Preview label="Reveal — blur into focus">
      <div style={{ fontSize: "1.25rem", lineHeight: 1.6 }}>
        <Reveal by="word" effect="blur" blur={10} stagger={60} duration={500}>
          Intelligence Designed For Every Scale.
        </Reveal>
      </div>
    </Preview>
  );
}

/** Glitch: chromatic aberration and slice jitter. */
export function GlitchDemo() {
  return (
    <Preview label="Glitch — hover to fire, ::before / ::after only">
      <div style={{ fontSize: "1.75rem", fontWeight: 500, letterSpacing: "0.06em" }}>
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

/** Wave: kinetic sine text. */
export function WaveDemo() {
  return (
    <Preview label="Wave — grapheme-safe, per-letter CSS delay">
      <div style={{ fontSize: "1.5rem", fontWeight: 500 }}>
        <Wave amplitude={10} interval={90} trigger="hover">
          Catch The Momentum
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
            <div style={{ fontSize: "1.6rem", fontWeight: 500 }}>{c.value}</div>
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
        <span style={{ fontSize: "2rem", fontWeight: 500 }}>
          <Ticker value={value} duration={700} onDone={() => setLanded(true)} />
        </span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <PixelButton
            onClick={() => {
              setLanded(false);
              setValue(Math.round(Math.random() * 9000) + 500);
            }}
          >
            Roll A New Value
          </PixelButton>
          <span aria-live="polite" style={{ fontSize: 13, color: "var(--color-muted)" }}>
            {landed ? "Landed" : "Rolling…"}
          </span>
        </div>
      </div>
    </Preview>
  );
}

/** Ticker: the same roll seen from all three directions. */
export function TickerDirectionDemo() {
  const [value, setValue] = useState(4729);
  return (
    <Preview label="Ticker — up, down and auto">
      <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
          {([
            ["up", "up"],
            ["down", "down"],
            ["auto", "auto"],
          ] as const).map(([label, dir]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Ticker value={value} direction={dir} duration={700} />
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-faint)",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
        <PixelButton
          onClick={() => setValue(Math.round(Math.random() * 9000) + 500)}
        >
          Roll A New Value
        </PixelButton>
      </div>
    </Preview>
  );
}

/** Reveal: by line with the blur entrance, for hero copy that arrives like titles. */
export function RevealBlurLineDemo() {
  const [run, setRun] = useState(0);
  return (
    <Preview label="Reveal — blur, by line">
      <h3 key={run} style={{ margin: 0, fontSize: "1.6rem", lineHeight: 1.35, textAlign: "center" }}>
        <Reveal key={run} by="line" effect="blur" blur={14} stagger={140} duration={700} startOnView={false}>
          Motion That Means Something.\nEvery Line Finds Its Place.
        </Reveal>
      </h3>
      <button type="button" className="preview-replay" onClick={() => setRun((n) => n + 1)}>
        Replay Lines
      </button>
    </Preview>
  );
}

/** Reveal: by letter with the blur entrance, for a short display phrase. */
export function RevealBlurCharDemo() {
  const [run, setRun] = useState(0);
  return (
    <Preview label="Reveal — blur, by letter">
      <p key={run} style={{ margin: 0, fontSize: "1.8rem", fontWeight: 500 }}>
        <Reveal key={run} by="letter" effect="blur" blur={8} stagger={28} duration={450} startOnView={false}>
          Set In Motion.
        </Reveal>
      </p>
      <button type="button" className="preview-replay" onClick={() => setRun((n) => n + 1)}>
        Replay Letters
      </button>
    </Preview>
  );
}

/** Glitch: always-on ambience at the lowest intensity. */
export function GlitchAlwaysDemo() {
  return (
    <Preview label="Glitch — always on, subtle">
      <div style={{ fontSize: "1.6rem", fontWeight: 500, letterSpacing: "0.1em" }}>
        <Glitch text="OUT OF ORDER" trigger="always" intensity="subtle" />
      </div>
    </Preview>
  );
}

/** Glitch: one burst when the block scrolls into view. */
export function GlitchScrollDemo() {
  return (
    <Preview label="Glitch — fires on scroll">
      <div style={{ fontSize: "1.6rem", fontWeight: 500 }}>
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

/** Wave: an endless loop, tighter than the hover default. */
export function WaveLoopDemo() {
  return (
    <Preview label="Wave — endless loop">
      <div style={{ fontSize: "1.4rem", fontWeight: 500 }}>
        <Wave trigger="loop" amplitude={6} interval={70} duration={1000}>
          Never Standing Still
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
          Good Morning
        </Wave>
      </div>
    </Preview>
  );
}

/* --------------------------------------------------------------------------
 * The second wave of components: Neon, Echo, Slice,
 * SplitFlap. Same contract as the ones above — a live panel, a label the
 * demo-code table can answer, and real text in the markup.
 * ------------------------------------------------------------------------ */

/** Neon: a lit tube with its soft flicker. */
export function NeonDemo() {
  return (
    <Preview label="Neon — tube and flicker">
      <span style={{ fontSize: "2.2rem", fontWeight: 500 }}>
        <Neon text="OPEN ALL NIGHT" color="magenta" flicker="soft" />
      </span>
    </Preview>
  );
}

/** Neon: the named tube inks, the same word lit in each. */
export function NeonInkDemo() {
  return (
    <Preview label="Neon — tube inks">
      <div
        className="tw-feel"
        style={{ rowGap: 8, gridTemplateColumns: "auto auto", justifyContent: "center", columnGap: 28 }}
      >
        <span className="tw-feel-label">cyan</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Neon text="LAST CALL" color="cyan" flicker="none" />
        </span>
        <span className="tw-feel-label">magenta</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Neon text="LAST CALL" color="magenta" flicker="none" />
        </span>
        <span className="tw-feel-label">lime</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Neon text="LAST CALL" color="lime" flicker="none" />
        </span>
        <span className="tw-feel-label">amber</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Neon text="LAST CALL" color="amber" flicker="none" />
        </span>
      </div>
    </Preview>
  );
}

/** Neon: the three flicker presets side by side, same tube. */
export function NeonFlickerDemo() {
  return (
    <Preview label="Neon — flicker presets">
      <div
        className="tw-feel"
        style={{ rowGap: 8, gridTemplateColumns: "auto auto", justifyContent: "center", columnGap: 28 }}
      >
        <span className="tw-feel-label">none</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Neon text="NEON BAR" color="violet" flicker="none" />
        </span>
        <span className="tw-feel-label">soft</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Neon text="NEON BAR" color="violet" flicker="soft" />
        </span>
        <span className="tw-feel-label">hard</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Neon text="NEON BAR" color="violet" flicker="hard" />
        </span>
      </div>
    </Preview>
  );
}

/** Neon: a sign that hums only while the pointer is on it. */
export function NeonHoverDemo() {
  return (
    <Preview label="Neon — lights on hover">
      <span style={{ fontSize: "1.8rem", fontWeight: 500 }}>
        <Neon text="VACANCY" color="amber" flicker="none" trigger="hover" />
      </span>
    </Preview>
  );
}

/** Echo: a travelling pulse under still text. */
export function EchoDemo() {
  return (
    <Preview label="Echo — a trail under the text">
      <div style={{ fontSize: "1.9rem", fontWeight: 500 }}>
        <Echo count={4} delay={420} spread={1.3} trigger="always">SIGNAL</Echo>
      </div>
    </Preview>
  );
}

/** Echo: how deep the trail runs, one pulse per count preset. */
export function EchoDepthDemo() {
  return (
    <Preview label="Echo — trail depth">
      <div
        className="tw-feel"
        style={{ gridTemplateColumns: "auto auto", justifyContent: "center", columnGap: 28 }}
      >
        <span className="tw-feel-label">count=1</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Echo count={1} delay={600} trigger="always">Ping</Echo>
        </span>
        <span className="tw-feel-label">count=3</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Echo count={3} delay={420} trigger="always">Ping</Echo>
        </span>
        <span className="tw-feel-label">count=6</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Echo count={6} delay={300} trigger="always">Ping</Echo>
        </span>
      </div>
    </Preview>
  );
}

/** Echo: keyed to the pointer instead of running forever. */
export function EchoHoverDemo() {
  return (
    <Preview label="Echo — pulses on hover">
      <div style={{ fontSize: "1.6rem", fontWeight: 500 }}>
        <Echo count={3} delay={300} duration={1200} trigger="hover">Hover Me</Echo>
      </div>
    </Preview>
  );
}

/** Echo: a wider ripple in the site's own accent, cued on view. */
export function EchoStyleDemo() {
  return (
    <Preview label="Echo — wider ripple on view">
      <div style={{ fontSize: "1.9rem", fontWeight: 500 }}>
        <Echo
          count={5}
          delay={340}
          duration={1400}
          spread={1.5}
          color="var(--color-accent)"
          trigger="view"
        >
          You Have Mail
        </Echo>
      </div>
    </Preview>
  );
}

/** Slice: the loop parts the halves and closes them. */
export function SliceDemo() {
  return (
    <Preview label="Slice — the seam opens and closes">
      <div style={{ fontSize: "2rem", fontWeight: 500 }}>
        <Slice text="DIVIDED" trigger="loop" hold={1300} amount={18} />
      </div>
    </Preview>
  );
}

/** Slice: how far each half slides, one word per amount. */
export function SliceAmountDemo() {
  return (
    <Preview label="Slice — slide distance">
      <div className="tw-feel">
        <span className="tw-feel-label">amount=6</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Slice text="Narrow" amount={6} />
        </span>
        <span className="tw-feel-label">amount=14</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Slice text="Middle" />
        </span>
        <span className="tw-feel-label">amount=32</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 500, textAlign: "center" }}>
          <Slice text="Widest" amount={32} />
        </span>
      </div>
    </Preview>
  );
}

/** Slice: parts under the pointer, closes when it leaves. */
export function SliceHoverDemo() {
  return (
    <Preview label="Slice — parts on hover">
      <div style={{ fontSize: "1.6rem", fontWeight: 500 }}>
        <Slice text="Bisect" trigger="hover" amount={12} />
      </div>
    </Preview>
  );
}

/** Slice: a slower slide cued the moment the line comes into view. */
export function SliceViewDemo() {
  return (
    <Preview label="Slice — parts on view">
      <div style={{ fontSize: "2rem", fontWeight: 500 }}>
        <Slice text="Sever" trigger="view" amount={26} duration={620} />
      </div>
    </Preview>
  );
}

const FLIGHTS = ["DELAYED", "BOARDING", "DEPARTED", "ON TIME"];

/** Split Flap: a departures board landing on each status. */
export function SplitFlapDemo() {
  const reduced = useReducedMotion();
  const i = useCycle(FLIGHTS.length, 2600, !reduced);
  return (
    <Preview label="Split Flap — the board turns over">
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.9rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
        }}
      >
        <SplitFlap text={FLIGHTS[i]} interval={90} />
      </span>
    </Preview>
  );
}

const DEPARTS = ["18:45", "19:30", "21:05", "23:40"];

/** Split Flap: a clock of tiles churning only through digits. */
export function SplitFlapTimeDemo() {
  const reduced = useReducedMotion();
  const i = useCycle(DEPARTS.length, 2600, !reduced);
  return (
    <Preview label="Split Flap — a clock of tiles">
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "2.4rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
        }}
      >
        <SplitFlap text={DEPARTS[i]} charset="0123456789" interval={70} />
      </span>
    </Preview>
  );
}

const GATES = ["GATE A12", "GATE B07"];

/** Split Flap: the same call on two boards, each at its own flip speed. */
export function SplitFlapSpeedDemo() {
  const reduced = useReducedMotion();
  const i = useCycle(GATES.length, 3200, !reduced);
  const boards = [
    { label: "fast", interval: 45 },
    { label: "slow", interval: 160 },
  ];
  return (
    <Preview label="Split Flap — flip speed">
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
        {boards.map((b) => (
          <div key={b.label} style={{ textAlign: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.6rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
            >
              <SplitFlap text={GATES[i]} interval={b.interval} />
            </span>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-faint)",
              }}
            >
              {b.label}
            </div>
          </div>
        ))}
      </div>
    </Preview>
  );
}

const CALLS = ["NOW BOARDING", "GATE CLOSED"];

/** Split Flap: onDone reports the moment the last tile has landed. */
export function SplitFlapDoneDemo() {
  const [i, setI] = useState(0);
  const [settled, setSettled] = useState(true);
  return (
    <Preview label="Split Flap — onDone when the board settles">
      <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.8rem",
            fontWeight: 500,
            letterSpacing: "0.06em",
          }}
        >
          <SplitFlap text={CALLS[i]} interval={80} onDone={() => setSettled(true)} />
        </span>
        <PixelButton
          disabled={!settled}
          onClick={() => {
            setSettled(false);
            setI((n) => (n + 1) % CALLS.length);
          }}
        >
          Flip A New Line
        </PixelButton>
      </div>
    </Preview>
  );
}
