"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BlurReveal,
  Counter,
  CurvedText,
  FlipWords,
  Frame,
  Glitch,
  Marker,
  Morph,
  Reveal,
  Scramble,
  Shimmer,
  Ticker,
  Typewriter,
  Wave,
} from "swash";
import { CopyButton } from "./copy-button";
import { Highlighted } from "./highlight";
import { PRESETS } from "./example-presets";

/** Live demos, one per preset, mirroring the snippet source in the card. */
function TypewriterBody() {
  return (
    <Typewriter
      loop={[
        "Typed character by character.",
        "Graphemes, not code units. 🦊",
        "Edit this and watch it change.",
      ]}
      feel="snappy"
    />
  );
}

function MorphBody() {
  return (
    <Morph
      values={["Direct", "Transaction", "Processing", "Copy"]}
      hold={1100}
      duration={700}
      loop
    />
  );
}

function SpringBody() {
  const moods = ["Settled", "Bouncy", "Gentle", "Snappy"];
  const [i, setI] = useState(0);
  return (
    <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
      <Morph
        values={moods}
        loop={false}
        step={i}
        duration={450}
        style={{ fontSize: 34, fontWeight: 600 }}
      />
      <button
        type="button"
        className="preview-replay"
        onClick={() => setI((n) => (n + 1) % moods.length)}
      >
        Next mood
      </button>
    </div>
  );
}

function CounterBody() {
  const [amount, setAmount] = useState(1204);
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
      <Counter
        to={amount}
        prefix="$"
        startOnView={false}
        duration={1200}
        style={{ fontSize: 34, fontWeight: 600 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        {[1204, 1999, 98420].map((n) => (
          <button
            key={n}
            type="button"
            className="preview-replay"
            onClick={() => setAmount(n)}
          >
            ${n.toLocaleString("en")}
          </button>
        ))}
      </div>
    </div>
  );
}

function RevealMarkerBody() {
  return (
    <div style={{ display: "grid", gap: 16, textAlign: "left", maxWidth: 480 }}>
      <Reveal by="word" stagger={60} duration={520}>
        Every word arrives on its own beat.
      </Reveal>
      <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 15 }}>
        The launch was{" "}
        <Marker action="underline" color="sky">
          a success
        </Marker>{" "}
        for everyone involved.
      </p>
    </div>
  );
}

function ScrambleBody() {
  const lines = [
    "Initiating decode sequence.",
    "Payload verified.",
    "Handshake complete.",
  ];
  const [i, setI] = useState(0);
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
      <Scramble text={lines[i]} trigger="prop" speed={1.4} />
      <button
        type="button"
        className="preview-replay"
        onClick={() => setI((n) => (n + 1) % lines.length)}
      >
        Decode next line
      </button>
    </div>
  );
}

function FrameBody() {
  const items = ["Ship faster", "Zero deps", "SSR-safe"];
  const [picked, setPicked] = useState(1);
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {items.map((t, i) => (
        <Frame
          key={t}
          show={picked === i}
          label={picked === i ? "selected" : undefined}
          duration={600}
        >
          <button
            type="button"
            className="preview-replay"
            style={{ padding: "10px 16px" }}
            onClick={() => setPicked(i)}
          >
            {t}
          </button>
        </Frame>
      ))}
    </div>
  );
}

function TicketBody() {
  const routes = ["Lahore → Karachi", "Delhi → Mumbai", "Dubai → Paris"];
  const gates = ["A7", "B12", "C3"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % routes.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="demo-bubble"
      style={{ display: "grid", gap: 10, textAlign: "left", maxWidth: 420 }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.14em",
          color: "var(--color-faint)",
        }}
      >
        <Scramble text="BOARDING PASS" trigger="mount" speed={1.2} />
      </span>
      <span style={{ fontSize: 28, fontWeight: 600 }}>
        <Morph values={routes} hold={1600} duration={700} loop={false} step={i} />
      </span>
      <span style={{ fontSize: 15, color: "var(--color-muted)" }}>
        Gate <Morph values={gates} loop={false} step={i} duration={500} /> · Seat{" "}
        <Counter to={14 - i * 3} from={1} startOnView={false} duration={800} />
      </span>
    </div>
  );
}

const TICKER_PRICES = [499.95, 1299, 27500];

