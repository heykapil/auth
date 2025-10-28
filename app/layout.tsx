import Header from "@/components/nav/navbar";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Auth - Kapil Chaudhary",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense>
          <Header />
        </Suspense>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
