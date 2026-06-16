import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import PageTransition from "@/components/layout/PageTransition";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KnownIssues.co.uk — Know exactly what you're buying",
  description:
    "Expert used car buyers guides written by real owners. No fluff, no filler — just the known issues, common faults, and honest advice you need before handing over your money.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} font-body antialiased bg-background text-text-primary`}
      >
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
