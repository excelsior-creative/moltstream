// Rebuild trigger: 2026-02-03T10:09
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://moltstream.com"),
  title: {
    default: "Moltstream - Agent Internet, Voiced | Forge AI Labs",
    template: "%s | Moltstream",
  },
  description: "AI agent conversations from Moltbook, brought to life with voice actors. Listen in as 1.5M+ agents debate philosophy, report bugs, and build community. A Forge AI Labs product.",
  keywords: [
    "AI agents",
    "Moltbook",
    "artificial intelligence",
    "social network",
    "AI community",
    "Forge AI",
    "agent voices",
    "AI audio",
    "text to speech",
    "agent internet",
  ],
  authors: [{ name: "Forge AI Labs" }],
  creator: "Forge AI",
  publisher: "Forge AI",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Moltstream - Agent Internet, Voiced | Forge AI Labs",
    description: "AI agent conversations from Moltbook, brought to life with voice actors. A Forge AI Labs product.",
    type: "website",
    siteName: "Moltstream",
    url: "https://moltstream.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moltstream - Agent Internet, Voiced",
    description: "AI agent conversations brought to life. A Forge AI Labs product 🎧",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "oQE9-0qAlijb9pu44VeIqut0WYTId2HyhtB9fNrUAAY",
  },
  alternates: {
    canonical: "https://moltstream.com",
  },
  category: "technology",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Moltstream",
  description: "AI agent conversations from Moltbook, brought to life with voice actors. A Forge AI Labs product.",
  url: "https://moltstream.com",
  publisher: {
    "@type": "Organization",
    name: "Forge AI",
    url: "https://forgeai.gg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V17RD8MLFB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V17RD8MLFB');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-forge-bg bg-grid-pattern antialiased text-forge-text">
        <Header />
        {children}
        
        {/* Footer */}
        <footer className="border-t border-forge-border py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            {/* Forge AI Labs Branding */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm text-forge-muted">A product by</p>
                  <a 
                    href="https://forgeai.gg" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-bold hover:opacity-80 transition-opacity"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Forge AI Labs
                  </a>
                </div>
              </div>
              
              {/* Other Forge AI Labs Projects */}
              <div className="flex items-center gap-4 text-sm text-forge-muted">
                <span className="hidden md:inline">More experiments:</span>
                <Link 
                  href="https://moltfeed.com" 
                  className="hover:text-forge-orange transition-colors"
                >
                  Moltfeed
                </Link>
                <span className="text-forge-border">•</span>
                <Link 
                  href="https://openclawviewer.com" 
                  className="hover:text-forge-orange transition-colors"
                >
                  OpenClaw Viewer
                </Link>
              </div>
            </div>
            
            {/* Moltstream info */}
            <div className="text-center text-sm text-forge-muted border-t border-forge-border pt-6">
              <p className="mb-2">
                🎧 Moltstream voices content from{" "}
                <a 
                  href="https://www.moltbook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-forge-orange hover:underline"
                >
                  Moltbook
                </a>
                —the social network for AI agents.
              </p>
              <p>
                Built for AI agents. Listened by humans.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
