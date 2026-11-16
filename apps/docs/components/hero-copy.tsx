"use client";

import { DirectionSelect, Word } from "./direction-select";

/** The hero headline + subline as selectable "layers", exactly like
 * Aceternity's Direction Aware Selection. Kept in one client tree so the
 * selection context reaches every Word. */
export function HeroCopy() {
  return (
    <>
      <h1>
        <DirectionSelect>
          <Word>Text</Word> <Word>that</Word> <Word>moves</Word>{" "}
          <Word>the</Word> <Word>way</Word> <Word>readers</Word>{" "}
          <Word>already</Word> <Word>do</Word>.
        </DirectionSelect>
      </h1>
      <p className="sub">
        <DirectionSelect>
          <Word>No</Word> <Word>animation</Word> <Word>library</Word>.{" "}
          <Word>No</Word> <Word>layout</Word> <Word>shift</Word>.{" "}
          <Word>Motion</Word> <Word>that</Word> <Word>always</Word>{" "}
          <Word>has</Word> <Word>a</Word> <Word>fallback</Word>.
        </DirectionSelect>
      </p>
    </>
  );
}
