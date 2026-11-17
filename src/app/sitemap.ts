import type { MetadataRoute } from "next";
import { supabaseServer } from "@/lib/supabase/server";

const siteUrl = "https://arenagg.live";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Include stable public pages. Avoid assigning a fresh lastModified date
  // on every request because that would misrepresent when static pages changed.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/tournaments`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/results`, changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    const { data, error } = await supabaseServer()
      .from("tournament_public")
      .select("id,status")
      .in("status", ["open", "closed", "live", "completed"]);

    if (error || !data?.length) return staticRoutes;

    const tournamentRoutes: MetadataRoute.Sitemap = data.map((t) => ({
      url: `${siteUrl}/tournaments/${t.id}`,
      changeFrequency: "weekly",
      priority: t.status === "open" || t.status === "live" ? 0.7 : 0.5,
    }));

    return [...staticRoutes, ...tournamentRoutes];
  } catch {
    // Keep the sitemap available even if the public database view is
    // temporarily unavailable.
    return staticRoutes;
  }
}
