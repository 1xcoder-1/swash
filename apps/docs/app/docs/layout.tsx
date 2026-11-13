import Link from "next/link";
import type { ReactNode } from "react";
import { DocsPager } from "@/components/docs-pager";

const GROUPS = [
  {
    title: "Getting started",
    links: [
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/accessibility", label: "Accessibility" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/docs/examples", label: "Examples" },
    ],
  },
  {
    title: "Components",
    links: [
      { href: "/docs/typewriter", label: "Typewriter" },
      { href: "/docs/frame", label: "Frame" },
      { href: "/docs/reveal", label: "Reveal" },
      { href: "/docs/scramble", label: "Scramble" },
      { href: "/docs/morph", label: "Morph" },
      { href: "/docs/counter", label: "Counter" },
      { href: "/docs/marker", label: "Marker" },
      { href: "/docs/ticker", label: "Ticker" },
      { href: "/docs/shimmer", label: "Shimmer" },
      { href: "/docs/blur-reveal", label: "Blur Reveal" },
      { href: "/docs/flip-words", label: "Flip Words" },
      { href: "/docs/glitch", label: "Glitch" },
      { href: "/docs/curved-text", label: "Curved Text" },
      { href: "/docs/wave", label: "Wave" },
    ],
  },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wrap-wide docs-layout">
      <aside className="sidebar">
        {GROUPS.map((g) => (
          <div className="sidebar-group" key={g.title}>
            <h4>{g.title}</h4>
            {g.links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <div className="doc">
        {children}
        <DocsPager />
      </div>
    </div>
  );
}
