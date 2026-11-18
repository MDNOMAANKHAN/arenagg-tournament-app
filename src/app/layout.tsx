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
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ARENAGG | Gaming Community & Game Updates",
    template: "%s | ARENAGG",
  },
  description:
    "Explore ARENAGG community information for players interested in Free Fire MAX, BGMI and Valorant, including game updates and published community results.",
  applicationName: "ARENAGG",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ARENAGG",
    title: "ARENAGG | Gaming Community & Game Updates",
    description:
      "Explore ARENAGG community information, game updates and published results.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "ARENAGG | Gaming Community & Game Updates",
    description:
      "Explore ARENAGG community information, game updates and published results.",
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
      </head>
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
