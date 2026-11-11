import { CodeBlock } from "@/components/code-block";
import { PropsTable } from "@/components/props-table";
import { MarkerDemo } from "@/components/demos";

export const metadata = { title: "Marker" };

export default function MarkerPage() {
  return (
    <>
      <h1>Marker</h1>
      <p className="lead">
        Hand-drawn emphasis over real text — highlight, underline, strike,
        circle or box — that wraps lines and needs no CSS framework.
      </p>

      <MarkerDemo />

      <h2>Install & import</h2>
      <CodeBlock copy='import { Marker } from "swash";'>
        <span className="tok-k">import</span> {" { Marker } "}
        <span className="tok-k">from</span> <span className="tok-s">"swash"</span>;
      </CodeBlock>

      <h2>Usage</h2>
      <CodeBlock
        copy={`<p>\n  The launch was <Marker action="highlight" color="amber">a success</Marker> for\n  everyone involved.\n</p>`}
      >
        {"<"}
        <span className="tok-t">p</span>{">"}
        <br />
        {"  The launch was <"}
        <span className="tok-t">Marker</span>{" "}
        <span className="tok-a">action</span>
        {"="}<span className="tok-s">"highlight"</span>{" "}
        <span className="tok-a">color</span>
        {"="}<span className="tok-s">"amber"</span>{">a success</"}
        <span className="tok-t">Marker</span>{">>"}
        <br />
        {"  for everyone.\n</"}
        <span className="tok-t">p</span>{">"}
      </CodeBlock>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "string", desc: "The words being marked. They are in the markup as plain text; the drawing is decoration over them." },
          { name: "action", type: '"highlight" | "underline" | "strike" | "circle" | "box"', default: '"highlight"', desc: "Which mark to draw." },
          { name: "color", type: "MarkerColor", desc: "A named ink (amber, emerald, sky, rose, violet, primary) or any CSS colour." },
          { name: "show", type: "boolean", desc: "Draw the mark. Leave it undefined and it draws itself when the text scrolls into view." },
          { name: "startOnView", type: "boolean", default: "true", desc: "When uncontrolled, wait for the text to come on screen." },
          { name: "duration", type: "number", desc: "How long the mark takes to draw, in ms." },
          { name: "delay", type: "number", desc: "Wait this long before the pen touches down, in ms." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The mark is generated from the text's actual client rects, so a marked
        phrase that breaks across two lines gets two strokes that follow the
        handwriting — the failure mode of every single-box marker. Named inks
        carry their own dark-mode value, and the path generator is jittered
        per instance so repeated marks never look stamped.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, the
        mark is simply drawn, already finished.
      </p>
    </>
  );
}
