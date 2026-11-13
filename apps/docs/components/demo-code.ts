/**
 * The source snippet behind each demo, keyed by the exact `label` the demo
 * passes to <Preview>. The Preview panel's Code tab looks its snippet up
 * here, so adding a demo only means adding one entry — no prop drilling.
 */
export const DEMO_CODE: Record<string, string> = {
  "Typewriter loop + feel": `<Typewriter
  loop={[
    "The quick brown fox.",
    "Graphemes, not code units. 🦊👩‍👩‍👧‍👦",
    "Reduced motion prints it all at once.",
  ]}
  feel="snappy"
/>`,
  "Typewriter text + onDone": `<Typewriter
  text="One phrase, typed once."
  onDone={() => setDone(true)}
/>`,
  "Typewriter feel presets": `<Typewriter loop={["The same line."]} feel="cinematic" />
<Typewriter loop={["The same line."]} feel="snappy" />
<Typewriter loop={["The same line."]} feel="playful" />`,
  "Frame with label and sweep": `<Frame show label="selected" duration={900}>
  <span>Any element gets the frame.</span>
</Frame>`,
  "Frame controlled by show": `<Frame show={show} label="selected" duration={700}>
  <span>Toggles without remounting.</span>
</Frame>`,
  "Frame color, radius and width": `<Frame show color="#e0b341" radius={16} duration={800}>
  <span>Amber, round</span>
</Frame>
<Frame show color="var(--color-accent)" width={3} radius={4} duration={800}>
  <span>Blue, sharp</span>
</Frame>`,
  "Reveal by word, then by letter": `<Reveal by="word" stagger={70}>
  Words arrive one after another.
</Reveal>
<Reveal by="letter" stagger={28}>Letters can, too.</Reveal>`,
  "Reveal by line": `<Reveal by="line" stagger={160} duration={600}>
  Lines rise one after another. Each full line is one piece of the
  animation, wherever it wrapped.
</Reveal>`,
  "Reveal fade, y=0": `<Reveal by="fade" stagger={45} y={0}>
  Words fade in where they stand — nothing moves up from below.
</Reveal>`,
  "Scramble trigger=prop": `const [i, setI] = useState(0);

<Scramble text={TARGETS[i]} trigger="prop" />
<button onClick={() => setI((n) => (n + 1) % TARGETS.length)}>
  Next line
</button>`,
  "Scramble trigger=click": `<Scramble text="Click the line to re-decode it." trigger="click" />`,
  "Scramble custom charset": `<Scramble
  text={GLYPH_LINES[i]}
  trigger="prop"
  charset="▚▞░▒▓█01"
  speed={2.2}
/>`,
  "Morph — continuous cycling, width-compensated": `<Morph
  values={["Direct", "Transaction", "Processing", "Copy", "Be there soon"]}
  hold={1100}
  duration={700}
  loop
/>`,
  "Morph controlled by step": `const [i, setI] = useState(0);

<Morph values={["Ready", "Building", "Shipped"]} loop={false} step={i} duration={600} />
<button onClick={() => setI(0)}>Ready</button>
<button onClick={() => setI(1)}>Building</button>
<button onClick={() => setI(2)}>Shipped</button>`,
  "Counter with prefix, suffix and format": `<Counter to={12450} prefix="$" duration={1800} startOnView={false} />

<Counter
  to={98.4}
  suffix="%"
  format={(n) => n.toFixed(1)}
  duration={1400}
  startOnView={false}
/>

<Counter
  to={214}
  format={(n) => \`\${Math.floor(n / 60)}m \${String(Math.round(n % 60)).padStart(2, "0")}s\`}
  duration={1200}
  startOnView={false}
/>`,
  "Counter from and to": `<Counter
  to={base * 2}
  from={base}
  startOnView={false}
  duration={1200}
/>`,
  "Marker highlight, two inks": `<p>
  The launch was{" "}
  <Marker action="highlight" color="amber" show>a success</Marker>{" "}
  and{" "}
  <Marker action="highlight" color="emerald" show delay={400}>
    everyone came back
  </Marker>{" "}
  the next week.
</p>`,
  "Marker underline and strike": `<p>
  We{" "}
  <Marker action="underline" color="sky" show>shipped on Friday</Marker>{" "}
  and{" "}
  <Marker action="strike" color="rose" show delay={400}>
    dropped the cron job
  </Marker>{" "}
  right after.
</p>`,
  "Marker circle and box": `<p>
  Circle the{" "}
  <Marker action="circle" color="violet" show>deadline</Marker>{" "}
  and box the{" "}
  <Marker action="box" color="primary" show delay={400}>
    ship date
  </Marker>
</p>`,
  "Morph — shared characters stay put": `const reduced = useReducedMotion();
const i = useCycle(PHRASES.length, 2400, !reduced);

<Morph values={PHRASES} loop={false} step={i} duration={600} />`,
  "Morph — rewrite without a layout jump": `const reduced = useReducedMotion();
const i = useCycle(TONES.length, 2600, !reduced);

<Morph values={TONES.map((t) => t[1])} loop={false} step={i} duration={600} />
<Morph values={TONES.map((t) => t[0])} loop={false} step={i} duration={500} />`,
  "Morph — a quick, springy swap": `const reduced = useReducedMotion();
const i = useCycle(SPRING_WORDS.length, 1400, !reduced);

<Morph values={SPRING_WORDS} loop={false} step={i} duration={450} />`,
  "Morph — digits change in place": `const reduced = useReducedMotion();
const i = useCycle(AMOUNTS.length, 1600, !reduced);

<span className="demo-amount">
  <span className="demo-prefix">$</span>
  <Morph values={AMOUNTS} loop={false} step={i} duration={600} />
</span>`,
  "Morph — rewrites as you type": `const [pair, setPair] = useState({ prev: "420", next: "420" });
const onChange = (next: string) => setPair((p) => ({ prev: p.next, next }));

<input
  className="demo-input"
  inputMode="decimal"
  value={pair.next}
  onChange={(e) => onChange(e.target.value)}
  aria-label="Amount"
/>
<Morph values={[pair.prev, pair.next]} loop={false} step={1} duration={400} />`,
  "Ticker — rolling digits, static punctuation": `const [i, setI] = useState(0);

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
<button onClick={() => setI((n) => (n + 1) % TICKER_VALUES.length)}>
  Change value
</button>`,
  "Shimmer — compositor-thread light beam": `<div style={{ background: "#0b0b12", padding: "24px 28px", borderRadius: 12 }}>
  <Shimmer
    spread={220}
    duration={2400}
    color="rgba(255,255,255,0.9)"
    baseColor="#7a7a94"
  >
    Powered by next-gen AI
  </Shimmer>
</div>`,
  "Blur Reveal — word-safe grouping, no kerning loss": `<div style={{ fontSize: "1.25rem", lineHeight: 1.6 }}>
  <BlurReveal by="word" blur={10} stagger={60} duration={500}>
    Intelligence designed for every scale.
  </BlurReveal>
</div>`,
  "Flip Words — 3D flip with reserved box": `<div style={{ fontSize: "1.5rem" }}>
  Make it{" "}
  <FlipWords
    words={["ultra-fast", "bulletproof", "accessible", "production-ready"]}
    duration={2200}
    preserveSpace
    direction="vertical"
  />
  .
</div>`,
  "Glitch — hover to fire, ::before / ::after only": `<div style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "0.06em" }}>
  <Glitch
    text="SYSTEM REBOOT"
    trigger="hover"
    intensity="medium"
    colors={["#00ffff", "#ff00ff"]}
  />
</div>`,
  "Curved Text — SVG textPath, compositor rotate": `<div style={{ display: "flex", justifyContent: "center" }}>
  <CurvedText
    text="EXPLORE THE SYSTEM • SCROLL DOWN • 2026 • "
    radius={72}
    speed={12}
  />
</div>`,
  "Wave — grapheme-safe, per-letter CSS delay": `<div style={{ fontSize: "1.5rem", fontWeight: 500 }}>
  <Wave amplitude={10} interval={90} trigger="hover">
    Catch the momentum 👩‍👩‍👧‍👦
  </Wave>
</div>`,
  "Ticker — live stats row": `const i = useCycle(STAT_SERIES.length, 2400, true);
const s = STAT_SERIES[i];

<Ticker value={s.uptime} decimals={2} suffix="%" duration={500} />
<Ticker value={s.requests} duration={600} />
<Ticker value={s.latency} duration={450} />`,
  "Ticker — onDone when the digits land": `const [value, setValue] = useState(1024);
const [landed, setLanded] = useState(true);

<span style={{ fontSize: "2rem" }}>
  <Ticker value={value} duration={700} onDone={() => setLanded(true)} />
</span>
<button
  onClick={() => {
    setLanded(false);
    setValue(Math.round(Math.random() * 9000) + 500);
  }}
>
  Roll a new value
</button>
<span aria-live="polite">{landed ? "landed" : "rolling…"}</span>`,
  "Shimmer — loading lines": `const lines = [
  "Fetching your weekly report…",
  "Crunching 12,481 events",
  "Almost there",
];

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
))}`,
  "Shimmer — lit badge": `<span style={{ borderRadius: 999, padding: "9px 20px" }}>
  <Shimmer spread={90} duration={1800} baseColor="#c9a227" color="#fff3b0">
    ✦ Premium tier
  </Shimmer>
</span>`,
  "Blur Reveal — by line, hero copy": `<h3 key={run}>
  <BlurReveal by="line" blur={14} stagger={140} duration={700} startOnView={false}>
    {"Motion that means something.\\nEvery line finds its place."}
  </BlurReveal>
</h3>
<button onClick={() => setRun((n) => n + 1)}>Replay lines</button>`,
  "Blur Reveal — by char, short title": `<p key={run} style={{ fontSize: "1.8rem", fontWeight: 600 }}>
  <BlurReveal by="char" blur={8} stagger={28} duration={450} startOnView={false}>
    Set in motion.
  </BlurReveal>
</p>
<button onClick={() => setRun((n) => n + 1)}>Replay letters</button>`,
  "Flip Words — horizontal, breathing width": `<div style={{ fontSize: "1.5rem" }}>
  A cache of <em>some</em> size — actually{" "}
  <FlipWords
    words={["tiny", "compact", "capacious", "enormous"]}
    duration={2000}
    preserveSpace={false}
    direction="horizontal"
  />
  .
</div>`,
  "Flip Words — start at your index": `<div style={{ fontSize: "1.4rem" }}>
  Our promise:{" "}
  <FlipWords
    words={["quiet", "steady", "fast", "kind"]}
    duration={3200}
    startAtIndex={2}
  />
  .
</div>`,
  "Glitch — always on, subtle": `<Glitch text="OUT OF ORDER" trigger="always" intensity="subtle" />`,
  "Glitch — fires on scroll": `<Glitch
  text="SIGNAL LOST"
  trigger="scroll"
  intensity="medium"
  colors={["#ffd166", "#ef476f"]}
/>`,
  "Curved Text — reverse, wide spacing": `<CurvedText
  text="AROUND WE GO • SLOWLY • "
  radius={64}
  speed={8}
  reverse
  spacing={2}
/>`,
  "Curved Text — compact sticker": `<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
  <CurvedText text="NEW DROP • 2026 • " radius={34} speed={5} />
  <span>It spins on the compositor — one keyframe, no JavaScript per frame.</span>
</div>`,
  "Wave — endless loop": `<Wave trigger="loop" amplitude={6} interval={70} duration={1000}>
  Never standing still
</Wave>`,
  "Wave — rises on view": `<Wave trigger="view" amplitude={12} interval={110}>
  Good morning ☀️
</Wave>`,
};
