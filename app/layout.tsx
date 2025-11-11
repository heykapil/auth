import Header from "@/components/nav/navbar";
import { SessionSync } from "@/components/nav/session-refetch";
import { WrapperWithQuery } from "@/components/wrapper";
import type { Metadata } from "next";
import { Linden_Hill } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";
export const metadata: Metadata = {
  title: "Authentication",
  description: "Auth - Kapil Chaudhary",
};
const font = Linden_Hill({
  weight: ["400"],
  subsets: ["latin", "latin-ext"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <Suspense>
          <Header />
          <SessionSync />
        </Suspense>
        <main className="max-w-5xl w-full mx-auto px-0 sm:px-6 lg:px-8 py-2">
          <WrapperWithQuery>{children}</WrapperWithQuery>
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
