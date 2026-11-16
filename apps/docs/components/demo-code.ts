/**
 * The source snippet behind each demo, keyed by the exact `label` the demo
 * passes to <Preview>. The Preview panel's Code tab looks its snippet up
 * here, so adding a demo only means adding one entry — no prop drilling.
 */
export const DEMO_CODE: Record<string, string> = {
  "Typewriter loop + feel": `<Typewriter
  loop={[
    "Your Weekly Report Is Ready.",
    "Graphemes, Not Code Units.",
    "Reduced Motion Prints It All At Once.",
  ]}
  feel="snappy"
/>`,
  "Typewriter text + onDone": `<Typewriter
  text="One Phrase, Typed Once."
  onDone={() => setDone(true)}
/>`,
  "Typewriter feel presets": `<Typewriter loop={["The Same Line."]} feel="cinematic" />
<Typewriter loop={["The Same Line."]} feel="snappy" />
<Typewriter loop={["The Same Line."]} feel="playful" />`,
  "Frame with label and sweep": `<Frame show label="selected" duration={900}>
  <span>Every Element Gets A Frame.</span>
</Frame>`,
  "Frame controlled by show": `<Frame show={show} label="selected" duration={700}>
  <span>Toggles Without Remounting.</span>
</Frame>`,
  "Frame color, radius and width": `<Frame show color="#e0b341" radius={16} duration={800}>
  <span>Amber, Round</span>
</Frame>
<Frame show color="var(--color-accent)" width={3} radius={4} duration={800}>
  <span>Blue, Sharp</span>
</Frame>`,
  "Reveal by word, then by letter": `<Reveal by="word" stagger={70}>
  Words Arrive One After Another.
</Reveal>
<Reveal by="letter" stagger={28}>Letters Can, Too.</Reveal>`,
  "Reveal by line": `<Reveal by="line" stagger={160} duration={600}>
  Lines Rise One After Another. Each Full Line Is One Piece Of The
  Animation, Wherever It Wrapped.
</Reveal>`,
  "Reveal fade, y=0": `<Reveal by="fade" stagger={45} y={0}>
  Words Fade In Where They Stand — Nothing Moves Up From Below.
</Reveal>`,
  "Scramble trigger=prop": `const [i, setI] = useState(0);

<Scramble text={TARGETS[i]} trigger="prop" />
<button onClick={() => setI((n) => (n + 1) % TARGETS.length)}>
  Next Line
</button>`,
  "Scramble trigger=click": `<Scramble text="Click The Line To Re-Decode It." trigger="click" />`,
  "Scramble custom charset": `<Scramble
  text={GLYPH_LINES[i]}
  trigger="prop"
  charset="▚▞░▒▓█01"
  speed={2.2}
/>`,
  "Morph — continuous cycling, width-compensated": `<Morph
  values={["Direct", "Transaction", "Processing", "Copy", "Be There Soon"]}
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
  The Launch Was{" "}
  <Marker action="highlight" color="amber" show>A Success</Marker>{" "}
  And{" "}
  <Marker action="highlight" color="emerald" show delay={400}>
    Everyone Came Back
  </Marker>{" "}
  The Next Week.
</p>`,
  "Marker underline and strike": `<p>
  We{" "}
  <Marker action="underline" color="sky" show>Shipped On Friday</Marker>{" "}
  And{" "}
  <Marker action="strike" color="rose" show delay={400}>
    Dropped The Cron Job
  </Marker>{" "}
  Right After.
</p>`,
  "Marker circle and box": `<p>
  Circle The{" "}
  <Marker action="circle" color="violet" show>Deadline</Marker>{" "}
  And Box The{" "}
  <Marker action="box" color="primary" show delay={400}>
    Ship Date
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
<button onClick={() => setI((n) => (n + 1) % TICKER_VALUES.length)}>
  Change Value
</button>`,
      "Glitch — hover to fire, ::before / ::after only": `<div style={{ fontSize: "1.75rem", fontWeight: 500, letterSpacing: "0.06em" }}>
  <Glitch
    text="SYSTEM REBOOT"
    trigger="hover"
    intensity="medium"
    colors={["#00ffff", "#ff00ff"]}
  />
</div>`,
    "Wave — grapheme-safe, per-letter CSS delay": `<div style={{ fontSize: "1.5rem", fontWeight: 500 }}>
  <Wave amplitude={10} interval={90} trigger="hover">
    Catch The Momentum
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
  Roll A New Value
</button>
<span aria-live="polite">{landed ? "Landed" : "Rolling…"}</span>`,
  "Ticker — up, down and auto": `const [value, setValue] = useState(4729);

<Ticker value={value} direction="up" duration={700} />
<Ticker value={value} direction="down" duration={700} />
<Ticker value={value} direction="auto" duration={700} />
<button onClick={() => setValue(Math.round(Math.random() * 9000) + 500)}>
  Roll A New Value
</button>`,
  "Glitch — always on, subtle": `<Glitch text="OUT OF ORDER" trigger="always" intensity="subtle" />`,
  "Glitch — fires on scroll": `<Glitch
  text="SIGNAL LOST"
  trigger="scroll"
  intensity="medium"
  colors={["#ffd166", "#ef476f"]}
/>`,
      "Wave — endless loop": `<Wave trigger="loop" amplitude={6} interval={70} duration={1000}>
  Never Standing Still
</Wave>`,
  "Wave — rises on view": `<Wave trigger="view" amplitude={12} interval={110}>
  Good Morning
</Wave>`,
  "Neon — tube and flicker": `<span style={{ fontSize: "2.2rem", fontWeight: 500 }}>
  <Neon text="OPEN ALL NIGHT" color="magenta" flicker="soft" />
</span>`,
  "Neon — tube inks": `<Neon text="LAST CALL" color="cyan" flicker="none" />
<Neon text="LAST CALL" color="magenta" flicker="none" />
<Neon text="LAST CALL" color="lime" flicker="none" />
<Neon text="LAST CALL" color="amber" flicker="none" />`,
  "Neon — flicker presets": `<Neon text="NEON BAR" color="violet" flicker="none" />
<Neon text="NEON BAR" color="violet" flicker="soft" />
<Neon text="NEON BAR" color="violet" flicker="hard" />`,
  "Neon — lights on hover": `<span style={{ fontSize: "1.8rem", fontWeight: 500 }}>
  <Neon text="VACANCY" color="amber" flicker="none" trigger="hover" />
</span>`,
  "Echo — a trail under the text": `<div style={{ fontSize: "1.9rem", fontWeight: 500 }}>
  <Echo count={4} delay={420} spread={1.3} trigger="always">SIGNAL</Echo>
</div>`,
  "Echo — trail depth": `<Echo count={1} delay={600} trigger="always">Ping</Echo>
<Echo count={3} delay={420} trigger="always">Ping</Echo>
<Echo count={6} delay={300} trigger="always">Ping</Echo>`,
  "Echo — pulses on hover": `<div style={{ fontSize: "1.6rem", fontWeight: 500 }}>
  <Echo count={3} delay={300} duration={1200} trigger="hover">Hover Me</Echo>
</div>`,
  "Echo — wider ripple on view": `<Echo
  count={5}
  delay={340}
  duration={1400}
  spread={1.5}
  color="var(--color-accent)"
  trigger="view"
>
  You Have Mail
</Echo>`,
  "Slice — the seam opens and closes": `<div style={{ fontSize: "2rem", fontWeight: 500 }}>
  <Slice text="DIVIDED" trigger="loop" hold={1300} amount={18} />
</div>`,
  "Slice — slide distance": `<Slice text="Narrow" amount={6} />
<Slice text="Middle" />
<Slice text="Widest" amount={32} />`,
  "Slice — parts on hover": `<div style={{ fontSize: "1.6rem", fontWeight: 500 }}>
  <Slice text="Bisect" trigger="hover" amount={12} />
</div>`,
  "Slice — parts on view": `<Slice text="Sever" trigger="view" amount={26} duration={620} />`,
  "Split Flap — the board turns over": `<span style={{ fontFamily: "var(--font-mono)", fontSize: "1.9rem", fontWeight: 500, letterSpacing: "0.06em" }}>
  <SplitFlap text={status} interval={90} />
</span>`,
  "Split Flap — a clock of tiles": `const i = useCycle(DEPARTS.length, 2600, !reduced);

<SplitFlap text={DEPARTS[i]} charset="0123456789" interval={70} />`,
  "Split Flap — flip speed": `{[["fast", 45], ["slow", 160]].map(([label, interval]) => (
  <SplitFlap key={label} text={gate} interval={interval} />
))}`,
  "Split Flap — onDone when the board settles": `const [i, setI] = useState(0);
const [settled, setSettled] = useState(true);

<SplitFlap
  text={CALLS[i]}
  interval={80}
  onDone={() => setSettled(true)}
/>
<button
  disabled={!settled}
  onClick={() => {
    setSettled(false);
    setI((n) => (n + 1) % CALLS.length);
  }}
>
  Flip A New Line
</button>`
};
