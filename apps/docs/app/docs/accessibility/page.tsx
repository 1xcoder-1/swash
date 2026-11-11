import { CodeBlock } from "@/components/code-block";

export const metadata = { title: "Accessibility" };

const ROWS = [
  ["Typewriter", "The whole text is printed at once; onDone still fires."],
  ["Reveal", "Final state, already in flow — no opacity left behind."],
  ["Scramble", "The real line appears immediately; no churn frames."],
  ["Morph", "Words snap between values with no in-between frames."],
  ["Counter", "The final number is shown on the first paint."],
  ["Frame", "The border appears already drawn; the badge stays."],
  ["Marker", "The mark is simply drawn, already finished."],
];

export default function AccessibilityPage() {
  return (
    <>
      <h1>Accessibility</h1>
      <p className="lead">
        Motion is decoration; the text is the contract. Every component is
        built so that turning the animation off never removes information.
      </p>

      <h2>Reduced motion is a render mode</h2>
      <p>
        Each component reads{" "}
        <code className="inline-code">prefers-reduced-motion</code> through a
        live <code className="inline-code">matchMedia</code> subscription.
        Toggling the OS setting mid-page switches every running effect to its
        static variant without a reload, and switching back resumes the
        animated one.
      </p>

      <table className="props">
        <thead>
          <tr>
            <th>Component</th>
            <th>Reduced-motion behaviour</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([name, behaviour]) => (
            <tr key={name}>
              <td>{name}</td>
              <td style={{ fontFamily: "var(--font)", color: "var(--text-2)" }}>
                {behaviour}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Text lives in the markup</h2>
      <p>
        No component replaces its text with drawn shapes. The words are plain
        DOM text first; the animation is decoration layered over them, so
        screen readers, crawlers, find-in-page and copy-paste all get the real
        content while the effect is running.
      </p>
      <ul>
        <li>Counter and Marker render a <code className="inline-code">span</code> and add no structure, so they are safe inside a heading.</li>
        <li>Scramble carries its target text in the server-rendered markup from the first paint.</li>
        <li>Reveal measures real text ranges instead of cloning glyphs into positioned boxes.</li>
      </ul>

      <h2>Hydration and focus</h2>
      <p>
        The server writes the same markup the client starts from — a counter
        prints the number it counts <em>from</em>, not the one it counts to —
        so hydration never corrects itself and nothing flashes. Effects never
        steal focus, and none of them run in a loop that a keyboard user has
        to wait out.
      </p>

      <h2>Testing it yourself</h2>
      <CodeBlock copy="@media (prefers-reduced-motion: reduce) {\n  /* the OS toggle your components should already handle */\n}">
        <span className="tok-c">
          {"// Force the static path locally, without touching OS settings:"}
        </span>
        <br />
        <span className="tok-k">@media</span> (
        <span className="tok-a">prefers-reduced-motion</span>:{" "}
        <span className="tok-s">reduce</span>) {"{"}
        <br />
        {"  "}
        <span className="tok-c">{"/* every swash component renders its final state */"}</span>
        <br />
        {"}"}
      </CodeBlock>
      <p>
        Chrome DevTools can emulate the media feature under Rendering → Emulate
        prefers-reduced-motion, which is the fastest way to check the table
        above against a live page.
      </p>
    </>
  );
}
