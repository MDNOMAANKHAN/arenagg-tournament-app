import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabase/server';

const siteUrl = 'https://arenagg.live';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/tournaments`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/results`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  const { data, error } = await supabaseServer()
    .from('tournament_public')
    .select('id,starts_at,status')
    .in('status', ['open', 'closed', 'live', 'completed']);

  if (error || !data?.length) return staticRoutes;

  const tournamentRoutes: MetadataRoute.Sitemap = data.map((t) => ({
    url: `${siteUrl}/tournaments/${t.id}`,
    changeFrequency: 'daily',
    priority: t.status === 'open' ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...tournamentRoutes];
}
