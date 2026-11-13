import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import { TickerDemo, TickerStatsDemo, TickerDoneDemo } from "@/components/demos";

export const metadata = { title: "Ticker" };

export default function TickerPage() {
  return (
    <>
      <h1>Ticker</h1>

      <h2>Overview</h2>
      <p className="lead">
        Rolling-digits odometer for prices, counters, and dashboards. Only the
        digits that changed roll; commas, decimal points, and currency symbols
        sit still.
      </p>

      <TickerDemo />
      <TickerStatsDemo />
      <TickerDoneDemo />

      <CodeTabs
        js={`import { Ticker } from "swash";\n\n<Ticker\n  value={499.95}\n  prefix="$"\n  duration={600}\n  stagger={40}\n  decimals={2}\n/>`}
        ts={`import { Ticker, type TickerProps } from "swash";\n\nconst props: TickerProps = {\n  value: 499.95,\n  prefix: "$",\n  duration: 600,\n  stagger: 40,\n  decimals: 2,\n};\n\n<Ticker {...props} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Ticker } from "swash";' />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "value", type: "number", desc: "The number to display." },
          { name: "prefix", type: "string", desc: 'Static text before the digits, e.g. "$".' },
          { name: "suffix", type: "string", desc: 'Static text after the digits, e.g. "%".' },
          { name: "duration", type: "number", default: "500", desc: "Total animation time for the last column, in ms." },
          { name: "stagger", type: "number", default: "40", desc: "Per-column delay, in ms." },
          { name: "direction", type: '"up" | "down" | "auto"', default: '"auto"', desc: "Rolling direction. Reserved for a future wrap-strip release." },
          { name: "decimals", type: "number", desc: "Fixed decimals. If omitted, natural decimals from the value." },
          { name: "separator", type: "string", default: '","', desc: 'Thousands separator; pass "" to disable.' },
          { name: "onDone", type: "() => void", desc: "Fires when every column has landed." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        The server paints the plain target number, so hydration is a no-op.
        The client upgrades each digit slot to a vertical strip on mount and
        lets a single GPU-composited <code className="inline-code">translateY</code>{" "}
        do the work. Column widths are tabular-num locked, so a change from{" "}
        <code className="inline-code">199</code> to <code className="inline-code">200</code>{" "}
        never shoves a neighbouring badge around.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, the
        transitions are skipped and the number snaps to the new value.
      </p>
    </>
  );
}
