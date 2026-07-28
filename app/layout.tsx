import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Kargo360 — Revolutionizing Air Cargo",
  description:
    "Manage and gain real-time visibility into your complete cargo value chain. The next-gen SaaS platform for faster, smarter air cargo logistics.",
  metadataBase: new URL("https://kargo360.ai"),
  openGraph: {
    title: "Kargo360 — Revolutionizing Air Cargo",
    description:
      "Real-time visibility into your complete air cargo value chain. Faster, smarter logistics.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SmoothScroll>
          <Nav />
          <main>{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
