import Link from "next/link";
import { CodeBlock } from "@/components/code-block";

export default function Quickstart() {
  return (
    <>
      <h1>Quickstart</h1>
      <p className="lead">
        Install the package, drop a component into any client component, and the
        effect runs itself. No provider, no config, no CSS framework required.
      </p>

      <h2>1. Install</h2>
      <CodeBlock copy="npm i swash">
        <span className="tok-k">npm</span> i swash
      </CodeBlock>
      <p>
        swash is a single ESM + CJS package with React 18+ as its only peer
        dependency. It weighs about 53 KB for all seven components before gzip,
        and each one tree-shakes alone.
      </p>

      <h2>2. Use a component</h2>
      <CodeBlock
        caption="hero.tsx"
        copy={`import { Reveal, Marker } from "swash";\n\nexport function Hero() {\n  return (\n    <h1>\n      <Reveal by="word">Ship text effects</Reveal>{" "}\n      <Marker action="highlight" color="amber">without the yak shave.</Marker>\n    </h1>\n  );\n}`}
      >
        <span className="tok-k">import</span>
        {" { Reveal, Marker } "}
        <span className="tok-k">from</span> <span className="tok-s">"swash"</span>
        {"\n\n"}
        <span className="tok-k">export function</span>{" "}
        <span className="tok-t">Hero</span>
        {"() {\n  return (\n    <"}
        <span className="tok-t">h1</span>
        {">\n      <"}
        <span className="tok-t">Reveal</span> <span className="tok-a">by</span>
        {"="}<span className="tok-s">"word"</span>{">Ship text effects</"}
        <span className="tok-t">Reveal</span>
        {">\n      <"}
        <span className="tok-t">Marker</span>{" "}
        <span className="tok-a">action</span>
        {"="}<span className="tok-s">"highlight"</span>{" "}
        <span className="tok-a">color</span>
        {"="}<span className="tok-s">"amber"</span>{">without the yak shave.</"}
        <span className="tok-t">Marker</span>
        {"\n    </"}
        <span className="tok-t">h1</span>
        {">\n  );\n}"}
      </CodeBlock>
      <p>
        Components that touch the DOM are client components already marked for
        you, so this works straight away in a Next.js App Router page, a Remix
        route, or any Vite React app.
      </p>

      <h2>3. Trigger on scroll</h2>
      <p>
        Most effects wait for you to opt in to the scroll trigger —{" "}
        <code className="inline-code">startOnView</code> holds the effect until
        the element appears, and <code className="inline-code">once</code>
        decides whether it replays on later visits.
      </p>
      <CodeBlock
        copy={`<Counter to={12450} prefix="$" duration={1800} startOnView once />\n<Typewriter loop={["Build.", "Measure.", "Refine."]} startOnView />`}
      >
        {"<"}
        <span className="tok-t">Counter</span>{" "}
        <span className="tok-a">to</span>={"{"}
        <span className="tok-n">12450</span>
        {"} "}
        <span className="tok-a">prefix</span>
        {"="}<span className="tok-s">"$"</span>{" "}
        <span className="tok-a">duration</span>
        {"="}<span className="tok-n">1800</span>{" "}
        <span className="tok-a">startOnView</span> <span className="tok-a">once</span>{" "}
        {"/>"}
      </CodeBlock>

      <h2>4. Respect reduced motion</h2>
      <p>
        You do nothing. Every component reads{" "}
        <code className="inline-code">prefers-reduced-motion</code> through a
        live subscription and swaps to its declared static variant — the final
        state, rendered instantly. Toggling the OS setting mid-session works
        without a reload. See <Link className="inline" href="/docs/accessibility">Accessibility</Link>{" "}
        for the per-component table.
      </p>

      <h2>Next steps</h2>
      <ul>
        <li>
          <Link className="inline" href="/docs/typewriter">
            Typewriter
          </Link>
          : phrases, feels and the caret
        </li>
        <li>
          <Link className="inline" href="/docs/reveal">
            Reveal
          </Link>{" "}
          and{" "}
          <Link className="inline" href="/docs/scramble">
            Scramble
          </Link>
          : the scroll-driven pair
        </li>
        <li>
          <Link className="inline" href="/docs/marker">
            Marker
          </Link>
          : emphasis that survives line wraps
        </li>
      </ul>
    </>
  );
}
