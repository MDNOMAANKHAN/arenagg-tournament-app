import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://arenagg.live";

// Keep structured data limited to verified information about the website.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ARENAGG",
      url: siteUrl,
      description: "ARENAGG is an independent community esports website.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "ARENAGG",
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: "ARENAGG | Esports Tournaments & Community Gaming",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ARENAGG | Esports Tournaments & Community Gaming",
    template: "%s | ARENAGG",
  },
  description:
    "Discover the ARENAGG gaming community, featuring Free Fire MAX, BGMI and Valorant. Explore community information, tournament updates and published results.",
  applicationName: "ARENAGG",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ARENAGG",
    title: "ARENAGG | Esports Tournaments & Community Gaming",
    description:
      "Explore the ARENAGG gaming community, game information and published competition results.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "ARENAGG | Esports Tournaments & Community Gaming",
    description:
      "Explore the ARENAGG gaming community, game information and published results.",
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
      <body className="min-h-screen bg-[#050b18] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
