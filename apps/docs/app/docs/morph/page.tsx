import { CodeBlock } from "@/components/code-block";
import { PropsTable } from "@/components/props-table";
import { MorphDemo } from "@/components/demos";

export const metadata = { title: "Morph" };

export default function MorphPage() {
  return (
    <>
      <h1>Morph</h1>
      <p className="lead">
        One word becomes the next — whole graphemes transitioning in place, with
        the line width compensated so nothing around it shifts.
      </p>

      <MorphDemo />

      <h2>Install & import</h2>
      <CodeBlock copy='import { Morph } from "swash";'>
        <span className="tok-k">import</span> {" { Morph } "}
        <span className="tok-k">from</span> <span className="tok-s">"swash"</span>;
      </CodeBlock>

      <h2>Usage</h2>
      <CodeBlock
        copy={`<Morph values={["fast", "focused", "finished"]} hold={1100} />\n\n// Or drive it from your own state:\n<Morph values={steps} loop={false} step={current} onMorphed={report} />`}
      >
        {"<"}
        <span className="tok-t">Morph</span>{" "}
        <span className="tok-a">values</span>={"{"}
        {"["}<span className="tok-s">"fast"</span>,{" "}
        <span className="tok-s">"focused"</span>,{" "}
        <span className="tok-s">"finished"</span>
        {"]}"}
        {"} "}
        <span className="tok-a">hold</span>={"{"}
        <span className="tok-n">1100</span>
        {"} />"}
      </CodeBlock>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "values", type: "string[]", desc: "The words to move between. Fewer than two and there is nothing to morph." },
          { name: "duration", type: "number", desc: "How long one swap takes, in ms." },
          { name: "hold", type: "number", desc: "How long the word sits still before the next swap." },
          { name: "loop", type: "boolean", desc: "Keep going through the list, or step once." },
          { name: "step", type: "number", desc: "Which value to be on, for a list that is paged rather than looped." },
          { name: "onMorphed", type: "(value, index) => void", desc: "Fires after each swap lands." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Transitions happen per grapheme — a family emoji becomes another family
        emoji as a unit, never as scrambled halves — and the swap compensates
        for width mid-flight, so a headline next to the morphing word does not
        jitter every cycle.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, words
        snap between values with no in-between frames.
      </p>
    </>
  );
}
