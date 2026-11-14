import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { LiquidDemo, LiquidViewDemo } from "@/components/demos";

export const metadata = { title: "Liquid" };

export default function LiquidPage() {
  return (
    <>
      <h1>Liquid</h1>

      <h2>Overview</h2>
      <p className="lead">
        Text as a glass: the glyphs are the vessel, a liquid surface rises
        inside them from empty, and the waterline keeps bobbing after the
        pour.
      </p>

      <LiquidDemo />
      <LiquidViewDemo />

      <CodeTabs
        js={`import { Liquid } from "swash";\n\n<Liquid trigger="loop" color="#38bdf8" duration={1400} hold={1800}>\n  REFILL\n</Liquid>`}
        ts={`import { Liquid, type LiquidProps } from "swash";\n\nconst props: LiquidProps = {\n  trigger: "loop",\n  color: "#38bdf8",\n  duration: 1400,\n  hold: 1800,\n  children: "REFILL",\n};\n\n<Liquid {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Liquid } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "string", desc: "The vessel." },
          { name: "color", type: "string", default: '"#38bdf8"', desc: "The liquid's colour. The surface highlight is mixed from it." },
          { name: "level", type: "number", default: "1", desc: "Where the liquid settles, from 0 to 1 of the glyph height." },
          { name: "duration", type: "number", default: "1500", desc: "How long the rise takes, in ms." },
          { name: "wave", type: "number", default: "2600", desc: "How fast the surface bobs, in ms." },
          { name: "trigger", type: '"hover" | "view" | "loop"', default: '"view"', desc: "When the pour runs. loop drains and pours again." },
          { name: "hold", type: "number", default: "2400", desc: "With loop, how long it stays up before it drains, in ms." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The level lives in a <em>registered</em> custom property (
        <code className="inline-code">@property</code>), which is what makes a
        hard-edged fill line inside a gradient animatable without JavaScript
        frames: the rise is one transition, the bob is one keyframe, and the
        two add together through <code className="inline-code">calc()</code>.
        Engines without <code className="inline-code">@property</code> simply
        show the filled state.
      </p>
    </>
  );
}
