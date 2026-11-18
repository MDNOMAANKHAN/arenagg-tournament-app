let supabaseOrigin = 'https://*.supabase.co';\ntry {\n  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {\n    supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;\n  }\n} catch {\n  // Keep a safe default if the build environment has no valid Supabase URL.\n}
const supabaseRealtimeOrigin = supabaseOrigin.replace(/^https:/, 'wss:');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      `connect-src 'self' ${supabaseOrigin} ${supabaseRealtimeOrigin}`,
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const privateHeaders = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  { key: 'Cache-Control', value: 'no-store, max-age=0' },
];

module.exports = {
  output: 'standalone',
  images: { formats: ['image/avif', 'image/webp'] },
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/admin/:path*', headers: privateHeaders },
      { source: '/api/admin/:path*', headers: privateHeaders },
      { source: '/register/:path*', headers: privateHeaders },
    ];
  },
};
