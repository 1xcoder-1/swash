import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { CurvedTextDemo, CurvedTextReverseDemo, CurvedTextBadgeDemo } from "@/components/demos";

export const metadata = { title: "Curved Text" };

export default function CurvedTextPage() {
  return (
    <>
      <h1>Curved Text</h1>

      <h2>Overview</h2>
      <p className="lead">
        Text bent along a circular SVG path and rotated by CSS. Native vector
        math — no per-letter trigonometry, no pixelated baselines.
      </p>

      <CurvedTextDemo />
      <CurvedTextReverseDemo />
      <CurvedTextBadgeDemo />

      <CodeTabs
        js={`import { CurvedText } from "swash";\n\n<CurvedText\n  text="EXPLORE THE SYSTEM • SCROLL DOWN • 2026 • "\n  radius={60}\n  speed={12}\n/>`}
        ts={`import { CurvedText, type CurvedTextProps } from "swash";\n\nconst props: CurvedTextProps = {\n  text: "EXPLORE THE SYSTEM • SCROLL DOWN • 2026 • ",\n  radius: 60,\n  speed: 12,\n};\n\n<CurvedText {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { CurvedText } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "text", type: "string", desc: "The phrase that flows around the circle." },
          { name: "radius", type: "number", default: "60", desc: "Circle radius in SVG user units." },
          { name: "speed", type: "number", default: "12", desc: "Seconds for a full revolution." },
          { name: "reverse", type: "boolean", default: "false", desc: "Rotate counter-clockwise." },
          { name: "spacing", type: "number", default: "0", desc: "Letter spacing along the path." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Glyph placement is handled by the browser&rsquo;s{" "}
        <code className="inline-code">&lt;textPath&gt;</code> SVG renderer
        rather than thirty absolutely-positioned spans rotated by{" "}
        <code className="inline-code">cos(θ)/sin(θ)</code>. That means real
        kerning, real hinting, and no blurry rounded baselines.
      </p>
      <p>
        Rotation is one CSS keyframe on the SVG group, so it stays on the
        compositor. The <code className="inline-code">viewBox</code> is
        derived from the radius, so a font-zoom or a container resize does
        not break the circle.
      </p>
      <p>
        Screen readers get an SVG <code className="inline-code">&lt;title&gt;</code>{" "}
        and an outer <code className="inline-code">aria-label</code>, so the
        phrase is read as a normal sentence.
      </p>
    </>
  );
}
