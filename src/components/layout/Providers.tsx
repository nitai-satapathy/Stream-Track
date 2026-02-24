"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/layout/theme-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
