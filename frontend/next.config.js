/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir is now stable and enabled by default in Next.js 13+
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
