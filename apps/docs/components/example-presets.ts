/**
 * Example presets: the single source of truth for the Examples gallery —
 * each card renders a live demo and reveals this snippet as its source.
 *
 * Contract for each snippet: it is the body of a React component. React,
 * useState/useEffect/useRef/useMemo and every swash component are already in
 * scope — no imports needed. The snippet must `return` one React element.
 */
export interface Preset {
  id: string;
  title: string;
  blurb: string;
  code: string;
}

export const PRESETS: Preset[] = [
  {
    id: "typewriter",
    title: "Typewriter loop",
    blurb: "Phrases typed, held and erased on a loop, grapheme-safe.",
    code: `// Everything you need is in scope — no imports.
return (
  <Typewriter
    loop={[
      "Typed character by character.",
      "Graphemes, not code units. 🦊",
      "Edit this and watch it change.",
    ]}
    feel="snappy"
  />
);`,
  },
  {
    id: "morph",
    title: "Morph cycle",
    blurb: "Shared characters slide into place as the word changes.",
    code: `const values = ["Direct", "Transaction", "Processing", "Copy"];

return (
  <Morph values={values} hold={1100} duration={700} loop />
);`,
  },
  {
    id: "morph-spring",
    title: "Morph, stepped by hand",
    blurb: "A quick, springy swap driven by your own cycling index.",
    code: `const moods = ["Settled", "Bouncy", "Gentle", "Snappy"];
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
      className="preview-replay"
      onClick={() => setI((i + 1) % moods.length)}
    >
      Next mood
    </button>
  </div>
);`,
  },
  {
    id: "counter",
    title: "Counter amounts",
    blurb: "Numbers count to a new value; try switching the amount.",
    code: `const [amount, setAmount] = useState(1204);

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
          className="preview-replay"
          onClick={() => setAmount(n)}
        >
          ${"$"}{n.toLocaleString("en")}
        </button>
      ))}
    </div>
  </div>
);`,
  },
  {
    id: "reveal-marker",
    title: "Reveal + Marker",
    blurb: "Words rise in on their own beat, then a hand-drawn mark lands.",
    code: `return (
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
);`,
  },
  {
    id: "scramble",
    title: "Scramble decode",
    blurb: "A churn of glyphs settles letter by letter into the real line.",
    code: `const lines = [
  "Initiating decode sequence.",
  "Payload verified.",
  "Handshake complete.",
];
const [i, setI] = useState(0);

return (
  <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
    <Scramble text={lines[i]} trigger="prop" speed={1.4} />
    <button
      className="preview-replay"
      onClick={() => setI((i + 1) % lines.length)}
    >
      Decode next line
    </button>
  </div>
);`,
  },
  {
    id: "frame",
    title: "Frame picker",
    blurb: "A hand-drawn frame sweeps between the picked item.",
    code: `const items = ["Ship faster", "Zero deps", "SSR-safe"];
const [picked, setPicked] = useState(1);

return (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
    {items.map((t, i) => (
      <Frame
        key={t}
        show={picked === i}
        label={picked === i ? "selected" : undefined}
        duration={600}
      >
        <button
          className="preview-replay"
          style={{ padding: "10px 16px" }}
          onClick={() => setPicked(i)}
        >
          {t}
        </button>
      </Frame>
    ))}
  </div>
);`,
  },
  {
    id: "hero-ticket",
    title: "Boarding pass",
    blurb: "All three working together: scramble, morph and counter.",
    code: `const routes = ["Lahore → Karachi", "Delhi → Mumbai", "Dubai → Paris"];
const gates = ["A7", "B12", "C3"];
const [i, setI] = useState(0);

useEffect(() => {
  const id = setInterval(
    () => setI((n) => (n + 1) % routes.length),
    2200
  );
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
);`,
  },
  {
    id: "ticker",
    title: "Ticker odometer",
    blurb: "Digits roll like an odometer; the punctuation stays still.",
    code: `const prices = [499.95, 1299, 27500];
const [i, setI] = useState(0);

return (
  <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
    <span style={{ fontSize: 40, fontWeight: 700 }}>
      <Ticker
        value={prices[i]}
        prefix="$"
        decimals={i === 0 ? 2 : 0}
        duration={600}
      />
    </span>
    <button
      className="preview-replay"
      onClick={() => setI((n) => (n + 1) % prices.length)}
    >
      Change price
    </button>
  </div>
);`,
  },
  {
    id: "shimmer",
    title: "Shimmer badge",
    blurb: "A light beam sweeps the label on the compositor thread.",
    code: `return (
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
);`,
  },
  {
    id: "blur-reveal",
    title: "Blur Reveal headline",
    blurb: "Words pull into focus out of a Gaussian blur, one beat apart.",
    code: `const [run, setRun] = useState(0);

return (
  <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
    <h3 key={run} style={{ margin: 0, fontSize: 30 }}>
      <BlurReveal by="word" blur={12} stagger={70} duration={600} startOnView={false}>
        Focus, on cue.
      </BlurReveal>
    </h3>
    <button className="preview-replay" onClick={() => setRun((n) => n + 1)}>
      Replay reveal
    </button>
  </div>
);`,
  },
  {
    id: "flip-words",
    title: "Flip Words inline",
    blurb: "A 3D flip cycler that reserves the widest word — no jumps.",
    code: `return (
  <p style={{ margin: 0, fontSize: 26 }}>
    Build it{" "}
    <FlipWords
      words={["fast", "bulletproof", "accessible", "fun"]}
      duration={2200}
      direction="horizontal"
    />
    .
  </p>
);`,
  },
  {
    id: "glitch",
    title: "Glitch channel split",
    blurb: "Hover it — the RGB fraying lives in two pseudo-elements.",
    code: `return (
  <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.08em" }}>
    <Glitch
      text="STATIC//NOISE"
      trigger="hover"
      intensity="heavy"
      colors={["#38f5ff", "#ff3adc"]}
    />
  </div>
);`,
  },
  {
    id: "curved-text",
    title: "Curved Text badge",
    blurb: "SVG textPath on a circle, spun by one compositor keyframe.",
    code: `return (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <CurvedText text="HANDCRAFTED • SINCE 2026 • " radius={64} speed={10} />
  </div>
);`,
  },
  {
    id: "wave",
    title: "Wave greeting",
    blurb: "Each grapheme rides its own sine — emoji ride together.",
    code: `return (
  <h3 style={{ margin: 0, fontSize: 30, fontWeight: 600 }}>
    <Wave trigger="loop" amplitude={8} interval={80}>
      Hello there 👋
    </Wave>
  </h3>
);`,
  },
];
