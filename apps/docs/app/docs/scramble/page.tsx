import { CodeBlock } from "@/components/code-block";
import { PropsTable } from "@/components/props-table";
import { ScrambleDemo } from "@/components/demos";

export const metadata = { title: "Scramble" };

export default function ScramblePage() {
  return (
    <>
      <h1>Scramble</h1>
      <p className="lead">
        Text that decodes itself: a churn of glyphs that settles letter by
        letter into the real line.
      </p>

      <ScrambleDemo />

      <h2>Install & import</h2>
      <CodeBlock copy='import { Scramble } from "swash";'>
        <span className="tok-k">import</span> {" { Scramble } "}
        <span className="tok-k">from</span> <span className="tok-s">"swash"</span>;
      </CodeBlock>

      <h2>Usage</h2>
      <CodeBlock
        copy={`<Scramble text="Initiating decode sequence." trigger="mount" />\n\n// Re-decode whenever the line changes:\n<Scramble text={headline} trigger="prop" speed={1.4} onDone={track} />`}
      >
        {"<"}
        <span className="tok-t">Scramble</span>{" "}
        <span className="tok-a">text</span>
        {"="}<span className="tok-s">"Initiating decode sequence."</span>{" "}
        <span className="tok-a">trigger</span>
        {"="}<span className="tok-s">"mount"</span>
        {"/>"}
      </CodeBlock>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "text", type: "string", desc: "The line the effect decodes to. It is also what the markup carries." },
          { name: "charset", type: "string", desc: "The glyphs the churn draws from, used only while a run is going." },
          { name: "speed", type: "number", desc: "Half to three times the pace. Anything outside that is clamped." },
          { name: "trigger", type: '"mount" | "view" | "click" | "prop"', default: '"mount"', desc: "What starts the effect. prop waits for text to change; mount does not." },
          { name: "onDone", type: "() => void", desc: "Fires when the line has fully settled." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Frames are grapheme-stable: the churn swaps whole clusters, never the
        half of an emoji, and the target text lives in the server-rendered
        markup from the first paint — screen readers and crawlers get the real
        line while the effect is decoration over it.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, the
        text simply appears and <code className="inline-code">onDone</code>{" "}
        fires immediately.
      </p>
    </>
  );
}
