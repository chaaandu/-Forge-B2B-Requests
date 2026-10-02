import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import { RequestListProvider } from "@/lib/request-list";
import { allFounders } from "@/lib/founders";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RequestDrawer } from "@/components/request/request-drawer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Cursor } from "@/components/motion/cursor";
import { Preloader } from "@/components/motion/preloader";
import { TransitionProvider } from "@/components/motion/transition";
import "./globals.css";

// Manrope (Mesa's typeface) for the interface; Fraunces for the voice, whose
// SOFT and WONK axes give headlines a hand a geometric sans never has.
const manrope = localFont({ src: "../fonts/manrope-latin-var.woff2", variable: "--font-manrope", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Forge for Business · every gift here is someone's first company", template: "%s · Forge for Business" },
  description:
    "Corporate gifts made by 117 student founders at Mesa School of Business. Hampers, snacks, candles, apparel. Your gifting budget becomes their revenue.",
};

// Runs before first paint: the intro plays once per session, never with
// reduced motion. Marking <html> here (not in React) is what stops a flash
// of the page underneath on the first visit and of the intro on every other.
const INTRO = `try{if(!sessionStorage.getItem("forge-intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro")}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const introFaces = allFounders()
    .filter((_, i) => i % 9 === 0)
    .slice(0, 12)
    .map((f) => f.photo);
  return (
    <html lang="en-IN" className={`${manrope.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO }} />
      </head>
      <body className="min-h-dvh">
        <RequestListProvider>
          <TransitionProvider>
            <SmoothScroll />
            <Header />
            <main>{children}</main>
            <Footer />
            <RequestDrawer />
            <Cursor />
          </TransitionProvider>
        </RequestListProvider>
        <Preloader faces={introFaces} total={allFounders().length} />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
