"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Counter,
  Marker,
  Neon,
  Reveal,
  Scramble,
} from "swash";

export interface CatalogItem {
  name: string;
  href: string;
}

/**
 * The catalogue as a type-specimen sheet, after the foundries: each card
 * carries nothing but the component's own name, set in that component's
 * effect, on the page's own palette. The type is the demo — no stages,
 * no paragraphs. Entrance effects (Reveal, Scramble, Counter) fire once
 * off their own view observers; ambient effects are pure CSS and cost
 * almost nothing; reduced motion gets every effect frozen mid-state.
 */
const SPECIMENS: Record<string, ReactNode> = {
  Typewriter: (
    <>
      Typewriter<span className="cp-caret" />
    </>
  ),
  Frame: <span className="cp-frame">Frame</span>,
  Reveal: <Reveal by="letter" stagger={26} duration={520}>Reveal</Reveal>,
  Scramble: <Scramble text="Scramble" trigger="view" />,
  Morph: (
    <span className="cp-morph">
      M
      <span className="cp-roll">
        <span>o</span>
        <span>a</span>
      </span>
      rph
    </span>
  ),
  Counter: <Counter to={17} format={(n) => String(n).padStart(2, "0")} duration={1200} />,
  Marker: (
    <Marker action="highlight" color="amber" show>
      Marker
    </Marker>
  ),
  Ticker: (
    <span className="cp-ticker">
      <span className="cp-roll">
        <span>2</span>
        <span>7</span>
      </span>
    </span>
  ),
  Shimmer: <span className="cp-shimmer">Shimmer</span>,
  "Flip Words": (
    <span className="cp-flip-words">
      Flip&nbsp;<span className="cp-flip-word">Words</span>
    </span>
  ),
  Glitch: <span className="cp-glitch">Glitch</span>,
  "Curved Text": (
    <svg className="cp-curved" viewBox="0 0 80 80" width="76" height="76" aria-hidden>
      <defs>
        <path id="cp-arc" d="M 40 12 A 28 28 0 1 1 39.99 12" />
      </defs>
      <g className="cp-curved-spin">
        <text>
          <textPath href="#cp-arc" startOffset="0">
            Curved Text • Curved Text •
          </textPath>
        </text>
      </g>
    </svg>
  ),
  Wave: (
    <span className="cp-wave" aria-hidden>
      <span style={{ "--dy": "-5px" } as React.CSSProperties}>W</span>
      <span style={{ "--dy": "4px" } as React.CSSProperties}>a</span>
      <span style={{ "--dy": "-3px" } as React.CSSProperties}>v</span>
      <span style={{ "--dy": "5px" } as React.CSSProperties}>e</span>
    </span>
  ),
  Neon: (
    <span className="cp-neon">
      <Neon text="Neon" color="cyan" flicker="soft" />
    </span>
  ),
  "Split Flap": (
    <span className="cp-flap" aria-hidden>
      {"Split Flap".split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} className="cp-flap-gap" />
        ) : (
          <span key={i} className="cp-tile">
            {ch}
          </span>
        ),
      )}
    </span>
  ),
  Echo: <span className="cp-echo">Echo</span>,
  Slice: (
    <span className="cp-slice" data-text="Slice">
      Slice
    </span>
  ),
};

export function Catalog({ items }: { items: CatalogItem[] }) {
  return (
    <div className="catalog-grid">
      {items.map((c, i) => (
        <Link key={c.name} className="catalog-card" href={c.href}>
          <span className="catalog-idx">{String(i + 1).padStart(2, "0")}</span>
          <span className="catalog-docs">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M5 11 11 5M6 5h5v5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="catalog-specimen">{SPECIMENS[c.name]}</span>
        </Link>
      ))}
    </div>
  );
}
