import { Navbar } from "@/components/nav/navbar";
import { Providers } from "@/components/theme/provider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Authentication",
  description: "Auth - Kapil Chaudhary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
        <Navbar />
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
          <rect width="100%" height="100%" filter="url(#pedroduarteisalegend)"></rect>
        </svg>
        <main className="container py-6">
               {children}
         </main>
        <Toaster />
        </Providers>
      </body>
    </html>
  );
}
