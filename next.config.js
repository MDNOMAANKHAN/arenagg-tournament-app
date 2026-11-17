const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

const noIndexHeaders = [
  { key: 'X-Robots-Tag', value: 'noindex, follow' },
];

const privateHeaders = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  { key: 'Cache-Control', value: 'no-store, max-age=0' },
];

module.exports = {
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/admin/:path*', headers: privateHeaders },
      { source: '/api/admin/:path*', headers: privateHeaders },
      { source: '/tournaments', headers: noIndexHeaders },
      { source: '/tournaments/:path*', headers: noIndexHeaders },
      { source: '/register/:path*', headers: privateHeaders },
    ];
  },
};
