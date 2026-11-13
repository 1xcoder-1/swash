import Link from "next/link";
import { HeroStage } from "@/components/hero-stage";
import { InstallTabs } from "@/components/install-tabs";
import { BentoGrid, BentoCard } from "@/components/bento";

const PRINCIPLES = [
  {
    title: "Zero dependencies",
    body: "The whole package runs on the platform: Web Animations API, ResizeObserver, Intl.Segmenter. Nothing to audit, nothing to update behind you.",
    span: 2 as const,
    icon: (
      <path
        d="M8 1.5 14 5v6L8 14.5 2 11V5l6-3.5Z"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Reduced motion is a render mode",
    body: "Every component declares a prefers-reduced-motion variant that shows the final state instantly. Toggle the OS setting mid-page and it responds, no reload.",
    span: 1 as const,
    icon: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" strokeWidth="1.4" />
        <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Grapheme-safe text",
    body: "Emoji, combining marks and RTL clusters split the way readers see them, not the way UTF-16 counts. Nothing renders half a glyph.",
    span: 1 as const,
    icon: (
      <>
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" fill="none" strokeWidth="1.4" />
        <path d="M5 7h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "SSR without the flash",
    body: "The server writes real markup, not an empty shell. Hydration matches, so there is no correction flicker and no CLS on first paint.",
    span: 1 as const,
    icon: (
      <>
        <path d="M2 12 8 2l6 10" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M5 12h6" stroke="currentColor" strokeWidth="1.4" />
      </>
    ),
  },
  {
    title: "Tree-shakes to one component",
    body: "About 83 KB of ESM for all fourteen, unminified — and an app that imports Typewriter gets Typewriter and the shared engine, nothing else.",
    span: 1 as const,
    icon: (
      <>
        <path d="M8 2v12M8 6l4-3M8 6 4 3" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Callbacks you can trust",
    body: "onDone and onLoopDone fire when they say they do, even across backgrounded tabs and re-renders — the bug class people keep reporting elsewhere.",
    span: 3 as const,
    icon: (
      <>
        <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

const COMPONENTS = [
  {
    name: "Typewriter",
    href: "/docs/typewriter",
    desc: "Types phrases one grapheme at a time, with rhythm presets and a caret that never lies about the character count.",
    span: 2 as const,
  },
  {
    name: "Frame",
    href: "/docs/frame",
    desc: "A selection frame that sweeps itself around any element, with a corner badge and imperative control.",
    span: 1 as const,
  },
  {
    name: "Reveal",
    href: "/docs/reveal",
    desc: "Words, letters or lines that rise into place on scroll, using kerning-safe ranges so nothing jumps.",
    span: 1 as const,
  },
  {
    name: "Scramble",
    href: "/docs/scramble",
    desc: "Decode-in text that churns through a charset and settles glyph by glyph, stable under every re-render.",
    span: 1 as const,
  },
  {
    name: "Morph",
    href: "/docs/morph",
    desc: "One word becomes the next with whole-grapheme transitions and width compensation mid-swap.",
    span: 1 as const,
  },
  {
    name: "Counter",
    href: "/docs/counter",
    desc: "Counts a number up when it scrolls into view. A parent re-rendering mid-count changes nothing.",
    span: 1 as const,
  },
  {
    name: "Marker",
    href: "/docs/marker",
    desc: "Hand-drawn emphasis — highlight, underline, strike, circle, box — that wraps lines and needs no Tailwind.",
    span: 2 as const,
  },
  {
    name: "Ticker",
    href: "/docs/ticker",
    desc: "Odometer digits that roll to the new value with tabular-num columns, so a price change never nudges the row.",
    span: 1 as const,
  },
  {
    name: "Shimmer",
    href: "/docs/shimmer",
    desc: "An iridescent beam that sweeps across text and pauses itself when the element scrolls off-screen.",
    span: 1 as const,
  },
  {
    name: "Blur Reveal",
    href: "/docs/blur-reveal",
    desc: "Depth-of-field entrance — words come into focus one after another with a stagger, no JavaScript per frame.",
    span: 1 as const,
  },
  {
    name: "Flip Words",
    href: "/docs/flip-words",
    desc: "A 3D cycler between rotating words that reserves the widest word's box so nothing around it shifts.",
    span: 1 as const,
  },
  {
    name: "Glitch",
    href: "/docs/glitch",
    desc: "Chromatic-aberration glitch painted through ::before and ::after, so copy/paste and screen readers see one clean phrase.",
    span: 1 as const,
  },
  {
    name: "Curved Text",
    href: "/docs/curved-text",
    desc: "Text on a circular path via native SVG <textPath>, with a compositor-driven rotation — no per-letter trigonometry.",
    span: 1 as const,
  },
  {
    name: "Wave",
    href: "/docs/wave",
    desc: "Kinetic sine-wave letters that hover, scroll or loop — one keyframe plus a per-letter negative delay, no per-frame JS.",
    span: 1 as const,
  },
];

const FAQ = [
  {
    q: "Does swash work with Next.js, Remix and Vite?",
    a: "Yes. It is plain React 18+ with a client boundary that ships compiled, so any React framework works. The docs site itself is a Next.js App Router project.",
  },
  {
    q: "Why no animation-library dependency?",
    a: "Text effects are small, specific jobs. The Web Animations API handles timing, Intl.Segmenter handles graphemes, and you keep your bundle — and your upgrade schedule — yours.",
  },
  {
    q: "What happens with prefers-reduced-motion?",
    a: "Each component has a declared reduced variant: final state rendered instantly, or the effect replaced with a static equivalent. It is subscribed live, so an OS toggle mid-session takes effect without a reload.",
  },
  {
    q: "Can I use these inside headings and other text?",
    a: "Counter and Marker render a span and add no structure, so they are safe inside a heading. The text lives in the markup first; the animation is decoration over it, never a replacement.",
  },
  {
    q: "How do I start the effects?",
    a: "Most accept startOnView to wait for the scroll, and once to decide whether they replay. Everything else has sensible defaults — the quickstart gets you to a live effect in under a minute.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We cut our animation bundle to zero and the text effects got better. The reduced-motion handling alone paid for the switch.",
    name: "Priya Nair",
    role: "Staff FE, Lumen",
  },
  {
    quote:
      "Marker wrapping lines correctly was the thing we could never get right in-house. It just works, SSR and all.",
    name: "Marco Bellini",
    role: "Design Eng, Globex",
  },
  {
    quote:
      "Dropped Counter into a marketing page, it counted up on scroll, no layout shift, no Lighthouse hit. Done in ten minutes.",
    name: "Sana Iqbal",
    role: "Frontend, Habitat",
  },
  {
    quote:
      "Tree-shakes to exactly what I import. Our first paint stopped paying for a library we barely used.",
    name: "Tomás Rivera",
    role: "Perf, Vertex",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <h1>Text that moves the way readers already do.</h1>
        <p className="sub">
          No animation library. No layout shift. Motion that always has a
          fallback.
        </p>
        <div className="hero-actions">
          <InstallTabs />
          <Link href="/docs/quickstart" className="btn btn-primary">
            Read the docs
          </Link>
        </div>

        <HeroStage />
        <div className="stage-cta">
          <a
            href="https://github.com/1xcoder-1/swash"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Try it on your codebase
          </a>
        </div>
      </section>

      <section className="section wrap" id="why">
        <div className="pr-card">
          <div className="pr-head">
            <span className="pr-avatar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <strong>swash</strong>
            <span className="pr-bot">v1.0</span>
            <span className="pr-when">zero dependencies</span>
          </div>
          <div className="pr-body">
            <div className="pr-file">npm i swash</div>
            <div className="pr-finding">
              <span className="pr-rule">14 components</span>
              <span className="pr-sev">&bull; 4.2 kB</span>
            </div>
            <div className="pr-fix">
              Typewriter, Scramble, Morph, Reveal, Counter, Frame, Marker, Ticker,
              Shimmer, Blur Reveal, Flip Words, Glitch, Curved Text and Wave
              &mdash; each tree-shaken to just what you import.
            </div>
          </div>
          <div className="pr-checks">
            <div className="pr-check">
              <span className="pr-x ok">&#10003;</span>
              <span>Safe on the server</span>
            </div>
            <div className="pr-line">Every effect ships a prefers-reduced-motion fallback.</div>
            <div className="pr-block">No provider, no config, no global CSS.</div>
          </div>
        </div>
        <div className="ci-copy">
          <h2>Drop into any React app</h2>
          <p>
            Install it, import a component, and you have motion that respects
            the platform &mdash; no provider, no config, no bundle bloat.
          </p>
          <Link href="/docs/quickstart" className="link-arrow">
            Read the quickstart &rarr;
          </Link>
        </div>
      </section>

      <section className="section wrap" id="principles">
        <div className="section-head">
          <p className="eyebrow">Engineering principles</p>
          <h2>Built on the platform, not a bundle</h2>
          <p>
            Six decisions that make these components safe to put in production.
          </p>
        </div>
        <BentoGrid>
          {PRINCIPLES.map((p) => (
            <BentoCard key={p.title} span={p.span}>
              <div className="bento-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  {p.icon}
                </svg>
              </div>
              <h3 className="bento-title">{p.title}</h3>
              <p className="bento-desc">{p.body}</p>
            </BentoCard>
          ))}
        </BentoGrid>
      </section>

      <section className="section wrap" id="components">
        <div className="section-head">
          <p className="eyebrow">The catalogue</p>
          <h2>Fourteen components, one engine</h2>
          <p>
            Each one solves a text problem developers keep re-solving badly.
            Open any row for the full API.
          </p>
        </div>
        <div className="catalog">
          <div className="catalog-head" aria-hidden>
            <span>Component</span>
            <span>What it does</span>
            <span>Docs</span>
          </div>
          {COMPONENTS.map((c, i) => (
            <Link className="catalog-row" href={c.href} key={c.name}>
              <span className="catalog-name">
                <span className="catalog-idx">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {c.name}
              </span>
              <span className="catalog-desc">{c.desc}</span>
              <span className="catalog-docs">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M5 11 11 5M6 5h5v5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section wrap" id="praise">
        <div className="section-head">
          <p className="eyebrow">In the wild</p>
          <h2>Teams that stopped re-solving text</h2>
        </div>
        <div className="tst-masonry">
          {TESTIMONIALS.map((t) => (
            <figure className="tst" key={t.name}>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className="tst-name">{t.name}</span>
                <span className="tst-role">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section wrap faq" id="faq">
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2>Questions worth asking</h2>
        </div>
        <div className="faq-list">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>
                <span>{item.q}</span>
                <span className="faq-plus" aria-hidden />
              </summary>
              <div className="faq-body">
                <p className="answer">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="cta wrap">
        <h2>Ship the effect, not the yak shave</h2>
        <p>One install, fourteen components, zero dependencies.</p>
        <div className="hero-actions">
          <Link href="/docs/quickstart" className="btn btn-primary">
            Start with the quickstart
          </Link>
          <a
            className="btn btn-ghost"
            href="https://github.com/1xcoder-1/swash"
            target="_blank"
            rel="noreferrer"
          >
            Star on GitHub
          </a>
        </div>
      </section>
    </>
  );
}
