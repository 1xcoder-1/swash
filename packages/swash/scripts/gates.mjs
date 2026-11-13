// The rules that are easy to break by accident and impossible to notice in a
// diff: a component that loses its "use client" works in the demo and throws on
// a Next.js server, and a text.split("") turns every family emoji into two
// broken halves somewhere a test was never written for.
//
// Run through `pnpm --filter swash check`, which is what CI runs.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src", import.meta.url));

/** Folders that hold a component, and so hold the file people import. */
const COMPONENTS = [
  "typewriter",
  "frame",
  "reveal",
  "scramble",
  "morph",
  "counter",
  "marker",
  "ticker",
  "shimmer",
  "blur-reveal",
  "flip-words",
  "glitch",
  "curved-text",
  "wave",
];

let violations = 0;
const report = (problem) => {
  console.error(problem);
  violations++;
};

const sep = SRC.includes("\\") ? "\\" : "/";

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) {
      if (!name.includes("test")) walk(file);
      continue;
    }
    if (!/\.tsx?$/.test(name) || name.includes(".test.")) continue;
    const code = readFileSync(file, "utf8");
    const isComponent = COMPONENTS.some((folder) => file.split(sep).includes(folder));
    const isEntry = isComponent && name.endsWith(".tsx");

    // Only the file a person imports has to declare itself client code; a
    // helper it pulls in is already on that side of the boundary.
    if (isEntry && !code.startsWith('"use client"')) {
      report(`missing "use client": ${file}`);
    }
    if (/\bsplit\(['"]{2}\)/.test(code)) {
      report(`split('') cuts grapheme clusters, use splitGraphemes: ${file}`);
    }
  }
}

walk(SRC);

if (violations > 0) {
  console.error(`\n${violations} gate violation(s).`);
  process.exit(1);
}
console.log("gates: every component declares use client, nothing splits strings");
