"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Counter,
  Frame,
  Glitch,
  Marker,
  Morph,
  Reveal,
  Scramble,
  Ticker,
  Typewriter,
  Wave,
  Neon,
  Echo,
  Slice,
  SplitFlap,
} from "react-swash";
import { CopyButton } from "./copy-button";
import { Highlighted } from "./highlight";
import { PRESETS } from "./example-presets";

/** Live demos, one per preset, mirroring the snippet source in the card. */
function TypewriterBody() {
  return (
    <Typewriter
      loop={[
        "Typed Character By Character.",
        "Graphemes, Not Code Units.",
        "Edit This And Watch It Change.",
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
        style={{ fontSize: 34, fontWeight: 500 }}
      />
      <button
        type="button"
        className="preview-replay"
        onClick={() => setI((n) => (n + 1) % moods.length)}
      >
        Next Mood
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
        style={{ fontSize: 34, fontWeight: 500 }}
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
        Every Word Arrives On Its Own Beat.
      </Reveal>
      <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 15 }}>
        The Launch Was{" "}
        <Marker action="underline" color="sky">
          A Success
        </Marker>{" "}
        For Everyone Involved.
      </p>
    </div>
  );
}

function ScrambleBody() {
  const lines = [
    "Initiating Decode Sequence.",
    "Payload Verified.",
    "Handshake Complete.",
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
        Decode Next Line
      </button>
    </div>
  );
}

function FrameBody() {
  const items = ["Ship Faster", "Zero Deps", "SSR-Safe"];
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
  const routes = ["LAHORE → KARACHI", "DELHI → MUMBAI", "DUBAI → PARIS"];
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
      <span style={{ fontSize: 28, fontWeight: 500 }}>
        <Morph values={routes} hold={1600} duration={700} loop={false} step={i} />
      </span>
      <span style={{ fontSize: 15, color: "var(--color-muted)" }}>
        GATE <Morph values={gates} loop={false} step={i} duration={500} /> · SEAT{" "}
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
      <span style={{ fontSize: 40, fontWeight: 500 }}>
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
        Change Price
      </button>
    </div>
  );
}

function RevealBlurBody() {
  const [run, setRun] = useState(0);
  return (
    <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
      <h3 key={run} style={{ margin: 0, fontSize: 30 }}>
        <Reveal key={run} by="word" effect="blur" blur={12} stagger={70} duration={600} startOnView={false}>
          Focus, on cue.
        </Reveal>
      </h3>
      <button
        type="button"
        className="preview-replay"
        onClick={() => setRun((n) => n + 1)}
      >
        Replay Reveal
      </button>
    </div>
  );
}


function GlitchBody() {
  return (
    <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "0.08em" }}>
      <Glitch
        text="CARRIER LOST"
        trigger="hover"
        intensity="heavy"
        colors={["#38f5ff", "#ff3adc"]}
      />
    </div>
  );
}

function WaveBody() {
  return (
    <h3 style={{ margin: 0, fontSize: 30, fontWeight: 500 }}>
      <Wave trigger="loop" amplitude={8} interval={80}>
        Hello There 👋
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
  "reveal-blur": RevealBlurBody,
  glitch: GlitchBody,
  wave: WaveBody,
  neon: NeonBody,
  "split-flap": SplitFlapBody,
  echo: EchoBody,
  slice: SliceBody,
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
            {open ? "Hide Code" : "Show Code"}
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


function NeonBody() {
  return (
    <div style={{ fontSize: 34, fontWeight: 500 }}>
      <Neon text="OPEN ALL NIGHT" color="magenta" flicker="soft" />
    </div>
  );
}

function SplitFlapBody() {
  const flights = ["DELAYED", "BOARDING", "DEPARTED", "ON TIME"];
  const [i, setI] = useState(0);
  return (
    <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, letterSpacing: "0.06em" }}>
        <SplitFlap text={flights[i]} interval={90} />
      </span>
      <button
        type="button"
        className="preview-replay"
        onClick={() => setI((n) => (n + 1) % flights.length)}
      >
        Next Status
      </button>
    </div>
  );
}

function EchoBody() {
  return (
    <div style={{ fontSize: 32, fontWeight: 500 }}>
      <Echo count={4} delay={420} spread={1.3} trigger="always">SIGNAL</Echo>
    </div>
  );
}

function SliceBody() {
  return (
    <div style={{ fontSize: 34, fontWeight: 500 }}>
      <Slice text="DIVIDED" trigger="loop" hold={1300} amount={18} />
    </div>
  );
}
