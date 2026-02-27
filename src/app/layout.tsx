import type { Metadata } from "next";
import { Inter, Space_Grotesk, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/layout/Providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Footer from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://stream-track.vercel.app"),
  alternates: {
    canonical: "/",
  },
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
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Stream Track Open Graph Image",
      },
    ],
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
  keywords: ["movies", "tv shows", "web series", "web series tracker", "tv tracker", "movie tracker", "tracker", "best movie or tv tracker", "stream track", "watchlist", "entertainment", "tmdb", "nextjs"],
  authors: [{ name: "Nitai Satapathy", url: "https://github.com/nitai-satapathy" }],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Stream Track",
    "url": "https://stream-track.vercel.app",
    "description": "Track movies and TV shows effortlessly.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://stream-track.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${playfair.variable} font-body antialiased selection:bg-primary/20 hover:selection:bg-primary/30`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Footer />
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
