import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/layout/Providers";
import { Analytics } from "@vercel/analytics/next";

import Footer from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://stream-track.vercel.app"),
  title: {
    default: "Stream Track",
    template: "%s | Stream Track",
  },
  description:
    "Track What You Watch. Love What You Watch. Never Forget a Single Show. Your personal movie and TV show tracker.",
  openGraph: {
    title: "Stream Track",
    description: "Track What You Watch. Love What You Watch. Never Forget a Single Show.",
    url: "https://stream-track.vercel.app",
    siteName: "Stream Track",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stream Track",
    description: "Track What You Watch. Love What You Watch. Never Forget a Single Show.",
  },
  verification: {
    google: "zDxLKnLUiTry_Rq6eGq00tQcZQqu8Co-ffMzJk56B_U",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Footer />
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  );
}
