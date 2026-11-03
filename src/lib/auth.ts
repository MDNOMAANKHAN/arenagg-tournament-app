import { supabaseServer } from '@/lib/supabase/server';
export type AdminCtx = { user: { id: string; email?: string }; role: 'super_admin' | 'organizer'; sb: ReturnType<typeof supabaseServer> };
/** Server-side permission check: valid session AND a row in public.admins. */
export async function getAdmin(): Promise<AdminCtx | null> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from('admins').select('role').eq('user_id', user.id).maybeSingle();
  return data ? { user, role: data.role, sb } : null;
}
