import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://arenagg.live";

// Structured data uses only verified public facts and official URLs.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ARENAGG",
      url: siteUrl,
      description: "ARENAGG is an independent community esports platform in India for discovering and joining online community tournaments featuring Free Fire MAX, BGMI and Valorant, and viewing published results.",
      knowsAbout: ["Community esports tournaments", "Online gaming tournaments in India", "Free Fire MAX", "BGMI", "Valorant", "Tournament registration", "Esports results and standings"],
      sameAs: ["https://whatsapp.com/channel/0029VbEYQeV6mYPQJ4YFF62Q"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "ARENAGG",
      url: siteUrl,
      description: "Discover online community esports tournaments in India for Free Fire MAX, BGMI and Valorant.",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Online Esports Tournaments in India | ARENAGG",
    template: "%s | ARENAGG",
  },
  description:
    "Join online community esports tournaments in India for Free Fire MAX, BGMI and Valorant. Browse events, formats, rules, entry fees and published results on ARENAGG.",
  keywords: [
    "online esports tournaments India",
    "online gaming tournaments India",
    "community esports tournaments",
    "mobile esports tournaments India",
    "Free Fire MAX tournaments",
    "BGMI tournaments",
    "Valorant community tournaments",
    "gaming competitions India",
    "esports tournament registration",
    "ARENAGG",
  ],
  applicationName: "ARENAGG",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ARENAGG", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: [{ url: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ARENAGG",
    title: "Online Esports Tournaments in India | ARENAGG",
    description:
      "Discover community esports tournaments for Free Fire MAX, BGMI and Valorant, with event updates and published results.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Online Esports Tournaments in India | ARENAGG",
    description:
      "Explore online community esports tournaments in India for Free Fire MAX, BGMI and Valorant, and view published results.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="96x96" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/pwa-icon-192.png" />
        <meta name="theme-color" content="#050b18" />
      </head>
      <body className="min-h-screen bg-[#050b18] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\u003c"),
          }}
        />
        {children}
      </body>
    </html>
