import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import {
  RevealDemo,
  RevealFadeDemo,
  RevealLineDemo,
} from "@/components/demos";

export const metadata = { title: "Reveal" };

export default function RevealPage() {
  return (
    <>
      <h1>Reveal</h1>

      <h2>Overview</h2>
      <p className="lead">
        Lines of text whose words, letters or whole lines rise into place — on
        mount or on scroll — using kerning-safe ranges so nothing jumps.
      </p>

      <RevealDemo />
      <RevealLineDemo />
      <RevealFadeDemo />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Reveal } from "swash";' />

      <h2>Usage</h2>
      <p>Wrap your text — words, letters or lines rise into place:</p>
      <CodeTabs
        js={`<Reveal by="word" stagger={70} startOnView once>\n  Every word arrives on its own beat.\n</Reveal>`}
        ts={`import { Reveal, type RevealProps } from "swash";\n\nconst by: RevealProps["by"] = "word";\n\n<Reveal by={by} stagger={70} startOnView once>\n  Every word arrives on its own beat.\n</Reveal>`}
      />

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
