const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const isDev = process.env.NODE_ENV !== 'production'

// No third-party scripts/iframes on the site (Ko-fi is a plain link), so
// this can stay strict. 'unsafe-eval' is only needed for Next's dev-mode
// HMR/React Refresh — production bundles don't use eval. 'unsafe-inline'
// on script-src is required in both: the App Router streams RSC/hydration
// data via inline <script>self.__next_f.push(...)</script> tags on every
// page — without it those are blocked, React never hydrates, and pages
// render as a dead/blank shell. Tightening this properly means wiring up
// per-request CSP nonces (a bigger, separate change); 'unsafe-inline' is
// the same tradeoff already accepted below for style-src.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'", // Tailwind + Next inject inline styles
  "img-src 'self' data: https:",
  "font-src 'self'", // next/font self-hosts at build time
  `connect-src 'self'${supabaseUrl ? ` ${supabaseUrl}` : ''}`,
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: csp },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.knownissues.co.uk',
        pathname: '/api/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/images/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
};

export default nextConfig;
