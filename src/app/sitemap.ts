import type { MetadataRoute } from "next";

const siteUrl = "https://arenagg.live";

// Search indexing is focused on stable community and informational pages.
// Tournament listings and individual event pages remain accessible to visitors,
// but are intentionally excluded from organic search indexing.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/results`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
  ];
}
