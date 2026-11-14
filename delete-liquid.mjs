import fs from "node:fs";
import { rmSync } from "node:fs";
import { execSync } from "node:child_process";

const read = (f) => fs.readFileSync(f, "utf8");
const write = (f, s) => fs.writeFileSync(f, s);

// --- package: source, tests
rmSync("packages/swash/src/liquid", { recursive: true, force: true });
rmSync("packages/swash/tests/liquid", { recursive: true, force: true });

// --- index.ts
let idx = read("packages/swash/src/index.ts");
idx = idx.replace(/export \{ Liquid \} from "\.\/liquid\/Liquid";\r?\n/, "");
idx = idx.replace(/export type \{ LiquidProps, LiquidTrigger \} from "\.\/liquid\/types";\r?\n/, "");
write("packages/swash/src/index.ts", idx);

// --- gates + smoke
let gates = read("packages/swash/scripts/gates.mjs");
gates = gates.replace(/\s*"liquid",/, "");
write("packages/swash/scripts/gates.mjs", gates);
let smoke = read("packages/swash/scripts/smoke.mjs");
smoke = smoke.replace(/\s*"Liquid",/, "");
write("packages/swash/scripts/smoke.mjs", smoke);

// --- README: table row, section, counts
let rd = read("packages/swash/README.md");
rd = rd.replace(/\| \[Liquid\]\(#liquid\) [^\n]*\r?\n/, "");
{
  const start = rd.indexOf("## Liquid");
  const end = rd.indexOf("## Echo");
  if (start !== -1 && end !== -1 && end > start) rd = rd.slice(0, start) + rd.slice(end);
}
rd = rd.replace("about 110 KB of ESM before gzip", "about 105 KB of ESM before gzip");
write("packages/swash/README.md", rd);

// --- docs: page, sidebar, pager, landing, demos, demo-code, presets, gallery
rmSync("apps/docs/app/docs/liquid", { recursive: true, force: true });

let dl = read("apps/docs/app/docs/layout.tsx");
dl = dl.replace(/\s*\{ href: "\/docs\/liquid", label: "Liquid" \},/, "");
write("apps/docs/app/docs/layout.tsx", dl);

let pg = read("components/docs-pager.tsx");
pg = pg.replace(/\s*\{ href: "\/docs\/liquid", title: "Liquid" \},/, "");
write("components/docs-pager.tsx", pg);

let home = read("apps/docs/app/page.tsx");
home = home.replace(/  \{\r?\n    name: "Liquid",[\s\S]*?span: 1 as const,\r?\n  \},\r?\n/, "");
home = home.replace("Twenty components, one engine", "Nineteen components, one engine");
home = home.replace("About 110 KB of ESM for all twenty, unminified", "About 105 KB of ESM for all nineteen, unminified");
home = home.replace("One install, twenty components, zero dependencies.", "One install, nineteen components, zero dependencies.");
write("apps/docs/app/page.tsx", home);

let demos = read("components/demos.tsx");
demos = demos.replace(/\s*Liquid,/g, "");
{
  const a = demos.indexOf("/** Liquid: the loop pours, holds and drains. */");
  const b = demos.indexOf("/** Slice: the loop parts the halves and closes them. */");
  if (a !== -1 && b !== -1 && b > a) demos = demos.slice(0, a) + demos.slice(b);
}
write("components/demos.tsx", demos);

let dc = read("components/demo-code.ts");
dc = dc.replace(/,?\s*"Liquid — pour, hold, drain": `<span[^`]*`/, "");
dc = dc.replace(/,?\s*"Liquid — rises on view": `<span[^`]*`/, "");
write("components/demo-code.ts", dc);

let pr = read("components/example-presets.ts");
{
  const a = pr.indexOf('    id: "liquid"');
  const b = pr.indexOf("  {", pr.indexOf("code:", a));
  if (a !== -1 && b !== -1 && b > a) pr = pr.slice(0, a) + pr.slice(b);
}
write("components/example-presets.ts", pr);

let gal = read("components/example-gallery.tsx");
gal = gal.replace(/\s*Liquid,/g, "");
gal = gal.replace(/\s*liquid: LiquidBody,/, "");
{
  const a = gal.indexOf("function LiquidBody() {");
  const b = gal.indexOf("function EchoBody() {");
  if (a !== -1 && b !== -1 && b > a) gal = gal.slice(0, a) + gal.slice(b);
}
write("components/example-gallery.tsx", gal);

let lay = read("apps/docs/app/layout.tsx");
lay = lay.replace('"Twenty ready-made, dependency-free text effect components', '"Nineteen ready-made, dependency-free text effect components');
lay = lay.replace("swash v1.1 is out — twenty components, zero dependencies", "swash v1.1 is out — nineteen components, zero dependencies");
write("apps/docs/app/layout.tsx", lay);

let qs = read("apps/docs/app/docs/quickstart/page.tsx");
qs = qs.replace("It weighs about 110 KB for all twenty components", "It weighs about 105 KB for all nineteen components");
write("apps/docs/app/docs/quickstart/page.tsx", qs);

console.log("liquid removed everywhere");
