import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { BlurRevealDemo, BlurRevealLineDemo, BlurRevealCharDemo } from "@/components/demos";

export const metadata = { title: "Blur Reveal" };

export default function BlurRevealPage() {
  return (
    <>
      <h1>Blur Reveal</h1>

      <h2>Overview</h2>
      <p className="lead">
        Words or lines fade from a Gaussian blur into sharp focus, staggered
        and screen-reader friendly.
      </p>

      <BlurRevealDemo />
      <BlurRevealLineDemo />
      <BlurRevealCharDemo />

      <CodeTabs
        js={`import { BlurReveal } from "swash";\n\n<BlurReveal by="word" blur={10} stagger={60} duration={500}>\n  Intelligence designed for every scale.\n</BlurReveal>`}
        ts={`import { BlurReveal, type BlurRevealProps } from "swash";\n\nconst props: BlurRevealProps = {\n  by: "word",\n  blur: 10,\n  stagger: 60,\n  duration: 500,\n  children: "Intelligence designed for every scale.",\n};\n\n<BlurReveal {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { BlurReveal } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "string", desc: "The sentence to reveal." },
          { name: "by", type: '"word" | "line" | "char"', default: '"word"', desc: "Split granularity. Word preserves OpenType kerning." },
          { name: "blur", type: "number", default: "10", desc: "Starting blur radius, in px." },
          { name: "stagger", type: "number", default: "60", desc: "Per-piece delay, in ms." },
          { name: "duration", type: "number", default: "500", desc: "Per-piece transition, in ms." },
          { name: "startOnView", type: "boolean", default: "true", desc: "Wait for the block to enter the viewport." },
          { name: "once", type: "boolean", default: "true", desc: "Play on the first appearance only." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Splitting is word-safe by default, so the OpenType engine keeps its
        kerning pairs across <code className="inline-code">AV</code>,{" "}
        <code className="inline-code">To</code>, and{" "}
        <code className="inline-code">We</code>. Blur is applied with{" "}
        <code className="inline-code">filter</code> per word rather than per
        letter, so fifty letters on a mobile phone does not mean fifty
        simultaneous blur composites.
      </p>
      <p>
        The whole sentence is announced once from the parent{" "}
        <code className="inline-code">aria-label</code>; every blurred piece
        carries <code className="inline-code">aria-hidden="true"</code>.
      </p>
    </>
  );
}
