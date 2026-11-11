"use client";

import { useState } from "react";
import {
  Counter,
  Frame,
  Marker,
  Morph,
  Reveal,
  Scramble,
  Typewriter,
} from "swash";
import { Preview } from "./preview";

export function TypewriterDemo() {
  return (
    <Preview label="Typewriter loop + feel">
      <Typewriter
        loop={[
          "The quick brown fox.",
          "Graphemes, not code units. 🦊👩‍👩‍👧‍👦",
          "Reduced motion prints it all at once.",
        ]}
        feel="snappy"
      />
    </Preview>
  );
}

export function FrameDemo() {
  return (
    <Preview label="Frame with label and sweep">
      <Frame label="selected" duration={900}>
        <span style={{ padding: "6px 14px" }}>Any element gets the frame.</span>
      </Frame>
    </Preview>
  );
}

export function RevealDemo() {
  return (
    <Preview label="Reveal by word, then by letter">
      <Reveal by="word" stagger={70}>
        Words arrive one after another.
      </Reveal>
      <Reveal by="letter" stagger={28} style={{ color: "var(--text-2)", fontSize: "0.8em" }}>
        Letters can, too.
      </Reveal>
    </Preview>
  );
}

const SCRAMBLE_TARGETS = ["Decode this line.", "Then this one.", "And this."];

export function ScrambleDemo() {
  const [i, setI] = useState(0);
  return (
    <Preview label="Scramble trigger=prop">
      <Scramble text={SCRAMBLE_TARGETS[i]} trigger="prop" />
      <button
        type="button"
        className="preview-replay"
        onClick={() => setI((n) => (n + 1) % SCRAMBLE_TARGETS.length)}
      >
        Next line
      </button>
    </Preview>
  );
}

export function MorphDemo() {
  return (
    <Preview label="Morph with width compensation">
      <Morph values={["smooth", "snappy", "cinematic", "yours"]} hold={900} />
    </Preview>
  );
}

export function CounterDemo() {
  return (
    <Preview label="Counter with prefix and format">
      <Counter to={12450} prefix="$" duration={1800} startOnView={false} />
      <Counter to={100} suffix="%" duration={900} startOnView={false} />
    </Preview>
  );
}

export function MarkerDemo() {
  return (
    <Preview label="Marker highlight, underline, circle">
      <Marker action="highlight" color="amber" show>
        Highlighted words
      </Marker>
      <Marker action="underline" color="sky" show delay={300}>
        underlined words
      </Marker>
      <Marker action="circle" color="rose" show delay={600}>
        circled
      </Marker>
    </Preview>
  );
}
