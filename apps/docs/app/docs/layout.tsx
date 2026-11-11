import Link from "next/link";
import type { ReactNode } from "react";

const GROUPS = [
  {
    title: "Getting started",
    links: [
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/accessibility", label: "Accessibility" },
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
      <div className="doc">{children}</div>
    </div>
  );
}
