// The other half of the release gate: the built files, loaded the way an
// application would load them. One bug class this catches is a bundle that
// exports the components under one format and not the other, which nobody
// notices until someone installs swash in a CommonJS project. The other is a
// stray dependency that turns "zero runtime deps" into a claim in the readme
// that is no longer true.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";

const NAMES = [
  "Counter",
  "Frame",
  "Marker",
  "Morph",
  "Reveal",
  "Scramble",
  "Typewriter",
  "Ticker",
  "Shimmer",
  "BlurReveal",
  "FlipWords",
  "Glitch",
  "CurvedText",
  "Wave",
];

/** Anything that is not a relative path has to be React and only React. */
const BARE_OK = /^react(-dom)?(\/.*)?$/;

const esmPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const cjsPath = fileURLToPath(new URL("../dist/index.cjs", import.meta.url));

let problems = 0;
const report = (problem) => {
  console.error(problem);
  problems++;
};

// An absolute Windows path is not a URL, and import() wants a URL.
const esm = await import(pathToFileURL(esmPath).href);
const cjs = createRequire(import.meta.url)(cjsPath);

for (const [label, bundle] of [["esm", esm], ["cjs", cjs]]) {
  for (const name of NAMES) {
    if (typeof bundle[name] !== "function") report(`${label} dist does not export ${name}`);
  }
}

// The source files declare "use client", but a bundler is free to drop a
// directive that is not on a module of its own, and the file that ships is the
// one a framework reads. A bundle without the line stops being a client
// boundary, so a Next.js server component that renders one of these gets an
// invariant violation instead of a component.
for (const [label, file] of [["esm", esmPath], ["cjs", cjsPath]]) {
  const head = readFileSync(file, "utf8").slice(0, 200);
  const boundary = '"use client";';
  if (!head.startsWith(boundary)) report(`${label} dist does not open with the client directive`);
}

const code = readFileSync(esmPath, "utf8");
const specifiers = [...code.matchAll(/from\s+"([^"]+)"|import\s+"([^"]+)"/g)]
  .map((match) => match[1] ?? match[2]);
for (const specifier of specifiers) {
  if (specifier.startsWith(".") || specifier.startsWith("/")) continue;
  if (!BARE_OK.test(specifier)) report(`unexpected runtime dependency: ${specifier}`);
}

const kb = (file) => Math.round(readFileSync(file).byteLength / 1024);
const [esmKb, cjsKb] = [kb(esmPath), kb(cjsPath)];
// The spec sets no budget, so this is a tripwire rather than a target: a bundle
// that grows past this has probably grown a dependency or a second copy of
// something, and that is worth a look before it ships.
const LIMIT_KB = 90;
if (esmKb > LIMIT_KB) report(`esm dist is ${esmKb} KB, over the ${LIMIT_KB} KB tripwire`);

if (problems > 0) {
  console.error(`\n${problems} smoke problem(s).`);
  process.exit(1);
}
console.log(`smoke: ${NAMES.length} exports in both formats, client boundary intact, no dependencies, ${esmKb} KB esm / ${cjsKb} KB cjs`);
