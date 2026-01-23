import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";

import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Stream Track",
  description:
    "Track What You Watch. Love What You Watch. Never Forget a Single Show.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
