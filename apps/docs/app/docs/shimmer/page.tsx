import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { ShimmerDemo, ShimmerLinesDemo, ShimmerBadgeDemo } from "@/components/demos";

export const metadata = { title: "Shimmer" };

export default function ShimmerPage() {
  return (
    <>
      <h1>Shimmer</h1>

      <h2>Overview</h2>
      <p className="lead">
        Iridescent light beam that sweeps across a title or badge. Runs on the
        compositor, pauses off-screen, and never breaks text selection.
      </p>

      <ShimmerDemo />
      <ShimmerLinesDemo />
      <ShimmerBadgeDemo />

      <CodeTabs
        js={`import { Shimmer } from "swash";\n\n<Shimmer spread={120} duration={2400}>\n  Powered by Next-Gen AI\n</Shimmer>`}
        ts={`import { Shimmer, type ShimmerProps } from "swash";\n\nconst props: ShimmerProps = {\n  spread: 120,\n  duration: 2400,\n  color: "rgba(255,255,255,0.9)",\n  baseColor: "#7a7a94",\n  children: "Powered by Next-Gen AI",\n};\n\n<Shimmer {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Shimmer } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", desc: "The text or badge the beam sweeps across." },
          { name: "spread", type: "number", default: "240", desc: "Half-width of the highlight along the sweep, in px." },
          { name: "duration", type: "number", default: "2400", desc: "Full sweep time, in ms." },
          { name: "color", type: "string", default: '"rgba(255,255,255,0.85)"', desc: "Colour of the highlight." },
          { name: "baseColor", type: "string", default: '"#888888"', desc: "Colour of the unlit text." },
          { name: "pauseWhenHidden", type: "boolean", default: "true", desc: "Stop the sweep when off-screen to save battery." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Zero config. No custom Tailwind classes or hand-written keyframe files
        to copy-paste. The stylesheet is injected once through{" "}
        <code className="inline-code">ensureStyle</code>, and the animation
        uses <code className="inline-code">will-change</code> to keep the
        gradient layer on the compositor.
      </p>
      <p>
        Text selection is preserved by an explicit{" "}
        <code className="inline-code">::selection</code> rule, so a reader
        highlighting the phrase sees a readable selection instead of a
        transparent smear.
      </p>
    </>
  );
}
