import Link from "next/link";

export interface CatalogItem {
  name: string;
  href: string;
  /** Wide cell (2x a normal one). Unset = normal cell. */
  size?: "lg";
}

/**
 * The catalogue as a prism bento: mixed-size rounded cells, each one just
 * the component's name linking to its docs. A ghost index number sits in
 * the corner; on hover the cell lifts and washes in its own hue — every
 * cell gets a hue from the golden-angle ladder so the grid never repeats
 * a colour twice in a row. No demos here — the docs page is the demo.
 */
export function Catalog({ items }: { items: CatalogItem[] }) {
  return (
    <nav className="cat-grid" aria-label="Component catalogue">
      {items.map((c, i) => (
        <Link
          key={c.name}
          href={c.href}
          className={`cat-cell${c.size === "lg" ? " cat-lg" : ""}`}
          // Golden-angle hue step keeps neighbouring cells far apart in colour.
          style={{ "--h": Math.round((i * 137.5) % 360) } as React.CSSProperties}
        >
          <span className="cat-idx" aria-hidden>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="cat-name">{c.name}</span>
          <svg className="cat-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M5 11 11 5M6 5h5v5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      ))}
    </nav>
  );
}
