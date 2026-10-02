import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import { RequestListProvider } from "@/lib/request-list";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RequestDrawer } from "@/components/request/request-drawer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Cursor } from "@/components/motion/cursor";
import "./globals.css";

// Manrope (Mesa's typeface) for the interface; Fraunces for the voice — its
// SOFT and WONK axes give headlines a hand that a geometric sans never has.
const manrope = localFont({ src: "../fonts/manrope-latin-var.woff2", variable: "--font-manrope", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Forge for Business — every gift here is someone's first company", template: "%s · Forge for Business" },
  description:
    "Corporate gifts made by 117 student founders at Mesa School of Business. Shortlist hampers, snacks, candles and apparel for your team, and your gifting budget becomes their revenue.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh">
        <RequestListProvider>
          <SmoothScroll />
          <Header />
          <main>{children}</main>
          <Footer />
          <RequestDrawer />
          <Cursor />
          <div className="grain" aria-hidden />
        </RequestListProvider>
      </body>
    </html>
  );
}
