/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*', // The URL will show /blog/:slug but will serve content from /articles/:slug
      }
    ]
  },
}

module.exports = nextConfig
