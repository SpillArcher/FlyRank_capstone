import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display-src",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-src",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-src",
});

export const metadata: Metadata = {
  title: "Stylist",
  description: "An AI stylist that reads your mood, not your filters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <header className="border-b border-border px-6 py-4">
          <p className="font-display text-lg font-semibold text-ink">
            Stylist
          </p>
        </header>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
