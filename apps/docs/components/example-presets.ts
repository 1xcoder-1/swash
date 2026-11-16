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
      "Typed Character By Character.",
      "Graphemes, Not Code Units.",
      "Edit This And Watch It Change.",
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
      style={{ fontSize: 34, fontWeight: 500 }}
    />
    <button
      className="preview-replay"
      onClick={() => setI((i + 1) % moods.length)}
    >
      Next Mood
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
      style={{ fontSize: 34, fontWeight: 500 }}
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
);`,
  },
  {
    id: "scramble",
    title: "Scramble decode",
    blurb: "A churn of glyphs settles letter by letter into the real line.",
    code: `const lines = [
  "Initiating Decode Sequence.",
  "Payload Verified.",
  "Handshake Complete.",
];
const [i, setI] = useState(0);

return (
  <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
    <Scramble text={lines[i]} trigger="prop" speed={1.4} />
    <button
      className="preview-replay"
      onClick={() => setI((i + 1) % lines.length)}
    >
      Decode Next Line
    </button>
  </div>
);`,
  },
  {
    id: "frame",
    title: "Frame picker",
    blurb: "A hand-drawn frame sweeps between the picked item.",
    code: `const items = ["Ship Faster", "Zero Deps", "SSR-Safe"];
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
    code: `const routes = ["LAHORE → KARACHI", "DELHI → MUMBAI", "DUBAI → PARIS"];
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
    <span style={{ fontSize: 28, fontWeight: 500 }}>
      <Morph values={routes} hold={1600} duration={700} loop={false} step={i} />
    </span>
    <span style={{ fontSize: 15, color: "var(--color-muted)" }}>
      GATE <Morph values={gates} loop={false} step={i} duration={500} /> · SEAT{" "}
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
    <span style={{ fontSize: 40, fontWeight: 500 }}>
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
      Change Price
    </button>
  </div>
);`,
  },
  {
    id: "reveal-blur",
    title: "Reveal, blurred",
    blurb: "Words pull into focus out of a Gaussian blur, one beat apart.",
    code: `const [run, setRun] = useState(0);

return (
  <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
    <h3 key={run} style={{ margin: 0, fontSize: 30 }}>
      <Reveal by="word" effect="blur" blur={12} stagger={70} duration={600} startOnView={false}>
        Focus, On Cue.
      </Reveal>
    </h3>
    <button className="preview-replay" onClick={() => setRun((n) => (n + 1) % 1)}>
      Replay Reveal
    </button>
  </div>
);`,
  },
  {
    id: "glitch",
    title: "Glitch channel split",
    blurb: "Hover it — the RGB fraying lives in two pseudo-elements.",
    code: `return (
  <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "0.08em" }}>
    <Glitch
      text="CARRIER LOST"
      trigger="hover"
      intensity="heavy"
      colors={["#38f5ff", "#ff3adc"]}
    />
  </div>
);`,
  },
  {
    id: "wave",
    title: "Wave greeting",
    blurb: "Each grapheme rides its own sine, letter by letter.",
    code: `return (
  <h3 style={{ margin: 0, fontSize: 30, fontWeight: 500 }}>
    <Wave trigger="loop" amplitude={8} interval={80}>
      Hello There 👋
    </Wave>
  </h3>
);`,
  },
  {
    id: "neon",
    title: "Neon sign",
    blurb: "A tube and its glow from one ink; the flicker never touches the letters.",
    code: `return (
  <div style={{ fontSize: 34, fontWeight: 500 }}>
    <Neon text="OPEN ALL NIGHT" color="magenta" flicker="soft" />
  </div>
);`,
  },
  {
    id: "split-flap",
    title: "Split Flap board",
    blurb: "Every differing cell flips onto its character, left to right.",
    code: `const flights = ["DELAYED", "BOARDING", "DEPARTED", "ON TIME"];
const [i, setI] = useState(0);

return (
  <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
    <SplitFlap text={flights[i]} interval={90} />
    <button className="preview-replay" onClick={() => setI((n) => (n + 1) % flights.length)}>
      Next Status
    </button>
  </div>
);`,
  },
  {
    id: "echo",
    title: "Echo pulse",
    blurb: "Copies expand out from under still text and fade, one travelling pulse.",
    code: `return (
  <div style={{ fontSize: 32, fontWeight: 500 }}>
    <Echo count={4} delay={420} spread={1.3} trigger="always">SIGNAL</Echo>
  </div>
);`,
  },
  {
    id: "slice",
    title: "Slice",
    blurb: "The phrase cut along its middle; the halves part and come back.",
    code: `return (
  <div style={{ fontSize: 34, fontWeight: 500 }}>
    <Slice text="DIVIDED" trigger="loop" hold={1300} amount={18} />
  </div>
);`,
  },
];