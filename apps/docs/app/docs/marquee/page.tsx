import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { MarqueeDemo, MarqueeReverseDemo } from "@/components/demos";

export const metadata = { title: "Marquee" };

export default function MarqueePage() {
  return (
    <>
      <h1>Marquee</h1>

      <h2>Overview</h2>
      <p className="lead">
        An endless belt of text: two identical copies sit side by side on one
        track, and the track slides exactly half its own width before snapping
        back — which is invisible, because the second copy is standing exactly
        where the first was.
      </p>

      <MarqueeDemo />
      <MarqueeReverseDemo />

      <CodeTabs
        js={`import { Marquee } from "swash";\n\n<Marquee duration={9000} gap={40}>\n  <span>Free shipping worldwide</span>\n  <span aria-hidden>✦</span>\n  <span>Ships in 24 hours</span>\n</Marquee>`}
        ts={`import { Marquee, type MarqueeProps } from "swash";\n\nconst props: MarqueeProps = {\n  duration: 9000,\n  gap: 40,\n  children: (\n    <>\n      <span>Free shipping worldwide</span>\n      <span aria-hidden>✦</span>\n    </>\n  ),\n};\n\n<Marquee {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Marquee } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", desc: "One copy of the belt's content. It is rendered twice; the second copy is aria-hidden." },
          { name: "duration", type: "number", default: "12000", desc: "Time for one full loop of the content, in ms." },
          { name: "gap", type: "number", default: "48", desc: "Gap between the repeating copies, in px." },
          { name: "reverse", type: "boolean", default: "false", desc: "Scrolls the other way." },
          { name: "pauseOnHover", type: "boolean", default: "true", desc: "Stops the belt while the pointer is over it, and resumes where it stopped." },
          { name: "fade", type: "boolean", default: "true", desc: "Fades the belt out at each side with a mask." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        One keyframe on one track, on the compositor, however long the line
        is — no measuring, no per-item widths, no JavaScript on the scroll.
        The belt pauses with a play-state, so it resumes exactly where it
        stopped rather than jumping.
      </p>
    </>
  );
}
