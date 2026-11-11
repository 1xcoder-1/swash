import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <span className="footer-logo" aria-hidden>
          <LogoMark />
        </span>
        <nav className="footer-col" aria-label="Documentation">
          <Link href="/docs/quickstart">Quickstart</Link>
          <Link href="/docs/accessibility">Accessibility</Link>
          <Link href="/docs/typewriter">API reference</Link>
        </nav>
        <nav className="footer-col" aria-label="Components">
          <Link href="/docs/typewriter">Typewriter</Link>
          <Link href="/docs/scramble">Scramble</Link>
          <Link href="/docs/marker">Marker</Link>
          <Link href="/docs/counter">Counter</Link>
        </nav>
        <nav className="footer-col" aria-label="Project">
          <a
            href="https://github.com/1xcoder-1/swash"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/swash"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <Link href="/">Landing</Link>
        </nav>
      </div>
      <span className="footer-mark" aria-hidden>
        swash
      </span>
    </footer>
  );
}
