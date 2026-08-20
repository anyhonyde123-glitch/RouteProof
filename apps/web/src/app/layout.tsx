import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { Footer, Header } from "@/components/layout/AppShell";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RouteProof — Decentralized Shipment Custody on Stellar",
  description:
    "Proof-of-handoff and shipment custody verification powered by Stellar Soroban smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${sourceSans.variable}`}>
      <body className="font-body antialiased">
        <Providers>
          <div className="relative min-h-screen bg-navy-950 text-slate-100">
            <div className="pointer-events-none fixed inset-0 bg-grid-pattern bg-grid opacity-40" />
            <div className="pointer-events-none fixed inset-0 bg-hero-radial" />
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
