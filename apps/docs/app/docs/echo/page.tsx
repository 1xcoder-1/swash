import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import {
  EchoDemo,
  EchoDepthDemo,
  EchoHoverDemo,
  EchoStyleDemo,
} from "@/components/demos";

export const metadata = { title: "Echo" };

export default function EchoPage() {
  return (
    <>
      <h1>Echo</h1>

      <h2>Overview</h2>
      <p className="lead">
        A trail of echoes: the text sits still, and copies of it expand out
        from under it and fade, staggered so the trail reads as one pulse
        travelling rather than several pulsing in step.
      </p>

      <EchoDemo />
      <EchoDepthDemo />
      <EchoHoverDemo />
      <EchoStyleDemo />

      <CodeTabs
        js={`import { Echo } from "react-swash";\n\n<Echo count={4} delay={420} trigger="always">\n  Signal\n</Echo>`}
        ts={`import { Echo, type EchoProps } from "react-swash";\n\nconst props: EchoProps = {\n  count: 4,\n  delay: 420,\n  trigger: "always",\n  children: "Signal",\n};\n\n<Echo {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Echo } from "react-swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", desc: "The text the trail follows." },
          { name: "count", type: "number", default: "3", desc: "Echoes in the trail, from 1 to 6." },
          { name: "delay", type: "number", default: "400", desc: "Time between one echo and the next, in ms." },
          { name: "duration", type: "number", default: "1600", desc: "How long one echo takes to fade out, in ms." },
          { name: "spread", type: "number", default: "1.16", desc: "How far an echo spreads from the text, as a scale." },
          { name: "color", type: "string", default: '"currentColor"', desc: "A CSS colour for the echoes." },
          { name: "trigger", type: '"hover" | "always" | "view"', default: '"always"', desc: "When the trail runs. view stops it again off-screen." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The echoes are real nodes staggered with negative{" "}
        <code className="inline-code">animation-delay</code>, so one keyframe
        serves the whole trail. The reader&rsquo;s text is the first span in
        the flow — selection, copy and screen readers all see exactly one
        phrase.
      </p>
    </>
  );
}
