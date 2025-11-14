import Header from "@/components/nav/navbar";
import { SessionSync } from "@/components/nav/session-refetch";
import { WrapperWithQuery } from "@/components/wrapper";
import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Auth - Kapil Chaudhary",
};

const geistmono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f1f5f9" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${geistmono.variable}`}
      suppressHydrationWarning
    >
      <body className={"min-w-full w-full scroll-x-none antialiased"}>
        <svg
          className="pointer-events-none fixed top-0 left-0 isolate z-50 opacity-25 dark:opacity-[0.15] mix-blend-normal"
          width="100%"
          height="100%"
        >
          <filter id="pedroduarteisalegend">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.80"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#pedroduarteisalegend)"
          ></rect>
        </svg>
        <Suspense>
          <Header />
          <SessionSync />
        </Suspense>
        <main className="max-w-5xl w-full mx-auto px-0 sm:px-6 lg:px-8 py-2">
          <WrapperWithQuery>{children}</WrapperWithQuery>
        </main>
        <Toaster expand richColors />
      </body>
    </html>
  );
}
