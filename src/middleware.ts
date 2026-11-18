import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof res.cookies.set>[2];
  };

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: CookieToSet[]) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const p = req.nextUrl.pathname;
  const isLoginPage = p === '/admin/login';
  const isMfaPage = p === '/admin/mfa';

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (isLoginPage && !user) return res;

  if (!user) {
    if (p.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  const { data: admin, error } = await sb
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !admin) {
    if (p.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/admin/login?denied=1', req.url));
  }

  // Require a verified TOTP factor and an AAL2 session for every admin page
  // and API route. The MFA setup/challenge page is the only exception.
  const [{ data: factors, error: factorsError }, { data: assurance, error: assuranceError }] =
    await Promise.all([
      sb.auth.mfa.listFactors(),
      sb.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

  const hasVerifiedTotp = !factorsError && Boolean(
    factors?.totp?.some((factor) => factor.status === 'verified')
  );
  const hasAal2 = !assuranceError && assurance?.currentLevel === 'aal2';
  const mfaSatisfied = hasVerifiedTotp && hasAal2;

  if (isMfaPage) {
    if (mfaSatisfied) return NextResponse.redirect(new URL('/admin', req.url));
    return res;
  }

  if (!mfaSatisfied) {
    if (p.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'MFA_REQUIRED', message: 'Complete authenticator verification to continue.' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/admin/mfa', req.url));
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
