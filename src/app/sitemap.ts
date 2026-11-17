import type { MetadataRoute } from "next";

const siteUrl = "https://arenagg.live";

// Keep the sitemap limited to stable informational pages.
// The homepage contains live tournament listings, and tournament/result/
// registration routes are intentionally not advertised for search indexing.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
  ];
}
