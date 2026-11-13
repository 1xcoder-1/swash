import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { FlipWordsDemo, FlipWordsHorizontalDemo, FlipWordsStartDemo } from "@/components/demos";

export const metadata = { title: "Flip Words" };

export default function FlipWordsPage() {
  return (
    <>
      <h1>Flip Words</h1>

      <h2>Overview</h2>
      <p className="lead">
        Cycles through a list of phrases with a 3D flip. The box reserves the
        widest word so neighbours never jump, and the timer freezes when the
        tab is backgrounded.
      </p>

      <FlipWordsDemo />
      <FlipWordsHorizontalDemo />
      <FlipWordsStartDemo />

      <CodeTabs
        js={`import { FlipWords } from "swash";\n\n<FlipWords\n  words={["ultra-fast", "bulletproof", "accessible", "production-ready"]}\n  duration={2500}\n  preserveSpace\n  direction="vertical"\n/>`}
        ts={`import { FlipWords, type FlipWordsProps } from "swash";\n\nconst words: FlipWordsProps["words"] = [\n  "ultra-fast",\n  "bulletproof",\n  "accessible",\n  "production-ready",\n];\n\n<FlipWords words={words} duration={2500} preserveSpace direction="vertical" />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { FlipWords } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "words", type: "string[]", desc: "Phrases to cycle through." },
          { name: "duration", type: "number", default: "2500", desc: "Dwell time per word, in ms." },
          { name: "direction", type: '"vertical" | "horizontal"', default: '"vertical"', desc: "Flip axis: rotateX or rotateY." },
          { name: "preserveSpace", type: "boolean", default: "true", desc: "Hold the box at the widest word." },
          { name: "startAtIndex", type: "number", default: "0", desc: "Index to begin from." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Widest-word measurement happens once on mount through an invisible
        <code className="inline-code">&lt;span&gt;</code> stack, so{" "}
        <code className="inline-code">Fast &rarr; Accessible</code> never
        reflows the surrounding sentence.
      </p>
      <p>
        The rotation stays inside a self-contained 3D context —{" "}
        <code className="inline-code">perspective</code> and{" "}
        <code className="inline-code">backface-visibility: hidden</code> are
        set on the box itself, so a parent with{" "}
        <code className="inline-code">overflow: hidden</code> cannot clip the
        mid-flip frame.
      </p>
      <p>
        A <code className="inline-code">visibilitychange</code> listener parks
        the timer while the tab is in the background, so returning to the page
        does not fire a rapid catch-up sequence.
      </p>
    </>
  );
}
