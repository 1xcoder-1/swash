import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "swash — text effects for React",
    template: "%s — swash",
  },
  description:
    "Seven ready-made, dependency-free text effect components for React. Grapheme-safe, reduced-motion aware, SSR friendly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="banner">
          <span className="pill">New</span>
          <Link href="/docs/quickstart">
            swash v1 is out — fourteen components, zero dependencies →
          </Link>
        </div>
        <div className="sheet-page">
          <div className="sheet">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
