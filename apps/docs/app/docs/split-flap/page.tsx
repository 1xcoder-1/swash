import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { SplitFlapDemo } from "@/components/demos";

export const metadata = { title: "Split Flap" };

export default function SplitFlapPage() {
  return (
    <>
      <h1>Split Flap</h1>

      <h2>Overview</h2>
      <p className="lead">
        A split-flap board, the way an airport departures board lands on a
        line: every cell that differs from the target spins through tiles and
        comes down on the right one, and the wave travels the way a reader
        scans.
      </p>

      <SplitFlapDemo />

      <CodeTabs
        js={`import { SplitFlap } from "swash";\n\nconst flights = ["DELAYED", "BOARDING", "DEPARTED"];\nconst [i, setI] = useState(0);\n\n<SplitFlap text={flights[i]} interval={90} />`}
        ts={`import { SplitFlap, type SplitFlapProps } from "swash";\n\nconst props: SplitFlapProps = {\n  text: "BOARDING",\n  interval: 90,\n};\n\n<SplitFlap {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { SplitFlap } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "text", type: "string", desc: "The line on the board. Changing it flips the board to it." },
          { name: "charset", type: "string", default: '"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"', desc: "The characters the cells cycle through on the way." },
          { name: "interval", type: "number", default: "90", desc: "Time for one flip of a cell, in ms." },
          { name: "onDone", type: "() => void", desc: "Fires when every cell that had to turn has landed." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The tiles are uncontrolled after mount: React writes each cell once,
        and a framework-free engine owns every change after that — so a parent
        re-render can never land the board instantly, which is the bug that
        turns a flap display back into plain text. Graphemes come from{" "}
        <code className="inline-code">Intl.Segmenter</code>, so an emoji is one
        tile, not four broken halves.
      </p>
    </>
  );
}
