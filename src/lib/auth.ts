import { supabaseServer } from '@/lib/supabase/server';

export type AdminCtx = {
  user: { id: string; email?: string };
  role: 'super_admin' | 'organizer';
  sb: ReturnType<typeof supabaseServer>;
};

/** Server-side permission check: valid session, explicit admin row and (by default) AAL2 TOTP. */
export async function getAdmin(options: { requireMfa?: boolean } = {}): Promise<AdminCtx | null> {
  const sb = supabaseServer();
  const { data: { user }, error: userError } = await sb.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await sb
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error || !data) return null;

  if (options.requireMfa !== false) {
    const [{ data: factors, error: factorsError }, { data: assurance, error: assuranceError }] =
      await Promise.all([
        sb.auth.mfa.listFactors(),
        sb.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
    const verifiedTotp = !factorsError && Boolean(
      factors?.totp?.some((factor) => factor.status === 'verified')
    );
    if (!verifiedTotp || assuranceError || assurance?.currentLevel !== 'aal2') return null;
  }

  return { user, role: data.role, sb };
}
