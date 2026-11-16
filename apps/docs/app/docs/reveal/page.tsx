import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import {
  RevealDemo,
  RevealBlurDemo,
  RevealBlurLineDemo,
  RevealBlurCharDemo,
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
        Lines of text whose words, letters or whole lines arrive piece by
        piece — rising from below, or pulling into focus out of a blur — on
        mount or on scroll. One component, both entrances, one engine.
      </p>

      <RevealDemo />
      <RevealLineDemo />
      <RevealFadeDemo />
      <RevealBlurDemo />
      <RevealBlurLineDemo />
      <RevealBlurCharDemo />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Reveal } from "react-swash";' />

      <h2>Usage</h2>
      <p>Wrap your text — words, letters or lines rise into place:</p>
      <CodeTabs
        js={`<Reveal by="word" stagger={70} startOnView once>\n  Every word arrives on its own beat.\n</Reveal>`}
        ts={`import { Reveal, type RevealProps } from "react-swash";\n\nconst by: RevealProps["by"] = "word";\n\n<Reveal by={by} stagger={70} startOnView once>\n  Every word arrives on its own beat.\n</Reveal>`}
      />

      <p>Or arrive the other way — out of a blur, like a camera finding focus:</p>
      <CodeTabs
        js={`<Reveal by="word" effect="blur" blur={12} stagger={70}>\n  Focus, on cue.\n</Reveal>`}
        ts={`import { Reveal, type RevealProps } from "react-swash";\n\n<Reveal by="word" effect="blur" blur={12} stagger={70}>\n  Focus, on cue.\n</Reveal>`}
      />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", desc: "The text to reveal. v1 animates strings; anything else renders as it is." },
          { name: "by", type: '"fade" | "word" | "letter" | "line"', default: '"word"', desc: "Size of one piece of the line." },
          { name: "effect", type: '"rise" | "blur"', default: '"rise"', desc: "How each piece arrives: up from below, or into focus from a blur." },
          { name: "stagger", type: "number", desc: "Milliseconds between one piece and the next." },
          { name: "duration", type: "number", desc: "How long one piece takes to arrive." },
          { name: "y", type: "number", desc: "How far each piece rises from, in px. 0.35em by default; rise effect only." },
          { name: "blur", type: "number", default: "10", desc: "The blur it starts from, in px; blur effect only." },
          { name: "startOnView", type: "boolean", default: "false", desc: "Wait for the line to scroll into view." },
          { name: "once", type: "boolean", desc: "Stay revealed once arrived, rather than replaying on every visit." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The split pieces are in the markup the server sent, so hydration
        matches and nothing flashes. The animating lives in one
        framework-free engine — <code className="inline-code">rise</code> and{" "}
        <code className="inline-code">blur</code> are two keyframe pairs on
        the same pieces, not two components, two stylesheets or two markup
        shapes.
      </p>
      <p>
        Word pieces stay plain <code className="inline-code">inline-block</code>{" "}
        spans with the spaces between them left as real text, so the line still
        wraps where the reader&rsquo;s font wants it to, and kerning pairs
        inside a word survive.
      </p>
    </>
  );
}
