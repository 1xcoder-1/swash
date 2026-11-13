import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import {
  AmountDemo,
  CounterDemo,
  CounterFromDemo,
  TypeDemo,
} from "@/components/demos";

export const metadata = { title: "Counter" };

export default function CounterPage() {
  return (
    <>
      <h1>Counter</h1>

      <h2>Overview</h2>
      <p className="lead">
        Counts a number up when it scrolls into view, with prefixes, suffixes
        and your own formatting.
      </p>

      <CounterDemo />
      <CounterFromDemo />

      <h2>Place-value numbers</h2>
      <p>
        A number that changes to another number should stay a number. With the{" "}
        <code className="inline-code">Morph</code> component, <code className="inline-code">$1,204 &rarr; $1,318</code>{" "}
        moves only the digits that changed and leaves the rest still — and as
        you type, the line rewrites itself without a layout jump.
      </p>
      <AmountDemo />
      <TypeDemo />

      <CodeTabs
        js={`import { Morph } from "swash";\n\n// A number that changes stays a number — only changed digits move:\n<Morph values={["1,204", "1,318", "1,999"]} loop={false} step={i} duration={600} />\n\n// Rewrites as you type — the box holds the widest value so nothing jumps.\n<Morph values={[previous, next]} loop={false} step={1} duration={400} />`}
        ts={`import { Morph, type MorphProps } from "swash";\n\nconst values: MorphProps["values"] = ["1,204", "1,318", "1,999"];\n\n<Morph values={values} loop={false} step={i} duration={600} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Counter } from "swash";' />

      <h2>Usage</h2>
      <p>Set the number to land on — it counts up on view:</p>
      <CodeTabs
        js={`<Counter\n  to={12450}\n  prefix="$"\n  duration={1800}\n  startOnView\n  once\n/>\n\n<Counter to={98} suffix="%" format={(n) => n.toFixed(1)} />`}
        ts={`import { Counter, type CounterProps } from "swash";\n\nconst format: CounterProps["format"] = (n) => n.toFixed(1);\n\n<Counter to={12450} prefix="$" duration={1800} startOnView once />\n\n<Counter to={98} suffix="%" format={format} />`}
      />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "to", type: "number", desc: "The number to land on." },
          { name: "from", type: "number", default: "0", desc: "The number to start from." },
          { name: "duration", type: "number", default: "1500", desc: "Count time in ms." },
          { name: "delay", type: "number", default: "0", desc: "Wait before counting, in ms." },
          { name: "prefix", type: "string", desc: 'Printed before the number, like "$".' },
          { name: "suffix", type: "string", desc: 'Printed after the number, like "%".' },
          { name: "format", type: "(n: number) => string", desc: "Turns the running value into text. Defaults to rounding plus thousands separators." },
          { name: "startOnView", type: "boolean", default: "true", desc: "Wait for the element to scroll into view." },
          { name: "once", type: "boolean", default: "true", desc: "With startOnView, count on the first appearance only." },
          { name: "onDone", type: "() => void", desc: "Fires when the count lands." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        A parent that re-renders mid-count changes nothing — the running value
        is not restarted by props that did not move, which is the bug class
        people keep reporting against the popular counter packages. A tab that
        goes to the background stops the clock instead of resuming on a stale
        one, and the server writes the number it starts from rather than the
        one it counts up to, so there is nothing to correct on hydration.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, the
        final number is shown on the first paint.
      </p>
    </>
  );
}
