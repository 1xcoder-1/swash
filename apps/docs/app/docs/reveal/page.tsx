import { CodeBlock } from "@/components/code-block";
import { PropsTable } from "@/components/props-table";
import { RevealDemo } from "@/components/demos";

export const metadata = { title: "Reveal" };

export default function RevealPage() {
  return (
    <>
      <h1>Reveal</h1>
      <p className="lead">
        Lines of text whose words, letters or whole lines rise into place — on
        mount or on scroll — using kerning-safe ranges so nothing jumps.
      </p>

      <RevealDemo />

      <h2>Install & import</h2>
      <CodeBlock copy='import { Reveal } from "swash";'>
        <span className="tok-k">import</span> {" { Reveal } "}
        <span className="tok-k">from</span> <span className="tok-s">"swash"</span>;
      </CodeBlock>

      <h2>Usage</h2>
      <CodeBlock
        copy={`<Reveal by="word" stagger={70} startOnView once>\n  Every word arrives on its own beat.\n</Reveal>`}
      >
        {"<"}
        <span className="tok-t">Reveal</span> <span className="tok-a">by</span>
        {"="}<span className="tok-s">"word"</span>{" "}
        <span className="tok-a">stagger</span>={"{"}
        <span className="tok-n">70</span>
        {"} "}
        <span className="tok-a">startOnView</span> <span className="tok-a">once</span>
        {">"}
        <br />
        {"  Every word arrives on its own beat."}
        <br />
        {"</"}
        <span className="tok-t">Reveal</span>{">"}
      </CodeBlock>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", desc: "The text to reveal. v1 animates strings; anything else renders as it is." },
          { name: "by", type: '"fade" | "word" | "letter" | "line"', default: '"word"', desc: "Size of one piece of the line." },
          { name: "stagger", type: "number", desc: "Milliseconds between one piece and the next." },
          { name: "duration", type: "number", desc: "How long one piece takes to arrive." },
          { name: "y", type: "number", desc: "How far each piece rises from, in px. 0.35em by default." },
          { name: "startOnView", type: "boolean", default: "false", desc: "Wait for the line to scroll into view." },
          { name: "once", type: "boolean", desc: "Stay revealed once arrived, rather than replaying on every visit." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Pieces are measured with kerning-aware ranges, so the stagger follows
        where the glyphs actually are — no boxes that miss ligatures, no
        reflow when the font finishes loading.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, the
        text is shown in its final state instantly, already in flow.
      </p>
    </>
  );
}
