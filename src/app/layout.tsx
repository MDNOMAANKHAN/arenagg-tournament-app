import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://arenagg.live";

// Factual identifiers for search engines and structured-data consumers.
// Only verified brand and website details are included.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "${siteUrl}/#organization",
      "name": "ARENAGG",
      "url": siteUrl,
      "description": "ARENAGG is a community esports website."
    },
    {
      "@type": "WebSite",
      "@id": "${siteUrl}/#website",
      "name": "ARENAGG",
      "url": siteUrl,
      "publisher": { "@id": "${siteUrl}/#organization" },
      "inLanguage": "en-IN"
    }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ARENAGG | Esports Tournaments & Community Gaming",
    template: "%s | ARENAGG",
  },
  description:
    "Discover and join community esports tournaments for Free Fire MAX, BGMI and Valorant on ARENAGG. Explore competitions, tournament rules, schedules and results.",
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
      "Find community tournaments for Free Fire MAX, BGMI and Valorant. Compete with your team on ARENAGG.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "ARENAGG | Esports Tournaments & Community Gaming",
    description:
      "Discover community esports tournaments for Free Fire MAX, BGMI and Valorant.",
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
    <html lang="en">
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
