import { CodeBlock } from "@/components/code-block";
import { PropsTable } from "@/components/props-table";
import { FrameDemo } from "@/components/demos";

export const metadata = { title: "Frame" };

export default function FramePage() {
  return (
    <>
      <h1>Frame</h1>
      <p className="lead">
        A selection frame that draws itself around any element, with a corner
        badge and font-metric-aware sizing.
      </p>

      <FrameDemo />

      <h2>Install & import</h2>
      <CodeBlock copy='import { Frame } from "swash";'>
        <span className="tok-k">import</span> {" { Frame } "}
        <span className="tok-k">from</span> <span className="tok-s">"swash"</span>;
      </CodeBlock>

      <h2>Usage</h2>
      <CodeBlock
        copy={`<Frame label="step 2" color="var(--accent)" radius={10}>\n  <button>Continue</button>\n</Frame>`}
      >
        {"<"}
        <span className="tok-t">Frame</span> <span className="tok-a">label</span>
        {"="}<span className="tok-s">"step 2"</span>{" "}
        <span className="tok-a">color</span>
        {"="}<span className="tok-s">"var(--accent)"</span>
        {" "}
        <span className="tok-a">radius</span>={"{"}
        <span className="tok-n">10</span>
        {"}>"}
        <br />
        {"  <"}
        <span className="tok-t">button</span>{">Continue</"}
        <span className="tok-t">button</span>
        <br />
        {"</"}
        <span className="tok-t">Frame</span>{">"}
      </CodeBlock>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "show", type: "boolean", desc: "Draws the frame. The outline and badge stay in the DOM either way, so toggling never remounts them." },
          { name: "label", type: "string", desc: "Text for the badge on the top-right corner. No label, no badge." },
          { name: "color", type: "string", desc: "Any CSS colour for the outline and badge; the text's own by default." },
          { name: "radius", type: "number", desc: "Corner radius of the outline, in px." },
          { name: "width", type: "number", desc: "Thickness of the outline, in px." },
          { name: "duration", type: "number", desc: "How long the frame takes to draw itself in, in ms." },
          { name: "children", type: "ReactNode", desc: "The element being framed." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The badge is positioned from real font metrics via{" "}
        <code className="inline-code">TextMetrics</code>, so it sits on the
        corner instead of floating over the text, and a{" "}
        <code className="inline-code">ResizeObserver</code> keeps the outline
        glued to the element when it changes size.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, the
        border appears already drawn — the sweep is skipped, the badge stays.
      </p>
    </>
  );
}
