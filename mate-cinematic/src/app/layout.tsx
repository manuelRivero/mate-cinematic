import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Outfit } from "next/font/google";
import SmoothScroll from "../components/SmoothScroll";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const label = Outfit({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Mate Imperial — Negro Absoluto",
  description:
    "Pieza de autor en cuero negro, alpaca cincelada y bronce. Experiencia cinematográfica del Mate Imperial.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${label.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-[#050505] text-[#e8e6e1]">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
