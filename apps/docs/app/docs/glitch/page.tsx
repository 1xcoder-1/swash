import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { GlitchDemo, GlitchAlwaysDemo, GlitchScrollDemo } from "@/components/demos";

export const metadata = { title: "Glitch" };

export default function GlitchPage() {
  return (
    <>
      <h1>Glitch</h1>

      <h2>Overview</h2>
      <p className="lead">
        Chromatic aberration and slice jitter built entirely from CSS
        pseudo-elements. One DOM text node, one screen-reader pass, zero JS
        on the frame loop.
      </p>

      <GlitchDemo />
      <GlitchAlwaysDemo />
      <GlitchScrollDemo />

      <CodeTabs
        js={`import { Glitch } from "swash";\n\n<Glitch\n  text="SYSTEM REBOOT"\n  trigger="hover"\n  intensity="medium"\n  colors={["#00ffff", "#ff00ff"]}\n/>`}
        ts={`import { Glitch, type GlitchProps } from "swash";\n\nconst props: GlitchProps = {\n  text: "SYSTEM REBOOT",\n  trigger: "hover",\n  intensity: "medium",\n  colors: ["#00ffff", "#ff00ff"],\n};\n\n<Glitch {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Glitch } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "text", type: "string", desc: "The phrase to glitch." },
          { name: "trigger", type: '"hover" | "always" | "scroll"', default: '"hover"', desc: "When the animation runs." },
          { name: "intensity", type: '"subtle" | "medium" | "heavy"', default: '"medium"', desc: "Slice offset magnitude." },
          { name: "colors", type: "[string, string]", default: '["#00ffff", "#ff00ff"]', desc: "Cyan-then-magenta channel colours." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The two colour-offset copies of the phrase are painted through{" "}
        <code className="inline-code">::before</code> and{" "}
        <code className="inline-code">::after</code>{" "}
        <code className="inline-code">content: attr(data-text)</code>, not
        duplicated spans. Screen readers announce the text once, and a
        selected region copies one clean text node.
      </p>
      <p>
        Horizontal slicing is a polygon <code className="inline-code">clip-path</code>{" "}
        keyframe with <code className="inline-code">mix-blend-mode: screen</code>,
        so the effect runs on the compositor. No{" "}
        <code className="inline-code">requestAnimationFrame</code>, no{" "}
        <code className="inline-code">Math.random()</code> on every frame.
      </p>
    </>
  );
}
