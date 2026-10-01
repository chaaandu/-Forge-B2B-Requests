import type { Metadata } from "next";
import localFont from "next/font/local";
import { RequestListProvider } from "@/lib/request-list";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RequestDrawer } from "@/components/request/request-drawer";
import "./globals.css";

// Self-hosted Manrope, Mesa's typeface, for everything: one family set at
// different weights reads calmer than a serif/sans pairing.
const manrope = localFont({ src: "../fonts/manrope-latin-var.woff2", variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Mesa Forge for Business · Gifting & bulk orders from student-founded brands",
    template: "%s · Mesa Forge for Business",
  },
  description:
    "Corporate gifting, festive hampers, onboarding kits and pantry supplies from brands built by founders at Mesa School of Business. Browse, shortlist, and send us a request.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={manrope.variable}>
      <body className="min-h-dvh">
        <RequestListProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <RequestDrawer />
        </RequestListProvider>
      </body>
    </html>
  );
}
