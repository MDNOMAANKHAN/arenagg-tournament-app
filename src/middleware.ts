
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
          list.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });

          res = NextResponse.next({ request: req });

          list.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await sb.auth.getUser();

  const p = req.nextUrl.pathname;

  if (!user && p !== '/admin/login') {
    if (p.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.redirect(
      new URL('/admin/login', req.url)
    );
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