function TickerBody() {
  const [i, setI] = useState(0);
  return (
    <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
      <span style={{ fontSize: 40, fontWeight: 700 }}>
        <Ticker
          value={TICKER_PRICES[i]}
          prefix="$"
          decimals={i === 0 ? 2 : 0}
          duration={600}
        />
      </span>
      <button
        type="button"
        className="preview-replay"
        onClick={() => setI((n) => (n + 1) % TICKER_PRICES.length)}
      >
        Change price
      </button>
    </div>
  );
}

function ShimmerBody() {
  return (
    <div style={{ background: "#0b0b12", padding: "26px 30px", borderRadius: 14 }}>
      <span style={{ display: "block", fontSize: 26, fontWeight: 600 }}>
        <Shimmer spread={220} duration={2400}>New release is live</Shimmer>
      </span>
      <span style={{ display: "block", marginTop: 8, fontSize: 13 }}>
        <Shimmer spread={140} duration={3200} baseColor="#5b5b74">
          the unlit colour is yours to pick
        </Shimmer>
      </span>
    </div>
  );
}

function BlurRevealBody() {
  const [run, setRun] = useState(0);
  return (
    <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
      <h3 key={run} style={{ margin: 0, fontSize: 30 }}>
        <BlurReveal
          by="word"
          blur={12}
          stagger={70}
          duration={600}
          startOnView={false}
        >
          Focus, on cue.
        </BlurReveal>
      </h3>
      <button
        type="button"
        className="preview-replay"
        onClick={() => setRun((n) => n + 1)}
      >
        Replay reveal
      </button>
    </div>
  );
}

function FlipWordsBody() {
  return (
    <p style={{ margin: 0, fontSize: 26 }}>
      Build it{" "}
      <FlipWords
        words={["fast", "bulletproof", "accessible", "fun"]}
        duration={2200}
        direction="horizontal"
      />
      .
    </p>
  );
}

function GlitchBody() {
  return (
    <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.08em" }}>
      <Glitch
        text="STATIC//NOISE"
        trigger="hover"
        intensity="heavy"
        colors={["#38f5ff", "#ff3adc"]}
      />
    </div>
  );
}

function CurvedTextBody() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <CurvedText text="HANDCRAFTED • SINCE 2026 • " radius={64} speed={10} />
    </div>
  );
}

function WaveBody() {
  return (
    <h3 style={{ margin: 0, fontSize: 30, fontWeight: 600 }}>
      <Wave trigger="loop" amplitude={8} interval={80}>
        Hello there 👋
      </Wave>
    </h3>
  );
}

const BODIES: Record<string, () => ReactNode> = {
  typewriter: TypewriterBody,
  morph: MorphBody,
  "morph-spring": SpringBody,
  counter: CounterBody,
  "reveal-marker": RevealMarkerBody,
  scramble: ScrambleBody,
  frame: FrameBody,
  "hero-ticket": TicketBody,
  ticker: TickerBody,
  shimmer: ShimmerBody,
  "blur-reveal": BlurRevealBody,
  "flip-words": FlipWordsBody,
  glitch: GlitchBody,
  "curved-text": CurvedTextBody,
  wave: WaveBody,
};

function ExampleCard({ id }: { id: string }) {
  const preset = PRESETS.find((p) => p.id === id);
  const [open, setOpen] = useState(false);
  if (!preset) return null;
  const Body = BODIES[id];
  return (
    <article className="example-card">
      <div className="example-body">{Body ? <Body /> : null}</div>
      <div className="example-bar">
        <div className="example-info">
          <h3>{preset.title}</h3>
          <p>{preset.blurb}</p>
        </div>
        <div className="example-actions">
          <button
            type="button"
            className="preview-replay"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide code" : "Show code"}
          </button>
          <span className="copy-inline">
            <CopyButton text={preset.code} />
          </span>
        </div>
      </div>
      {open ? (
        <div className="example-src">
          <Highlighted code={preset.code} lang="tsx" />
        </div>
      ) : null}
    </article>
  );
}

export function ExampleGallery() {
  return (
    <div className="example-grid">
      {PRESETS.map((p) => (
        <ExampleCard key={p.id} id={p.id} />
      ))}
    </div>
  );
}
