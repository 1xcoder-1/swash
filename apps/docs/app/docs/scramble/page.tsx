import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import {
  ScrambleCharsetDemo,
  ScrambleClickDemo,
  ScrambleDemo,
} from "@/components/demos";

export const metadata = { title: "Scramble" };

export default function ScramblePage() {
  return (
    <>
      <h1>Scramble</h1>

      <h2>Overview</h2>
      <p className="lead">
        Text that decodes itself: a churn of glyphs that settles letter by
        letter into the real line.
      </p>

      <ScrambleDemo />
      <ScrambleClickDemo />
      <ScrambleCharsetDemo />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Scramble } from "swash";' />

      <h2>Usage</h2>
      <p>Point it at a line — it churns, then settles into the real text:</p>
      <CodeTabs
        js={`<Scramble text="Initiating decode sequence." trigger="mount" />\n\n// Re-decode whenever the line changes:\n<Scramble text={headline} trigger="prop" speed={1.4} onDone={track} />`}
        ts={`import { Scramble, type ScrambleProps } from "swash";\n\nconst trigger: ScrambleProps["trigger"] = "prop";\n\n<Scramble text="Initiating decode sequence." trigger="mount" />\n\n// Re-decode whenever the line changes:\n<Scramble text={headline} trigger={trigger} speed={1.4} onDone={track} />`}
      />

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
