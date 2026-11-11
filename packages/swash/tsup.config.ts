import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  external: ["react", "react-dom"],
  // Bundling seven client components into one file drops their per-file
  // directives, and the shipped file is the one a framework reads. The line
  // goes back on the bundle so an app can render these from a server component.
  // The extra rollup pass has to go with it: it is the pass that throws the
  // directive away again, and an application's bundler already tree-shakes
  // through `sideEffects`, so nothing is lost but a duplicate of that job.
  banner: { js: '"use client";' },
});
