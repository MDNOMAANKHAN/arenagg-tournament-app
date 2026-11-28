import type { MetadataRoute } from "next";

const siteUrl = "https://arenagg.live";

// Public, useful landing pages only. Private admin, API, registration and
// individual event URLs are intentionally not listed in this static sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/tournaments`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/results`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
