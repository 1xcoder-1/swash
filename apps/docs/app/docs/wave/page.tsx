import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { WaveDemo, WaveLoopDemo, WaveViewDemo } from "@/components/demos";

export const metadata = { title: "Wave" };

export default function WavePage() {
  return (
    <>
      <h1>Wave</h1>

      <h2>Overview</h2>
      <p className="lead">
        Sine-wave text with grapheme-safe splitting. One keyframe, one CSS
        variable per letter, zero React state on the frame loop.
      </p>

      <WaveDemo />
      <WaveLoopDemo />
      <WaveViewDemo />

      <CodeTabs
        js={`import { Wave } from "swash";\n\n<Wave amplitude={8} interval={120} trigger="hover">\n  Catch the momentum\n</Wave>`}
        ts={`import { Wave, type WaveProps } from "swash";\n\nconst props: WaveProps = {\n  amplitude: 8,\n  interval: 120,\n  trigger: "hover",\n  children: "Catch the momentum",\n};\n\n<Wave {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Wave } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", desc: "A plain string of text to wave." },
          { name: "amplitude", type: "number", default: "8", desc: "Vertical peak, in px." },
          { name: "interval", type: "number", default: "120", desc: "Phase shift between neighbours, in ms." },
          { name: "duration", type: "number", default: "800", desc: "Full oscillation time for one grapheme, in ms." },
          { name: "trigger", type: '"hover" | "view" | "loop"', default: '"hover"', desc: "When the wave plays." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Splitting goes through <code className="inline-code">Intl.Segmenter</code>,
        so a family emoji stays one animated unit rather than four broken
        halves mid-bounce.
      </p>
      <p>
        The wave is not React state re-rendering every character&rsquo;s
        offset on every frame. Each grapheme gets an index CSS variable,{" "}
        <code className="inline-code">--i</code>, and a single shared keyframe
        runs with a per-letter negative <code className="inline-code">animation-delay</code>
        — that offset is what makes the motion travel.
      </p>
    </>
  );
}
