import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/index.html',
        permanent: false,
      },
      {
        source: '/generator',
        destination: '/index.html',
        permanent: false,
      },
    ]
  },
}
export default nextConfig
