import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { SliceDemo, SliceHoverDemo } from "@/components/demos";

export const metadata = { title: "Slice" };

export default function SlicePage() {
  return (
    <>
      <h1>Slice</h1>

      <h2>Overview</h2>
      <p className="lead">
        Bisected text: the phrase is cut along its middle, and on cue the
        halves slide apart — the top to one side, the bottom to the other —
        and come back.
      </p>

      <SliceDemo />
      <SliceHoverDemo />

      <CodeTabs
        js={`import { Slice } from "swash";\n\n<Slice text="DIVIDED" trigger="loop" hold={1300} amount={18} />`}
        ts={`import { Slice, type SliceProps } from "swash";\n\nconst props: SliceProps = {\n  text: "DIVIDED",\n  trigger: "loop",\n  hold: 1300,\n  amount: 18,\n};\n\n<Slice {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Slice } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "text", type: "string", desc: "The phrase that gets cut." },
          { name: "amount", type: "number", default: "14", desc: "How far each half slides from the seam, in px." },
          { name: "duration", type: "number", default: "420", desc: "How long one slide takes, in ms." },
          { name: "trigger", type: '"hover" | "view" | "loop"', default: '"hover"', desc: "When the halves part. view closes them again off-screen." },
          { name: "hold", type: "number", default: "1400", desc: "With loop, how long the halves stay parted, in ms." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The halves are two copies of the same text, each clipped to half the
        box with <code className="inline-code">clip-path: inset</code> and
        stacked exactly over one another — so the seam never has to be
        measured. The clips meet on the shared centre line, and the two copies
        read as one word until they move.
      </p>
    </>
  );
}
