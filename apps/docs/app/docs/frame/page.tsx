import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import {
  FrameDemo,
  FrameStyleDemo,
  FrameToggleDemo,
} from "@/components/demos";

export const metadata = { title: "Frame" };

export default function FramePage() {
  return (
    <>
      <h1>Frame</h1>

      <h2>Overview</h2>
      <p className="lead">
        A selection frame that draws itself around any element, with a corner
        badge and font-metric-aware sizing.
      </p>

      <FrameDemo />
      <FrameToggleDemo />
      <FrameStyleDemo />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Frame } from "swash";' />

      <h2>Usage</h2>
      <p>Wrap any element — the frame draws itself around it:</p>
      <CodeTabs
        js={`<Frame label="step 2" color="var(--accent)" radius={10}>\n  <button>Continue</button>\n</Frame>`}
        ts={`import { Frame, type FrameProps } from "swash";\n\nconst frame: Partial<FrameProps> = {\n  label: "step 2",\n  color: "var(--accent)",\n  radius: 10,\n};\n\n<Frame {...frame}>\n  <button>Continue</button>\n</Frame>`}
      />

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
