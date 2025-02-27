"use client";
import { ThemeProvider } from "next-themes";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      value={{ dark: "dark", light: "light" }}
    >
      {children}
    </ThemeProvider>
  );
}
