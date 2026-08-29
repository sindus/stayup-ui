import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // The self-hosting guide was split into /docs/install and /docs/admin.
      { source: '/docs/self-hosting', destination: '/docs/install', permanent: true },
    ]
  },
}

export default config
