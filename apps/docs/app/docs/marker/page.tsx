import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import {
  MarkerHighlightDemo,
  MarkerShapeDemo,
  MarkerUnderlineDemo,
} from "@/components/demos";

export const metadata = { title: "Marker" };

export default function MarkerPage() {
  return (
    <>
      <h1>Marker</h1>

      <h2>Overview</h2>
      <p className="lead">
        Hand-drawn emphasis over real text — highlight, underline, strike,
        circle or box — that wraps lines and needs no CSS framework.
      </p>

      <MarkerHighlightDemo />
      <MarkerUnderlineDemo />
      <MarkerShapeDemo />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Marker } from "swash";' />

      <h2>Usage</h2>
      <p>Wrap the words you want to emphasise — the mark draws itself:</p>
      <CodeTabs
        js={`<p>\n  The launch was <Marker action="highlight" color="amber">a success</Marker> for\n  everyone involved.\n</p>`}
        ts={`import { Marker, type MarkerAction, type MarkerColor } from "swash";\n\nconst action: MarkerAction = "highlight";\nconst color: MarkerColor = "amber";\n\n<p>\n  The launch was <Marker action={action} color={color}>a success</Marker> for\n  everyone involved.\n</p>`}
      />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "string", desc: "The words being marked. They are in the markup as plain text; the drawing is decoration over them." },
          { name: "action", type: '"highlight" | "underline" | "strike" | "circle" | "box"', default: '"highlight"', desc: "Which mark to draw." },
          { name: "color", type: "MarkerColor", desc: "A named ink (amber, emerald, sky, rose, violet, primary) or any CSS colour." },
          { name: "show", type: "boolean", desc: "Draw the mark. Leave it undefined and it draws itself when the text scrolls into view." },
          { name: "startOnView", type: "boolean", default: "true", desc: "When uncontrolled, wait for the text to come on screen." },
          { name: "duration", type: "number", desc: "How long the mark takes to draw, in ms." },
          { name: "delay", type: "number", desc: "Wait this long before the pen touches down, in ms." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The mark is generated from the text's actual client rects, so a marked
        phrase that breaks across two lines gets two strokes that follow the
        handwriting — the failure mode of every single-box marker. Named inks
        carry their own dark-mode value, and the path generator is jittered
        per instance so repeated marks never look stamped.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, the
        mark is simply drawn, already finished.
      </p>
    </>
  );
}
