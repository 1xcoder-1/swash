import { CodeBlock } from "@/components/code-block";
import { PropsTable } from "@/components/props-table";
import { TypewriterDemo } from "@/components/demos";

export const metadata = { title: "Typewriter" };

export default function TypewriterPage() {
  return (
    <>
      <h1>Typewriter</h1>
      <p className="lead">
        Types a phrase — or loops through several — one grapheme at a time, with
        rhythm presets and a caret you can turn off.
      </p>

      <TypewriterDemo />

      <h2>Install & import</h2>
      <CodeBlock copy='import { Typewriter } from "swash";'>
        <span className="tok-k">import</span>
        {" { Typewriter } "}
        <span className="tok-k">from</span> <span className="tok-s">"swash"</span>;
      </CodeBlock>

      <h2>Usage</h2>
      <CodeBlock
        copy={`<Typewriter text="One phrase, typed once." />\n\n<Typewriter\n  loop={["First.", "Second.", "Third."]}\n  feel="snappy"\n  onLoopDone={(phrase) => console.log(phrase)}\n/>`}
      >
        {"<"}
        <span className="tok-t">Typewriter</span>{" "}
        <span className="tok-a">text</span>
        {"="}<span className="tok-s">"One phrase, typed once."</span>
        {"/>"}
      </CodeBlock>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "text", type: "string", desc: "One phrase, typed once. Ignored when loop is set." },
          { name: "loop", type: "string[]", desc: "Phrases to rotate through, holding and erasing each one." },
          { name: "feel", type: '"snappy" | "cinematic" | Feel', default: '"cinematic"', desc: "Typing rhythm: a preset name or your own delays." },
          { name: "cursor", type: "boolean", default: "true", desc: "Show the blinking caret." },
          { name: "startOnView", type: "boolean", default: "false", desc: "Wait until the text scrolls into view." },
          { name: "onDone", type: "() => void", desc: "The single phrase is fully typed (or printed, with reduced motion)." },
          { name: "onLoopDone", type: "(phrase, index) => void", desc: "One full turn of loop finished: last phrase erased, pointer back at the start." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Splitting is done with <code className="inline-code">Intl.Segmenter</code>,
        so emoji and combining clusters are typed as single characters — the
        caret never sits inside half a family. The loop callback fires on a real
        full turn, not on a timer that drifts, and a backgrounded tab pauses
        the clock instead of resuming on a stale one.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, the
        whole text is printed immediately and{" "}
        <code className="inline-code">onDone</code> still fires.
      </p>
    </>
  );
}
