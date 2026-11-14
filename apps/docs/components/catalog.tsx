"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {
  Counter,
  CurvedText,
  Echo,
  FlipWords,
  Frame,
  Glitch,
  Marker,
  Morph,
  Neon,
  Reveal,
  Scramble,
  Shimmer,
  Slice,
  SplitFlap,
  Ticker,
  Typewriter,
  Wave,
} from "swash";

export interface CatalogItem {
  name: string;
  href: string;
  desc: string;
}

/**
 * Mount the preview once the card is near the viewport. Before that the
 * stage holds the component name only, so a page load never starts
 * seventeen animations at once; after it, the effect keeps looping like
 * every other ambient motion on the page.
 */
function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver !== "function") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "480px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return { ref, near };
}

/** Cycle an index while the preview is alive. */
function useCycle(length: number, ms: number): number {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms]);
  return i;
}

/* One tiny stage per component: the component itself, quiet and small,
   running on the page's own palette. Hover-triggered effects stay still
   until the pointer arrives — the card invites the interaction. */
const STAGES: Record<string, React.ComponentType> = {
  Typewriter: () => (
    <Typewriter loop={["Types itself.", "Grapheme-safe."]} feel="snappy" />
  ),
  Frame: () => (
    <Frame show label="sel" duration={900}>
      <span className="cp-chip">selected</span>
    </Frame>
  ),
  Reveal: () => (
    <Reveal by="word" stagger={70} duration={520}>
      Rises into place.
    </Reveal>
  ),
  Scramble: () => <Scramble text="Decodes in, settles." />,
  Morph: () => (
    <Morph values={["Direct", "Processing", "Done"]} hold={1000} duration={600} loop />
  ),
  Counter: () => (
    <Counter to={98.4} suffix="%" format={(n) => n.toFixed(1)} duration={1400} />
  ),
  Marker: () => (
    <span className="cp-sentence">
      Ship it <Marker action="highlight" color="amber" show>today</Marker>
    </span>
  ),
  Ticker: () => <TickerStage />,
  Shimmer: () => (
    <Shimmer spread={150} duration={2600} color="rgba(255,255,255,0.9)" baseColor="#7a7a94">
      Iridescent beam
    </Shimmer>
  ),
  "Flip Words": () => (
    <span className="cp-sentence">
      Make it{" "}
      <FlipWords
        words={["fast", "bulletproof", "accessible"]}
        duration={2000}
        direction="vertical"
      />
    </span>
  ),
  Glitch: () => (
    <Glitch
      text="REBOOT"
      trigger="hover"
      intensity="medium"
      colors={["#00ffff", "#ff00ff"]}
    />
  ),
  "Curved Text": () => (
    <CurvedText text="EXPLORE • SWASH • SCROLL • " radius={40} speed={14} />
  ),
  Wave: () => (
    <Wave amplitude={9} interval={90} trigger="hover">
      Catch the wave
    </Wave>
  ),
  Neon: () => (
    <span className="cp-neon">
      <Neon text="OPEN" color="cyan" flicker="soft" />
    </span>
  ),
  "Split Flap": () => <SplitFlapStage />,
  Echo: () => (
    <Echo count={3} delay={340} trigger="hover">
      Signal
    </Echo>
  ),
  Slice: () => <Slice text="Divided" trigger="loop" hold={1300} amount={12} />,
};

const TICKER_VALUES = [1299, 27500, 499.95, 99.9];

function TickerStage() {
  const i = useCycle(TICKER_VALUES.length, 2000);
  return (
    <span className="cp-amount">
      <Ticker
        value={TICKER_VALUES[i]}
        prefix="$"
        duration={600}
        stagger={40}
        decimals={i === 2 || i === 3 ? 2 : 0}
        separator=","
      />
    </span>
  );
}

const FLIGHTS = ["BOARDING", "DELAYED", "DEPARTED"];

function SplitFlapStage() {
  const i = useCycle(FLIGHTS.length, 2400);
  return (
    <span className="cp-flap">
      <SplitFlap text={FLIGHTS[i]} interval={80} />
    </span>
  );
}

export function Catalog({ items }: { items: CatalogItem[] }) {
  return (
    <div className="catalog-grid">
      {items.map((c, i) => (
        <Card key={c.name} item={c} index={i} />
      ))}
    </div>
  );
}

function Card({ item, index }: { item: CatalogItem; index: number }) {
  const { ref, near } = useNearViewport<HTMLAnchorElement>();
  const Stage = STAGES[item.name];
  return (
    <Link ref={ref} className="catalog-card" href={item.href}>
      <span className="catalog-stage" aria-hidden>
        {near && Stage ? <Stage /> : null}
      </span>
      <span className="catalog-body">
        <span className="catalog-card-top">
          <span className="catalog-name">
            <span className="catalog-idx">
              {String(index + 1).padStart(2, "0")}
            </span>
            {item.name}
          </span>
          <span className="catalog-docs">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M5 11 11 5M6 5h5v5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
        <span className="catalog-desc">{item.desc}</span>
      </span>
    </Link>
  );
}
