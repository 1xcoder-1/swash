import { CodeBlock } from "@/components/code-block";
import { PropsTable } from "@/components/props-table";
import { CounterDemo } from "@/components/demos";

export const metadata = { title: "Counter" };

export default function CounterPage() {
  return (
    <>
      <h1>Counter</h1>
      <p className="lead">
        Counts a number up when it scrolls into view, with prefixes, suffixes
        and your own formatting.
      </p>

      <CounterDemo />

      <h2>Install & import</h2>
      <CodeBlock copy='import { Counter } from "swash";'>
        <span className="tok-k">import</span> {" { Counter } "}
        <span className="tok-k">from</span> <span className="tok-s">"swash"</span>;
      </CodeBlock>

      <h2>Usage</h2>
      <CodeBlock
        copy={`<Counter\n  to={12450}\n  prefix="$"\n  duration={1800}\n  startOnView\n  once\n/>\n\n<Counter to={98} suffix="%" format={(n) => n.toFixed(1)} />`}
      >
        {"<"}
        <span className="tok-t">Counter</span>
        <br />
        {"  "}
        <span className="tok-a">to</span>={"{"}
        <span className="tok-n">12450</span>
        {"}"}
        <br />
        {"  "}
        <span className="tok-a">prefix</span>
        {"="}<span className="tok-s">"$"</span>
        <br />
        {"  "}
        <span className="tok-a">duration</span>={"{"}
        <span className="tok-n">1800</span>
        {"}"}
        <br />
        {"  "}
        <span className="tok-a">startOnView</span> <span className="tok-a">once</span>
        <br />
        {"/>"}
      </CodeBlock>

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
