import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import { InstallTabs } from "@/components/install-tabs";
import { PropsTable } from "@/components/props-table";
import {
  MorphDemo,
  MorphStepDemo,
  PhraseDemo,
  SpringDemo,
  ToneDemo,
} from "@/components/demos";

export const metadata = { title: "Morph" };

export default function MorphPage() {
  return (
    <>
      <h1>Morph</h1>

      <h2>Overview</h2>
      <p className="lead">
        One word becomes the next — whole graphemes transitioning in place, with
        the line width compensated so nothing around it shifts.
      </p>

      <MorphDemo />
      <MorphStepDemo />

      <h2>Character continuity</h2>
      <p>
        The same behaviour one level deeper: shared characters stay put and only
        what changed moves. A sentence re-types itself, a rewrite reflows without
        a layout jump, and a change of pace is one prop away — all on the
        dependency-free <code className="inline-code">Morph</code>, no separate
        library.
      </p>
      <PhraseDemo />
      <ToneDemo />
      <SpringDemo />

      <CodeTabs
        js={`import { Morph } from "swash";

// A sentence rewriting itself in place:
<Morph values={["Running late.", "Almost there, hold tight."]} loop={false} step={i} />

// A quicker, tighter swap:
<Morph values={["Settled", "Bouncy", "Gentle"]} loop={false} step={i} duration={450} />`}
        ts={`import { Morph, type MorphProps } from "swash";

const phrases: MorphProps["values"] = ["Running late.", "Almost there, hold tight."];

<Morph values={phrases} loop={false} step={i} />`}
      />

      <h2>Installation</h2>
      <InstallTabs />
      <CodeBlock copy='import { Morph } from "swash";' />

      <h2>Usage</h2>
      <p>Give it a list of words — it morphs between them in place:</p>
      <CodeTabs
        js={`<Morph values={["fast", "focused", "finished"]} hold={1100} />\n\n// Or drive it from your own state:\n<Morph values={steps} loop={false} step={current} onMorphed={report} />`}
        ts={`import { Morph, type MorphProps } from "swash";\n\nconst values: MorphProps["values"] = ["fast", "focused", "finished"];\n\n<Morph values={values} hold={1100} />\n\n// Or drive it from your own state:\n<Morph values={steps} loop={false} step={current} onMorphed={report} />`}
      />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "values", type: "string[]", desc: "The words to move between. Fewer than two and there is nothing to morph." },
          { name: "duration", type: "number", desc: "How long one swap takes, in ms." },
          { name: "hold", type: "number", desc: "How long the word sits still before the next swap." },
          { name: "loop", type: "boolean", desc: "Keep going through the list, or step once." },
          { name: "step", type: "number", desc: "Which value to be on, for a list that is paged rather than looped." },
          { name: "onMorphed", type: "(value, index) => void", desc: "Fires after each swap lands." },
        ]}
      />

      <h2>Why it is different</h2>
      <p>
        Transitions happen per grapheme — a family emoji becomes another family
        emoji as a unit, never as scrambled halves — and the swap compensates
        for width mid-flight, so a headline next to the morphing word does not
        jitter every cycle.
      </p>
      <p>
        With <code className="inline-code">prefers-reduced-motion</code>, words
        snap between values with no in-between frames.
      </p>
    </>
  );
}
