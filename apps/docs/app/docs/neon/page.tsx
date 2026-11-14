import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { NeonDemo, NeonHoverDemo } from "@/components/demos";

export const metadata = { title: "Neon" };

export default function NeonPage() {
  return (
    <>
      <h1>Neon</h1>

      <h2>Overview</h2>
      <p className="lead">
        A neon tube: the glow lives in two text-shadow layers derived from one
        ink, and the flicker is a steps() keyframe that only the light loses —
        the letters themselves hold steady.
      </p>

      <NeonDemo />
      <NeonHoverDemo />

      <CodeTabs
        js={`import { Neon } from "swash";\n\n<Neon text="OPEN ALL NIGHT" color="magenta" flicker="soft" />`}
        ts={`import { Neon, type NeonProps } from "swash";\n\nconst props: NeonProps = {\n  text: "OPEN ALL NIGHT",\n  color: "magenta",\n  flicker: "soft",\n};\n\n<Neon {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Neon } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "text", type: "string", desc: "The line on the sign." },
          { name: "color", type: "string", default: '"cyan"', desc: "A named tube ink (amber, cyan, magenta, lime, violet, red) or any CSS colour." },
          { name: "flicker", type: '"none" | "soft" | "hard"', default: '"soft"', desc: "How the tube flickers. Reduced motion holds the glow and drops the flicker." },
          { name: "trigger", type: '"always" | "hover" | "scroll"', default: '"always"', desc: "When the tube is lit. scroll dims it again when it leaves the viewport." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Every glow layer is mixed from one ink with{" "}
        <code className="inline-code">color-mix()</code>, so a name like{" "}
        <code className="inline-code">&quot;magenta&quot;</code> lights the glyphs, the tight halo
        and the wall behind in one move — and dark mode needs nothing extra,
        because the sign makes its own light.
      </p>
    </>
  );
}
