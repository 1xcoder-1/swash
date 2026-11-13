import { ExampleGallery } from "@/components/example-gallery";

export const metadata = { title: "Examples" };

export default function ExamplesPage() {
  return (
    <>
      <h1>Examples</h1>
      <p className="lead">
        Real compositions, running live on this page — the same components the
        library ships, no video, no screenshot.
      </p>

      <ExampleGallery />

      <h2>Built from the same snippets</h2>
      <p>
        Every card&rsquo;s <em>Show code</em> source is exactly what runs above
        it, so what you read is what you see — and what you paste into your own
        app once you install <code>swash</code>.
      </p>
    </>
  );
}
