import Link from "next/link";
import { HeroStage } from "@/components/hero-stage";
import { InstallTabs } from "@/components/install-tabs";
import { BentoGrid, BentoCard } from "@/components/bento";
import { PromptButton } from "@/components/prompt-button";
import { HeroCopy } from "@/components/hero-copy";
import { Catalog, type CatalogItem } from "@/components/catalog";

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
    body: "About 98 KB of ESM for all fourteen, unminified — and an app that imports Typewriter gets Typewriter and the shared engine, nothing else.",
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

// Four cells are wide ("lg"); the rest are normal — even spans only, so
// the 6-column bento always packs without holes.
const COMPONENTS = [
  { name: "Typewriter", href: "/docs/typewriter", size: "lg" as const },
  { name: "Frame", href: "/docs/frame" },
  { name: "Reveal", href: "/docs/reveal" },
  { name: "Scramble", href: "/docs/scramble" },
  { name: "Morph", href: "/docs/morph" },
  { name: "Counter", href: "/docs/counter" },
  { name: "Marker", href: "/docs/marker", size: "lg" as const },
  { name: "Ticker", href: "/docs/ticker" },
  { name: "Glitch", href: "/docs/glitch", size: "lg" as const },
  { name: "Wave", href: "/docs/wave" },
  { name: "Neon", href: "/docs/neon", size: "lg" as const },
  { name: "Split Flap", href: "/docs/split-flap" },
  { name: "Echo", href: "/docs/echo" },
  { name: "Slice", href: "/docs/slice" },
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
        <HeroCopy />
        <div className="hero-actions">
          <InstallTabs />
          <PromptButton href="/docs/quickstart">Read the docs</PromptButton>
        </div>

        <HeroStage />
        <div className="stage-cta">
          <PromptButton href="https://github.com/1xcoder-1/swash" external>
            Try it on your codebase
          </PromptButton>
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
            <div className="pr-file">npm i react-swash</div>
            <div className="pr-finding">
              <span className="pr-rule">11 components</span>
              <span className="pr-sev">&bull; 4.2 kB</span>
            </div>
            <div className="pr-fix">
              Typewriter, Scramble, Morph, Reveal, Counter, Frame, Marker, Ticker,
              Blur Reveal, Glitch,and Wave
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
          <h2>Seventeen components, one engine</h2>
          <p>
            Pick a name, open its docs — every page has live examples,
            props and copy-paste code. One engine underneath: zero
            dependencies, reduced motion built in.
          </p>
        </div>
        <Catalog items={COMPONENTS as CatalogItem[]} />
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
          <PromptButton href="/docs/quickstart">
            Start with the quickstart
          </PromptButton>
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
